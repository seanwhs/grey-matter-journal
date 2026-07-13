# GreyMatter Journal

A high-performance personal tech blog engineered for speed, scalability, and seamless content workflows. The platform focuses on software engineering, AI systems, architecture, and modern web development practices.

**Live Site:** https://grey-matter-journal.vercel.app/

***

## Project Overview

GreyMatter Journal is built as a production-grade content platform that balances developer experience with runtime performance. It leverages a modern headless architecture to enable fast content delivery, structured authoring, and scalable feature expansion.

Key design goals:
- Fast page loads with minimal client-side overhead  
- Clean separation between content, presentation, and authentication  
- Scalable architecture for premium content and gated access  
- Maintainable, strongly-typed codebase for long-term evolution  

***

## Tech Stack

**Framework**: Next.js 16 (App Router, React 19)  
**CMS**: Sanity v6 (Headless CMS)  
**Authentication**: Clerk (Modal gating, protected content)  
**Styling**: Tailwind CSS v4 + @tailwindcss/typography  
**Language**: TypeScript (Strict Mode)  
**Content Rendering**: @portabletext/react  
**Syntax Highlighting**: react-syntax-highlighter (Prism, oneDark)  
**Theming**: next-themes (Dark / Light / System)

***

## Getting Started

### Prerequisites
- Node.js 20+
- Sanity account: https://sanity.io/
- Clerk account: https://clerk.com/

### Environment Setup

Create a `.env.local` file in the project root:

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Auth Token (comments)
SANITY_API_WRITE_TOKEN=your_write_token
```

Note: `.env.local` is gitignored. Configure these variables in your Vercel dashboard for production.

### Run Locally

```
npm install
npm run dev
```

- App: http://localhost:3000  
- Studio: http://localhost:3000/studio  

***

## Architecture & Design

### Routing Strategy
- Uses Next.js App Router with route groups for clear separation of concerns  
- `(main)` group handles public pages, authenticated content, and UI providers  
- `/studio` is a statically exported Sanity Studio instance  

### Authentication Layer
- Implemented via `clerkMiddleware` in `src/proxy.ts`  
- Enables selective route protection for premium content  
- Public routes and CMS studio remain accessible  

### Data & Performance
- **ISR (Incremental Static Regeneration)**: `revalidate = 60` ensures fresh content without full rebuilds  
- **Server Actions**: Secure comment submission via server-side Sanity client  
- **Dynamic OG Images**: Generated using `next/og` (Satori)  
- Optimized for minimal client-side JavaScript and fast TTFB  

### Styling System
- Tailwind CSS v4 with CSS-first configuration (no config files required)  
- Custom dark mode variant using:
  `@custom-variant dark (&:where(.dark, .dark *))`  

***

## Project Structure

```
src/
├── app/                  # App Router and route groups
├── actions/              # Server Actions (e.g., comments)
├── components/           # UI components (PostCard, Comments, Paywall)
├── sanity/               # GROQ queries, schema, generated types
├── proxy.ts              # Clerk middleware
└── globals.css           # Tailwind v4 entry point
```

***

## Available Commands

- `npm run dev` — Start development server  
- `npm run build` — Build for production  
- `npm run lint` — Run ESLint  
- `npx tsc --noEmit` — Type checking  
- `npx sanity` — Access Sanity CLI  

***

## Deployment

The application is optimized for deployment on Vercel.

### Steps
- Add all environment variables to Vercel Project Settings  
- Ensure Sanity dataset and API tokens are correctly configured  
- Deploy directly from the main branch  

### Notes
- `/studio` is preconfigured for static deployment  
- ISR ensures content updates propagate without full redeploys  

***

## License

All rights reserved. Personal project.

