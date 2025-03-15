import json
import asyncio
from prisma import Prisma

async def import_books():
    print("Starting database import process...")
    
    # Initialize Prisma client
    db = Prisma()
    await db.connect()
    
    try:
        # Read the JSON file
        with open('uploaded_books.json', 'r') as f:
            books = json.load(f)
        
        imported_count = 0
        for book in books:
            try:
                # Create book in database
                created_book = await db.book.create(
                    data={
                        'title': book['title'],
                        'author': book['author'],
                        'coverUrl': book['coverUrl'],
                        'epubUrl': book['epubUrl'],
                        'isPublicDomain': book['isPublicDomain'],
                        'sections': {
                            'create': [{
                                'order': 0,
                                'title': book['title'],
                                'content': '',  # Content will be processed when reading the book
                                'startPosition': 0,
                                'endPosition': 0
                            }]
                        }
                    }
                )
                print(f"✅ Imported: {book['title']}")
                imported_count += 1
                
            except Exception as e:
                print(f"❌ Error importing {book['title']}: {str(e)}")
                continue
        
        print(f"\n✅ Import complete! {imported_count} books imported to database")
    
    except Exception as e:
        print(f"❌ Error reading uploaded_books.json: {str(e)}")
    
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(import_books()) 