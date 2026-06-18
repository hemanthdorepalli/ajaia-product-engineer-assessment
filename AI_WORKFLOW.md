# AI Workflow Note

## Tools Used

- **Claude (Anthropic):** Primary AI assistant for architecture planning, code generation, and debugging
- **Cursor / VS Code:** Code editor with AI-assisted completions

## Where AI Materially Sped Up Work

- **Prisma schema design:** Claude generated the initial User/Document/Share schema. Saved ~20 minutes of manual modeling.
- **API route scaffolding:** CRUD endpoints for documents and sharing were drafted by AI, then reviewed and adjusted for Next.js 16 App Router patterns (async params, route handler signatures).
- **TipTap editor setup:** AI provided the base editor component with toolbar. Saved significant time on ProseMirror API research.
- **CSS debugging:** Editor text was nearly invisible due to Tailwind reset conflicts. AI diagnosed the issue and provided ProseMirror-specific CSS overrides.
- **Vercel deployment fix:** Prisma generate error on Vercel was identified and fixed in under a minute with AI guidance.

## What I Changed or Rejected

- **Prisma 7 configuration:** AI initially generated Prisma 7 syntax. After migration errors, I downgraded to Prisma 5 for stability — AI had assumed the latest version without checking compatibility.
- **Auth complexity:** AI's first auth suggestion included refresh token rotation and JTI tracking. I rejected this as overengineered for a mocked-auth demo and simplified to a basic JWT cookie.
- **File upload scope:** AI suggested supporting .docx via Mammoth.js. I rejected this to avoid edge-case handling and scoped to .txt/.md only.
- **Editor toolbar:** Adjusted toolbar styling and active-state behavior after AI-generated version had inconsistent highlight states.

## How I Verified Correctness

- **Manual testing:** Every feature was tested end-to-end in the browser — document CRUD, sharing permissions (view vs edit enforcement), file import, and cross-user access.
- **Permission boundary testing:** Logged in as different users to verify that view-only users see the read-only banner and cannot save edits (403 response confirmed in Network tab).
- **Automated test:** Wrote a Vitest test confirming unauthenticated requests return 401 and non-existent documents return 404.
- **Deployment verification:** Every commit was pushed and verified on the live Vercel URL before moving to the next feature.
