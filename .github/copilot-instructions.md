# Copilot Instructions - SaaS Note-Taking App

## Project Overview
Next.js TypeScript SaaS note-taking application with user authentication, PostgreSQL database, and file upload capabilities.

## Key Features
- User authentication with bcryptjs password hashing
- PostgreSQL database with Prisma ORM
- File upload support 
- Note CRUD operations
- User workspace management
- Tailwind CSS responsive UI

## Setup Progress
- [x] Scaffold Next.js project with TypeScript
- [x] Setup authentication system (Login/Register API)
- [x] Setup database schema (Prisma PostgreSQL)
- [x] Setup file uploads (Attachments API)
- [x] Create core features (Notes, Dashboard, Editor)
- [x] Install dependencies (438 packages)
- [x] Generate Prisma Client
- [x] Create development batch file
- [x] Documentation complete

## Quick Start

### Prerequisites
- Node.js 18+ (already installed)
- PostgreSQL database

### 1. Database Setup
You need to set up a PostgreSQL database. Choose one:

**Option A: Local PostgreSQL**
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Create database: `createdb saas_notes`

**Option B: Hosted (Recommended)**
- Use Railway.app, Supabase, or similar service
- Get connection string

### 2. Configure Environment Variables
Edit `.env.local` with your database connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/saas_notes"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key"
```

### 3. Initialize Database
```
npm run db:push
```

### 4. Start Development Server
```
npm run dev
```
Or double-click: `dev.bat`

App runs at http://localhost:3000

## Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run db:push` - Update database schema
- `npm run db:studio` - Open Prisma Studio GUI

## Project Structure
```
src/
├── app/
│   ├── api/auth/ (Login/Register endpoints)
│   ├── api/notes/ (CRUD operations)
│   ├── api/upload/ (File attachments)
│   ├── dashboard/ (Dashboard page)
│   ├── notes/[id]/ (Note editor)
│   ├── login/ & register/ (Auth pages)
├── lib/
│   ├── auth.ts (NextAuth config)
│   ├── prisma.ts (Database client)
│   └── validations.ts (Zod schemas)
prisma/
└── schema.prisma (Database models)
