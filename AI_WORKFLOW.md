# AI Workflow Note

## Tools Used

- **Claude (Anthropic)** — architecture planning, code scaffolding, debugging
- **VS Code** — primary code editor

## Where AI Materially Sped Up Work

- **Prisma schema design:** Generated the User/Document/Share schema with correct relations and unique constraints. Saved ~20 minutes of manual modeling.
- **API route scaffolding:** CRUD endpoints for documents and sharing were drafted by AI, then adjusted for Next.js 16 App Router conventions (async params, Promise-based route signatures).
- **TipTap editor integration:** AI provided the base editor component with a working toolbar. Saved significant time on ProseMirror API research.
- **CSS fix for editor text:** TipTap text was nearly invisible due to Tailwind's CSS reset. AI diagnosed the conflict and provided ProseMirror-specific style overrides.
- **netlify deployment fix:** Prisma Client generation error on netlify was diagnosed instantly — added `prisma generate` to the build script.

## What I Changed or Rejected

- **Prisma 7 → Prisma 5 downgrade:** AI initially generated Prisma 7 config syntax. After repeated migration errors with the new config format, I made the decision to downgrade to Prisma 5 for stability. AI had assumed latest version without checking real-world compatibility.
- **Over-engineered auth rejected:** AI first suggested refresh token rotation with JTI tracking and device validation. I rejected this as unnecessary for a mocked-auth assessment and simplified to a single JWT cookie.
- **Hardcoded users → DB fetch:** AI initially hardcoded the login user list in the frontend. I corrected this to fetch users from the database via a public API endpoint, which better demonstrates full-stack data flow.
- **.docx file upload rejected:** AI suggested supporting .docx via Mammoth.js. I rejected this due to unpredictable edge cases and scoped to .txt and .md with clear UI messaging.

## How I Verified Correctness

- **Manual end-to-end testing:** Every feature tested in browser — document CRUD, formatting persistence, file import, share/unshare, cross-user permission enforcement.
- **Permission boundary testing:** Logged in as different users to verify view-only users see read-only banner and receive 403 on edit attempts (confirmed in Network tab).
- **Automated tests:** Vitest tests verify seeded users exist and sharing permission logic works at the database layer.
- **Incremental deployment:** Every feature was pushed to netlify and verified on the live URL before moving to the next feature.