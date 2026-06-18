# Submission Contents

| Item | Location |
|------|----------|
| Source code | This repository |
| README.md | [README.md](./README.md) |
| Architecture note | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| AI workflow note | [AI_WORKFLOW.md](./AI_WORKFLOW.md) |
| Live deployment | https://ajaia-product-nodsyj6el-analytics1hemanth-s-projects.vercel.app/ |
| This file | [SUBMISSION.md](./SUBMISSION.md) |

## Test Accounts

All accounts are pre-seeded. Select any user from the login screen:

- **Hemant** — hemanth@ajaia.ai
- **Alice** — alice@ajaia.ai
- **Bob** — bob@ajaia.ai
- **Carol** — carol@ajaia.ai

## How to Test Sharing

1. Login as Hemanth
2. Create a document, add formatted content
3. Click Share → select Bob → set to "view" → click Share
4. Open incognito window → login as Bob
5. Bob sees the doc under "Shared with Me"
6. Bob can view but cannot edit (view-only banner shown)

## Feature Status

### Working
- User login (DB-backed)
- Document create, rename, delete
- Rich text editing (bold, italic, underline, H1-H3, bullet/numbered lists)
- Auto-save with debounce
- File import (.txt and .md → new editable document)
- Document sharing with view/edit permissions
- Permission enforcement (view-only = no editing)
- Owned vs shared document sections on dashboard
- Persistent storage via Supabase PostgreSQL
- Deployed on Vercel

### Not Included (intentional scope cuts)
- Real authentication (mocked via user selection)
- .docx file import
- Real-time collaboration
- Document version history
- Link-based sharing