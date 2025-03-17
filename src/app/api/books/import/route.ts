import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/db';

export async function POST() {
    try {
        // Read the uploaded_books.json file
        const filePath = path.join(process.cwd(), 'scripts', 'uploaded_books.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const books = JSON.parse(fileContent);
        
        const results = {
            success: 0,
            errors: [] as string[]
        };
        
        // Import each book
        for (const book of books) {
            try {
                // Check if book already exists
                const existingBook = await prisma.book.findFirst({
                    where: {
                        title: book.title,
                        author: book.author
                    }
                });
                
                if (existingBook) {
                    results.errors.push(`Book "${book.title}" already exists`);
                    continue;
                }
                
                // Create book in database
                await prisma.book.create({
                    data: {
                        title: book.title,
                        author: book.author,
                        coverUrl: book.coverUrl,
                        epubUrl: book.epubUrl,
                        isPublicDomain: book.isPublicDomain
                    }
                });
                
                results.success++;
            } catch (error) {
                results.errors.push(`Error importing "${book.title}": ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        
        return NextResponse.json({
            message: `Import complete! ${results.success} books imported to database`,
            results
        });
        
    } catch (error) {
        return NextResponse.json(
            { error: `Error importing books: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
} 