# GhostLoad Backend API

> Off-hours energy waste estimation engine for small offices.
> Built with Node.js + Express + Prisma + PostgreSQL.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to DB (dev)
npm run db:push

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

## API Base URL
`http://localhost:5000`

## Health Check
`GET /health`

## Auth
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Current user |
| POST | /api/orgs | Create organization |
| GET  | /api/sites?orgId= | List sites |
| POST | /api/sites | Create site |
| PUT  | /api/sites/:siteId/schedule | Set schedule |
| POST | /api/sites/:siteId/bills | Add utility bill |
| POST | /api/sites/:siteId/equipment | Add equipment |
| POST | /api/analyses/:siteId/analyze | Run analysis |
| GET  | /api/analyses/:analysisId | Get analysis |
| POST | /api/analyses/:analysisId/scenarios | Simulate scenario |

## Demo Credentials (after seeding)
- Email: `demo@ghostload.app`
- Password: `Password123`

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma v7
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, rate-limiting, bcryptjs
