# Voyagr

Voyagr is a boutique travel advisor platform that helps travelers describe their ideal trip and helps advisors turn those preferences into polished, reusable, personalized itinerary recommendations.

**Tagline:** Tailored travel, built around the traveler.

## Overview

Voyagr is a full-stack MVP for a boutique travel advisor business. It has three core layers:

1. **Customer Intake** — A beautiful guided survey where travelers describe how they want their trip to feel, where they want to go, and what matters most to them.
2. **Admin Planning Dashboard** — The advisor logs in and manages leads, generates AI summaries, builds itineraries, creates proposals, and manages a destination knowledge base.
3. **Client-Facing Luxury Portal** — After the advisor prepares a trip, the customer views a polished "Your Trip Plan" experience.

## Features

### Customer-Facing
- Premium landing page with destination showcase, testimonials, FAQ
- 11-step guided trip survey with progress tracking
- Elegant thank-you page after submission

### Admin Dashboard
- Lead management CRM with status tracking
- AI-generated traveler summaries from survey data
- Trip versioning (multiple itinerary versions per lead)
- Side-by-side version comparison
- Proposal builder with internal/client-safe content
- Itinerary template library (12 templates with day-by-day plans)
- Trip collections (curated groupings)
- Past successful trips library
- Destination knowledge base (50+ entries)
- Saved hotels, restaurants, and experiences (40+ places)
- Seasonality notes
- Pricing estimate builder
- Templated email drafts
- Business settings

### Intelligence Layer
- Traveler profile generation from survey data
- Destination recommendation engine
- Template matching with scoring
- Pricing calculator with destination multipliers
- Portal content filtering (client-safe vs. internal)

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom premium theme
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Database:** PostgreSQL via Prisma ORM (Neon for production)
- **Authentication:** NextAuth.js with JWT
- **Validation:** Zod
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner (toast)

## Getting Started

### Option A: Deploy to Vercel (Recommended)

1. Create a free database at [neon.tech](https://neon.tech)
2. Import this repo on [vercel.com](https://vercel.com/new)
3. Add environment variables in Vercel:
   - `DATABASE_URL` = your Neon connection string
   - `NEXTAUTH_SECRET` = any strong random string
   - `NEXTAUTH_URL` = your Vercel URL (e.g. https://voyagr.vercel.app)
4. Deploy, then run seed: `npx prisma db push && npm run prisma:seed`

### Option B: Local Development with PostgreSQL

Prerequisites: Node.js 18+, a PostgreSQL database (free via [neon.tech](https://neon.tech))

```bash
npm install
# Set DATABASE_URL in .env to your Postgres connection string
npx prisma db push
npm run prisma:seed
npm run dev
```

### Option C: Local Development with SQLite

```bash
npm install
bash scripts/use-sqlite.sh  # switches schema to SQLite
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'NEXTAUTH_SECRET="dev-secret"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env
npx prisma generate && npx prisma db push
npm run prisma:seed
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Quick Setup (All-in-One, requires DATABASE_URL set)

```bash
npm install && npm run db:setup && npm run dev
```

## Demo Credentials

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@voyagr.com   | voyagr2024  |

## Project Structure

```
app/
  (public)/           # Customer-facing pages
    page.tsx          # Landing page
    survey/           # Multi-step trip survey
    portal/[slug]/    # Client trip portal
    thank-you/        # Post-survey confirmation
  (admin)/            # Admin dashboard (auth required)
    dashboard/        # KPI overview
    leads/            # Lead CRM
    proposals/        # Proposal management
    templates/        # Itinerary templates
    collections/      # Trip collections
    past-trips/       # Completed trips
    destinations/     # Knowledge base
    places/           # Saved hotels/restaurants/experiences
    emails/           # Email templates
    settings/         # Business configuration
  (auth)/             # Authentication
    login/            # Admin sign-in
  api/
    auth/             # NextAuth endpoints
    survey/submit/    # Survey submission API

components/
  admin/              # Admin-specific components
  layout/             # Navbar, Footer, Sidebar, Header
  providers/          # Session provider
  ui/                 # shadcn/ui components

lib/
  auth.ts             # NextAuth configuration
  db.ts               # Prisma client singleton
  itinerary-generator.ts  # Traveler summary generation
  destination-recommender.ts  # Destination scoring
  template-matcher.ts     # Template matching engine
  pricing-calculator.ts   # Pricing estimates
  portal-filter.ts        # Client-safe content filtering
  utils.ts                # Utility functions

prisma/
  schema.prisma       # Database schema
  seed.ts             # Demo data seed script
```

## Key User Flows

1. **Customer** visits landing page → fills out trip survey → receives thank-you confirmation
2. **Advisor** logs in → views leads → opens lead detail → sees AI summary → creates trip versions → builds proposal → publishes to client portal
3. **Customer** receives portal link → views polished trip plan

## Demo Data

The seed script creates realistic demo data including:
- 15 customer leads across all statuses
- 12 itinerary templates (Iceland, Paris, Italy, Greece, Switzerland, etc.)
- 8 past successful trips with testimonials
- 6 curated trip collections
- 50+ destination knowledge entries
- 40+ saved places (hotels, restaurants, experiences)
- Full pricing estimates, proposals, and portal pages

## Brand Direction

- Boutique luxury travel aesthetic
- Navy (#1e3a5f), Gold (#c9a84c), Sand (#f5efe6) color palette
- Playfair Display for headings, Inter for body text
- Large accessible inputs and click targets
- Generous spacing and readable typography

## What's Mocked vs. Production-Ready

### Production-Ready
- Full database schema and ORM
- Authentication with role support
- Survey submission and lead creation
- Admin CRUD for all entities
- Responsive UI throughout
- Client portal rendering

### Mocked / MVP Placeholder
- AI traveler summary uses rule-based logic (architected for LLM integration)
- Email templates are internal drafting tools (no actual sending)
- Pricing estimates are rough ranges (not connected to live pricing)
- Template matching uses weighted scoring (could upgrade to ML)
- Client portal sharing is via direct URL (no email delivery)

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"  # or http://localhost:3000 for local
```

## License

Private — built for Voyagr Travel.
