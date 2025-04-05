import os
import json
import logging
from typing import List, Dict, Optional
from datetime import datetime
import aiohttp
from dotenv import load_dotenv
from prisma import Prisma
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SummaryGenerator:
    def __init__(self):
        self.api_key = os.getenv('HUGGING_FACE_API_KEY')
        if not self.api_key:
            raise ValueError("HUGGING_FACE_API_KEY not found in environment variables")
        
        self.model_url = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-6-6"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Initialize Prisma client
        self.db = Prisma()
        
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
    
    async def get_text_at_position(self, book_id: str, position: int, window_size: int = 1000) -> str:
        """Get text content around a specific position using a sliding window approach."""
        try:
            # Get sections that contain the target position
            sections = await self.db.booksection.find_many(
                where={
                    "bookId": book_id,
                    "startPosition": {
                        "lte": position + window_size
                    },
                    "endPosition": {
                        "gte": position - window_size
                    }
                },
                order={
                    "startPosition": "asc"
                }
            )
            
            if not sections:
                return ""
            
            # Combine sections and extract the relevant window
            text = ""
            for section in sections:
                text += section.content + "\n"
            
            # Split into words and get the window around the target position
            words = text.split()
            start_idx = max(0, position - window_size)
            end_idx = min(len(words), position + window_size)
            
            return " ".join(words[start_idx:end_idx])
            
        except Exception as e:
            logging.error(f"Error getting text at position: {str(e)}")
            return ""
    
    async def generate_summary(self, content: str, book_id: str, max_words: int = 250) -> str:
        """Generate a summary of the given content using the Hugging Face API."""
        try:
            # Prepare the request
            payload = {
                "inputs": content,
                "parameters": {
                    "max_length": max_words * 2,  # Allow some buffer for tokenization
                    "min_length": 50,
                    "do_sample": False,
                    "num_beams": 4,
                    "length_penalty": 1.0,
                    "early_stopping": True
                }
            }
            
            # Make the API request with retries
            max_retries = 3
            retry_delay = 2  # seconds
            
            async with aiohttp.ClientSession() as session:
                for attempt in range(max_retries):
                    try:
                        async with session.post(
                            self.model_url,
                            headers=self.headers,
                            json=payload,
                            timeout=30
                        ) as response:
                            if response.status == 200:
                                result = await response.json()
                                if isinstance(result, list) and len(result) > 0:
                                    summary = result[0].get("summary_text", "").strip()
                                    # Ensure the summary doesn't exceed max_words
                                    words = summary.split()
                                    if len(words) > max_words:
                                        summary = " ".join(words[:max_words]) + "..."
                                    return summary
                                else:
                                    logger.error("Unexpected API response format")
                                    return None
                            elif response.status == 503:
                                # Model is loading, wait and retry
                                if attempt < max_retries - 1:
                                    logger.warning(f"Model is loading, retrying in {retry_delay} seconds...")
                                    await asyncio.sleep(retry_delay)
                                    continue
                            else:
                                error_text = await response.text()
                                logger.error(f"API request failed with status code {response.status}: {error_text}")
                                return None
                    except Exception as e:
                        if attempt < max_retries - 1:
                            logger.warning(f"Request failed, retrying in {retry_delay} seconds...")
                            await asyncio.sleep(retry_delay)
                            continue
                        logger.error(f"Error generating summary: {str(e)}")
                        return None
            
            return None

        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return None
    
    async def process_book(self, book_id: str):
        """Process a book and generate summaries at percentage intervals."""
        try:
            # Get the book and its total word count
            book = await self.db.book.find_unique(where={"id": book_id})
            if not book:
                logger.error(f"Book not found: {book_id}")
                return
            
            # Get the last section to determine total word count
            last_section = await self.db.booksection.find_first(
                where={"bookId": book_id},
                order={"endPosition": "desc"}
            )
            if not last_section:
                logger.error(f"No sections found for book: {book_id}")
                return
            
            total_words = last_section.endPosition
            
            # Create initial summary at position 0
            initial_summary = await self.generate_summary("", book_id)
            if initial_summary:
                await self.db.summary.create({
                    "bookId": book_id,
                    "position": 0,
                    "content": initial_summary
                })
                logger.info(f"Created initial summary for book {book_id}")
            
            # Generate summaries at 10% intervals
            for percentage in range(10, 101, 10):
                target_position = int(total_words * percentage / 100)
                try:
                    # Get content around the target position
                    content = await self.get_text_at_position(book_id, target_position)
                    if not content:
                        logger.warning(f"No content found at {percentage}% for book {book_id}")
                        continue
                    
                    # Generate summary for this chunk
                    summary = await self.generate_summary(content, book_id)
                    if summary:
                        await self.db.summary.create({
                            "bookId": book_id,
                            "position": target_position,
                            "content": summary
                        })
                        logger.info(f"Created summary at {percentage}% for book {book_id}")
                except Exception as e:
                    logger.error(f"Error generating summary at {percentage}%: {str(e)}")
                    continue
            
            logger.info(f"Completed processing book {book_id}")
        except Exception as e:
            logger.error(f"Error processing book {book_id}: {str(e)}")
    
    async def process_all_books(self):
        """Process all books in the database."""
        try:
            # Clear existing summaries
            await self.db.summary.delete_many()
            logger.info("Cleared existing summaries")
            
            # Get all books
            books = await self.db.book.find_many()
            
            # Process each book
            for book in books:
                logger.info(f"Processing book: {book.id}")
                await self.process_book(book.id)
                
        except Exception as e:
            logger.error(f"Error processing books: {str(e)}")
        finally:
            await self.db.disconnect()
            logger.info("Disconnected from database")

async def main():
    """Main function to run the summary generator"""
    generator = SummaryGenerator()
    
    try:
        await generator.connect()
        await generator.process_all_books()
    finally:
        await generator.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 