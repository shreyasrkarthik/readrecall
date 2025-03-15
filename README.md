# ReadRecall

Smart summaries that stop at your bookmark. ReadRecall helps you remember what happened in your books by providing AI-generated summaries and character information, limited to what you've read so far.

## Features

- 📚 Upload your own EPUB books or choose from public domain classics
- 🤖 AI-generated summaries up to your current reading position
- 👥 Character tracking with descriptions limited to what you've encountered
- 📖 Built-in EPUB reader with progress tracking
- 🔒 Secure authentication and user data management

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, FastAPI (for AI processing)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google provider
- **Storage**: Cloudinary for file storage
- **AI**: OpenAI GPT for summaries and character analysis

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/readrecall.git
   cd readrecall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
     - Database connection
     - Authentication credentials
     - OpenAI API key
     - Cloudinary credentials

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
readrecall/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── books/            # Book-related pages
│   │   └── api/              # API routes
│   ├── components/            # React components
│   │   ├── BookReader/       # EPUB reader components
│   │   ├── Summary/          # Summary components
│   │   └── Characters/       # Character info components
│   ├── lib/                  # Utility functions
│   │   ├── db/              # Database utilities
│   │   ├── ai/              # AI-related functions
│   │   └── epub/            # EPUB processing utilities
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
└── public/                   # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
