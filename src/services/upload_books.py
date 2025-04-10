import os
import requests
import json
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import tempfile
from ebooklib import epub
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Popular books from Project Gutenberg
BOOKS = [
    {"id": 1342, "title": "Pride and Prejudice", "author": "Jane Austen"},
    {"id": 11, "title": "Alice's Adventures in Wonderland", "author": "Lewis Carroll"},
    {"id": 84, "title": "Frankenstein", "author": "Mary Wollstonecraft Shelley"},
    {"id": 1661, "title": "The Adventures of Sherlock Holmes", "author": "Arthur Conan Doyle"},
    {"id": 74, "title": "The Adventures of Tom Sawyer", "author": "Mark Twain"},
    {"id": 2701, "title": "Moby Dick", "author": "Herman Melville"},
    {"id": 1952, "title": "The Yellow Wallpaper", "author": "Charlotte Perkins Gilman"},
    {"id": 98, "title": "A Tale of Two Cities", "author": "Charles Dickens"},
    {"id": 1232, "title": "The Prince", "author": "Niccolò Machiavelli"},
    {"id": 174, "title": "The Picture of Dorian Gray", "author": "Oscar Wilde"}
]

def get_gutenberg_text(book_id):
    """Get book text from Project Gutenberg."""
    url = f"https://www.gutenberg.org/files/{book_id}/{book_id}-0.txt"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        
        # Try alternative URL format
        url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        
        return None
    except Exception as e:
        print(f"Error fetching book {book_id}: {str(e)}")
        return None

def create_epub(book_id, title, author, text):
    """Create an EPUB file from text."""
    if not text:
        return None
    
    try:
        # Create EPUB file
        book = epub.EpubBook()
        book.set_identifier(f'gutenberg{book_id}')
        book.set_title(title)
        book.set_language('en')
        book.add_author(author)
        
        # Add content
        c1 = epub.EpubHtml(title='Content', file_name='content.xhtml', lang='en')
        c1.content = f'<html><body><h1>{title}</h1><p style="white-space: pre-wrap;">{text}</p></body></html>'
        book.add_item(c1)
        
        # Add navigation
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        book.spine = ['nav', c1]
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.epub')
        epub.write_epub(temp_file.name, book)
        
        return temp_file.name
    except Exception as e:
        print(f"Error creating EPUB: {str(e)}")
        return None

def get_cover_image(title, author):
    """Get a cover image using the OpenLibrary API."""
    query = f"{title} {author}".replace(" ", "+")
    url = f"https://openlibrary.org/search.json?q={query}"
    response = requests.get(url)
    data = response.json()
    
    if data["docs"] and "cover_i" in data["docs"][0]:
        cover_id = data["docs"][0]["cover_i"]
        cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
        response = requests.get(cover_url)
        return BytesIO(response.content)
    return None

def upload_book(book):
    """Upload a book and its cover to Cloudinary."""
    try:
        print(f"\nProcessing: {book['title']} by {book['author']}")
        
        # Get book text
        text = get_gutenberg_text(book['id'])
        if not text:
            print(f"❌ Could not fetch text for {book['title']}")
            return None
        
        # Get and upload cover image
        cover_image = get_cover_image(book['title'], book['author'])
        if cover_image:
            cover_result = cloudinary.uploader.upload(
                cover_image,
                folder="book-covers",
                public_id=f"cover-{book['id']}",
                resource_type="image"
            )
            cover_url = cover_result['secure_url']
            print(f"✅ Cover uploaded: {cover_url}")
        else:
            cover_url = None
            print("⚠️ No cover image found")
        
        # Create and upload EPUB
        epub_path = create_epub(book['id'], book['title'], book['author'], text)
        if epub_path:
            try:
                epub_result = cloudinary.uploader.upload(
                    epub_path,
                    folder="books",
                    public_id=f"book-{book['id']}",
                    resource_type="raw"
                )
                epub_url = epub_result['secure_url']
                print(f"✅ EPUB uploaded: {epub_url}")
                
                # Clean up temporary file
                os.unlink(epub_path)
                
                return {
                    "title": book['title'],
                    "author": book['author'],
                    "coverUrl": cover_url,
                    "epubUrl": epub_url,
                    "isPublicDomain": True
                }
            except Exception as e:
                print(f"❌ Error uploading EPUB: {str(e)}")
                if os.path.exists(epub_path):
                    os.unlink(epub_path)
                return None
        else:
            print(f"❌ Could not create EPUB for {book['title']}")
            return None
        
    except Exception as e:
        print(f"❌ Error processing {book['title']}: {str(e)}")
        return None

def main():
    print("Starting book upload process...")
    results = []
    
    for book in BOOKS:
        result = upload_book(book)
        if result:
            results.append(result)
    
    # Save results to JSON file
    with open('uploaded_books.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Upload complete! {len(results)} books processed")
    print("Results saved to uploaded_books.json")

if __name__ == "__main__":
    main() 