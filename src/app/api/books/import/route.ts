import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Read the JSON file
        const filePath = path.join(process.cwd(), 'scripts', 'uploaded_books.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const books = JSON.parse(fileContent);

        const results = [];
        for (const book of books) {
            try {
                // Create book in database
                const createdBook = await prisma.book.create({
                    data: {
                        title: book.title,
                        author: book.author,
                        coverUrl: book.coverUrl,
                        epubUrl: book.epubUrl,
                        isPublicDomain: book.isPublicDomain,
                        sections: {
                            create: [{
                                order: 0,
                                title: book.title,
                                content: '',  // Content will be processed when reading the book
                                startPosition: 0,
                                endPosition: 0
                            }]
                        }
                    }
                });
                results.push({ success: true, title: book.title });
            } catch (err) {
                const error = err as Error;
                results.push({ success: false, title: book.title, error: error.message });
            }
        }

        return NextResponse.json({
            message: `Import complete! ${results.filter(r => r.success).length} books imported`,
            results
        });

    } catch (err) {
        const error = err as Error;
        console.error('Error importing books:', error);
        return NextResponse.json(
            { error: 'Failed to import books: ' + error.message },
            { status: 500 }
        );
    }
} 