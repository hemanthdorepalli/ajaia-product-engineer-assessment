# Architecture Note

## Stack

- **Frontend:** Next.js 16 (App Router), TipTap rich text editor, Tailwind CSS
- **Backend:** Next.js API Routes (no separate server)
- **Database:** Supabase PostgreSQL via Prisma 5
- **Auth:** Mocked login with JWT httpOnly cookies
- **Deployment:** netlify

## Data Model

Three tables: User, Document, Share.

- **User** — seeded accounts (Hemanth, Alice, Bob, Carol) for demo
- **Document** — title + TipTap JSON content, linked to owner via ownerId
- **Share** — join table (docId + userId + permission). Unique constraint on [docId, userId]

## Key Decisions

**Next.js API routes as backend:** Single deployment on netlify. No separate Express server needed. Reduces infra complexity for this scope.

**Mocked auth over real auth:** Brief allows simulated users. OAuth/email-password would take 1-2 hours with zero product value for this demo. JWT cookie still enforces per-request authorization on every API route.

**TipTap JSON over HTML storage:** Storing editor state as JSON preserves document structure for future features like version diffing and real-time sync via Yjs. HTML storage would require round-trip parsing.

**API-level permission enforcement:** Every document endpoint checks ownership or share record before returning data. View-only users get 403 on PUT. Owner-only actions (delete, share) are gated separately.

**No .docx import:** Scoped file upload to .txt and .md only. Mammoth.js handles basic docx but edge cases (nested tables, images, complex formatting) would consume disproportionate time. Stated clearly in UI.

**Auto-save with 1s debounce:** No manual save button. Content saves automatically after 1 second of inactivity. Matches modern editor UX expectations (Google Docs, Notion).

## What I Would Build Next (2-4 hours)

1. Real-time collaboration via Yjs + WebSocket
2. Document version history with timestamp snapshots
3. Export to PDF and Markdown
4. Proper authentication via NextAuth.js
5. Link-based sharing with permission tokens