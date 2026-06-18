# Architecture Note

## Stack Choice

Next.js App Router serves both frontend and API routes, eliminating the need for a separate backend service. This reduces deployment complexity and keeps the project within a single Vercel deployment.

Prisma 5 with Supabase PostgreSQL provides type-safe database access with a clear schema. TipTap (ProseMirror-based) handles rich text editing with JSON-serializable document state, making persistence straightforward.

## Data Model

Three tables: User, Document, Share.

- **User**: Seeded accounts (Alice, Bob, Carol) for demo purposes
- **Document**: Stores title and TipTap JSON content, linked to an owner
- **Share**: Join table with docId + userId + permission (view/edit), enforced at the API layer

## Key Decisions

**Mocked auth over real auth:** The brief allows simulated users. Building OAuth or email/password auth would consume 1-2 hours with zero product value for this demo. JWT cookie still enforces per-request authorization.

**TipTap JSON over HTML storage:** Storing editor state as JSON preserves structure for future features (version diffing, real-time sync via Yjs). HTML storage would require round-trip parsing.

**API-level permission enforcement:** Every document endpoint checks ownership or share permission before returning data. View-only users receive a 403 on PUT requests. This is validated by the automated test.

**No .docx import:** Mammoth.js handles basic docx conversion but edge cases (nested tables, images, complex lists) would consume disproportionate time. Scoped to .txt and .md with clear UI messaging.

**Auto-save with debounce:** 1-second debounce on editor changes triggers a PUT to /api/documents/[id]. No manual save button needed — matches modern editor UX expectations.

## What I'd Prioritize Next

1. Yjs integration for real-time collaborative editing
2. Document version history with timestamp-based snapshots
3. Export to PDF and Markdown
4. Proper authentication via NextAuth
5. Role-based sharing with link-based invite tokens
