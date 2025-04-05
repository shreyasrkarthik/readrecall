import os
import json
import logging
from typing import List, Dict, Optional
from datetime import datetime
import requests
from dotenv import load_dotenv
from prisma import Prisma
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import tempfile
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class BookProcessor:
    def __init__(self):
        # Initialize Prisma client
        self.db = Prisma()
        self.temp_dir = tempfile.mkdtemp()
        
    async def connect(self):
        """Connect to the database"""
        try:
            await self.db.connect()
            logger.info("Connected to database successfully")
        except Exception as e:
            logger.error(f"Error connecting to database: {str(e)}")
            raise
    
    async def disconnect(self):
        """Disconnect from the database"""
        if self.db:
            await self.db.disconnect()
            logger.info("Disconnected from database")
    
    def count_words(self, text: str) -> int:
        """Count words in a text string"""
        return len(text.split())
    
    def clean_text(self, html_content: str) -> str:
        """Clean HTML content and extract meaningful text while preserving paragraphs"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for element in soup(['script', 'style']):
            element.decompose()
        
        # Replace paragraph tags with double newlines
        for p in soup.find_all('p'):
            p.replace_with('\n\n' + p.get_text() + '\n\n')
        
        # Replace other block elements with single newlines
        for tag in soup.find_all(['div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            tag.replace_with('\n' + tag.get_text() + '\n')
        
        # Get text
        text = soup.get_text()
        
        # Normalize newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove extra whitespace within lines but preserve paragraph breaks
        lines = text.split('\n')
        lines = [re.sub(r'\s+', ' ', line).strip() for line in lines]
        text = '\n'.join(lines)
        
        # Remove any remaining HTML entities
        text = re.sub(r'&[a-zA-Z]+;', '', text)
        
        # Ensure consistent paragraph breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = text.strip()
        
        return text
    
    async def process_book(self, book_id: str):
        """Process a book and create its sections"""
        try:
            # Get book from database
            book = await self.db.book.find_unique(
                where={"id": book_id}
            )
            
            if not book:
                logger.error(f"Book {book_id} not found in database")
                return
            
            if not book.epubUrl:
                logger.error(f"Book {book_id} has no EPUB URL")
                return
            
            logger.info(f"Processing book: {book.title}")
            
            # Download EPUB file
            response = requests.get(book.epubUrl)
            if response.status_code != 200:
                logger.error(f"Failed to download EPUB for book {book_id}")
                return
            
            # Save to temporary file
            temp_file = os.path.join(self.temp_dir, f"{book_id}.epub")
            with open(temp_file, 'wb') as f:
                f.write(response.content)
            
            # Read the EPUB file
            book_epub = epub.read_epub(temp_file)
            
            # Get spine items (main content)
            spine_items = book_epub.get_items_of_type(ebooklib.ITEM_DOCUMENT)
            
            # Process each section
            position = 0
            section_index = 0
            max_words_per_section = 5000  # Target size for each section
            
            for item in spine_items:
                content = item.get_content().decode('utf-8')
                logger.info(f"Raw content length: {len(content)}")
                
                cleaned_content = self.clean_text(content)
                logger.info(f"Cleaned content length: {len(cleaned_content)}")
                
                # Skip empty or very short sections
                if not cleaned_content or len(cleaned_content.strip()) < 50:
                    logger.info("Skipping short section")
                    continue
                
                # Split content into paragraphs
                paragraphs = [p for p in cleaned_content.split('\n\n') if p.strip()]
                logger.info(f"Found {len(paragraphs)} paragraphs")
                
                current_section = []
                current_word_count = 0
                
                for i, paragraph in enumerate(paragraphs):
                    paragraph_word_count = self.count_words(paragraph)
                    logger.info(f"Paragraph {i + 1} has {paragraph_word_count} words")
                    
                    # If adding this paragraph would exceed the target size, create a new section
                    if current_word_count + paragraph_word_count > max_words_per_section and current_word_count > 0:
                        # Create section with accumulated paragraphs
                        section_content = '\n\n'.join(current_section)
                        await self.db.booksection.create({
                            'bookId': book_id,
                            'title': f"Section {section_index + 1}",
                            'content': section_content,
                            'orderIndex': section_index,
                            'startPosition': position,
                            'endPosition': position + current_word_count
                        })
                        
                        logger.info(f"Created section {section_index + 1} for book {book.title} with {current_word_count} words")
                        
                        # Reset for next section
                        position += current_word_count
                        section_index += 1
                        current_section = [paragraph]
                        current_word_count = paragraph_word_count
                    else:
                        # Add paragraph to current section
                        current_section.append(paragraph)
                        current_word_count += paragraph_word_count
                
                # Create final section from remaining paragraphs
                if current_section:
                    section_content = '\n\n'.join(current_section)
                    await self.db.booksection.create({
                        'bookId': book_id,
                        'title': f"Section {section_index + 1}",
                        'content': section_content,
                        'orderIndex': section_index,
                        'startPosition': position,
                        'endPosition': position + current_word_count
                    })
                    
                    logger.info(f"Created section {section_index + 1} for book {book.title} with {current_word_count} words")
                    position += current_word_count
                    section_index += 1
            
            # Clean up temporary file
            os.remove(temp_file)
            
            logger.info(f"Completed processing book {book.title} with {section_index} sections")
            
        except Exception as e:
            logger.error(f"Error processing book {book_id}: {str(e)}")
            raise
    
    async def process_all_books(self):
        """Process all books in the database"""
        try:
            # First, clear existing sections
            await self.db.booksection.delete_many()
            logger.info("Cleared existing sections")
            
            # Get all books with EPUB URLs
            books = await self.db.book.find_many(
                where={
                    "epubUrl": {
                        "not": None
                    }
                }
            )
            
            for book in books:
                logger.info(f"Processing book: {book.id}")
                await self.process_book(book.id)
                
        except Exception as e:
            logger.error(f"Error processing books: {str(e)}")
            raise

async def main():
    """Main function to run the book processor"""
    processor = BookProcessor()
    
    try:
        await processor.connect()
        await processor.process_all_books()
    finally:
        await processor.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 