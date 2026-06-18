# Ajaia Docs — Collaborative Document Editor

A lightweight collaborative document editor built as part of the Ajaia Full Stack Product Engineer assessment.

**Live URL:** https://ajaia-product-nodsyj6el-analytics1hemanth-s-projects.vercel.app/

## Test Accounts

| User  | Email            | Login              |
|-------|------------------|--------------------|
| Hemanth | hemanth@ajaia.ai   | Select from dropdown |
| Alice | alice@ajaia.ai   | Select from dropdown |
| Bob   | bob@ajaia.ai     | Select from dropdown |
| Carol | carol@ajaia.ai   | Select from dropdown |

## What Works

- Document creation, renaming, and deletion
- Rich text editing (bold, italic, underline, H1-H3, bullet/numbered lists)
- Auto-save with 1s debounce
- File import (.txt and .md → new editable document)
- Document sharing with view/edit permissions
- Permission enforcement (view-only users cannot edit)
- Owned vs shared document distinction on dashboard
- Persistent storage via Supabase PostgreSQL

## What's Partial / Not Included

- No real authentication (mocked login via user selection)
- No .docx file import (limited to .txt and .md)
- No real-time collaboration
- No document version history
- No link-based sharing (share by selecting a user)

## What I'd Build Next (2-4 hours)

- Real-time collaboration via Yjs + WebSocket
- Export to PDF/Markdown
- Document version history with diff view
- Link-based sharing with permission tokens
- Proper auth with email/password or OAuth

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TipTap, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL via Prisma 5
- **Deployment:** Vercel

## Local Setup

```bash
git clone https://github.com/hemanthdorepalli/ajaia-product-engineer-assessment.git
cd ajaia-product-engineer-assessment/ajaia-docs
npm install
```

Create `.env`:

```
DATABASE_URL="postgresql://postgres.bbxgljgwaqkwjrpeskpj:%2A8Sn3%2FigQzX7Mxn@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.bbxgljgwaqkwjrpeskpj:%2A8Sn3%2FigQzX7Mxn@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

Run:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000

## Tests

```bash
npm test
```

