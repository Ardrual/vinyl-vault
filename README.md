# Vinyl Vault

A personal vinyl record collection manager built with modern web technologies. Manage your record collection with ease by adding records manually or using AI-powered album cover recognition.

## Features

- **Manual Record Entry**: Add records to your collection with detailed information including artist, album, year, genre, label, and more
- **AI-Powered Scanning**: Upload a photo of an album cover and let AI automatically extract record information
- **Collection Browser**: View and manage your entire vinyl collection in one place
- **User Authentication**: Secure user accounts with Stack Auth
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: [Neon Database](https://neon.tech/) (PostgreSQL)
- **Authentication**: [Stack Auth](https://stack-auth.com/)
- **AI**: XAI for album cover recognition
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or later
- pnpm (recommended) or npm
- A Neon Database account
- A Stack Auth account
- An XAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ardrual/vercel-record-collection.git
cd vercel-record-collection
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Database
DATABASE_URL=your_neon_database_url

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# XAI
XAI_API_KEY=your_xai_api_key
```

4. Set up the database:
Run the SQL scripts in the `scripts/` directory in order:
```bash
# Run against your Neon database
psql $DATABASE_URL -f scripts/001-create-records-table.sql
psql $DATABASE_URL -f scripts/002-add-database-indexes.sql
psql $DATABASE_URL -f scripts/003-add-user-association.sql
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build

Build the application for production:
```bash
pnpm build
```

### Lint

Run the linter:
```bash
pnpm lint
```

## Deployment

This application is designed to be deployed on [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the required environment variables
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── add-record/     # Manual record entry page
│   ├── upload-photo/   # AI photo upload page
│   ├── record/         # Individual record pages
│   └── api/            # API routes
├── components/         # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── scripts/            # Database migration scripts
└── styles/             # Global styles
```

## License

This project is private and not licensed for public use.
