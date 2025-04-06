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
- **Backend**: Next.js API Routes
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
   ```bash
   cp .env.example .env
   ```
   - Fill in your environment variables:
     - `DATABASE_URL`: PostgreSQL connection string (you can use services like [Neon.tech](https://neon.tech/) for a serverless database)
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Get from [Google Cloud Console](https://console.cloud.google.com/) (OAuth credentials)
     - `OPENAI_API_KEY`: Get from [OpenAI](https://platform.openai.com/api-keys)
     - `CLOUDINARY_*`: Get from [Cloudinary Dashboard](https://cloudinary.com/console/)

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

## Database Setup

For a quick PostgreSQL setup, we recommend using [Neon.tech](https://neon.tech/), which provides a free serverless PostgreSQL database.

1. Create an account on Neon.tech
2. Create a new project and database
3. Get the connection string and add it to your .env file as `DATABASE_URL`
4. Run the Prisma schema push:
   ```bash
   npx prisma db push
   ```

## Authentication Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Navigate to "APIs & Services" > "Credentials"
4. Create an "OAuth client ID" with:
   - Authorized JavaScript origins: `http://localhost:3000` (and your production URL)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and production equivalent)
5. Copy the Client ID and Client Secret to your .env file

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
