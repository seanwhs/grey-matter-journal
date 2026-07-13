# GreyMatter Journal

A personal tech blog about software engineering, AI, architecture, and building systems that scale. Built with Next.js 16, Sanity CMS v6, Clerk authentication, and Tailwind CSS v4.

## Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19) |
| **CMS** | Sanity v6 (headless, hosted) |
| **Auth** | Clerk (modal sign-in/sign-up, members-only gating) |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/typography` |
| **Language** | TypeScript (strict mode) |
| **Content rendering** | `@portabletext/react` (Portable Text → React) |
| **Syntax highlighting** | `react-syntax-highlighter` (Prism-based, `oneDark` theme) |
| **Image optimization** | `@sanity/image-url` + Next.js `<Image>` |
| **Theme** | `next-themes` (dark/light/system) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Sanity project (free tier at [sanity.io](https://sanity.io))
- A Clerk application (free tier at [clerk.com](https://clerk.com))

### Environment Variables

Create `.env.local` in the project root:

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sanity write token (for comment submissions — create via Sanity API tokens)
SANITY_API_WRITE_TOKEN=
```

> `.env*` is gitignored. These values are never committed.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Sanity Studio is at [http://localhost:3000/studio](http://localhost:3000/studio).

---

## Project Structure

```
src/
├── app/
│   ├── (main)/                  # Route group — public blog pages
│   │   ├── layout.tsx           # Root layout (ClerkProvider, ThemeProvider, Header, Footer)
│   │   ├── page.tsx             # Homepage — hero + latest posts grid
│   │   ├── posts/[slug]/
│   │   │   ├── page.tsx         # Post detail (ISR, members-only gating, comments)
│   │   │   └── opengraph-image.tsx  # Dynamic OG images (nodejs runtime)
│   │   ├── categories/[slug]/
│   │   │   └── page.tsx         # Category listing
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx         # Clerk sign-in page (fallback for modal)
│   │   └── sign-up/[[...sign-up]]/
│   │       └── page.tsx         # Clerk sign-up page (fallback for modal)
│   ├── studio/                  # Sanity Studio route (separate layout, no Clerk)
│   │   ├── layout.tsx           # Minimal pass-through layout
│   │   └── [[...tool]]/page.tsx # Studio catch-all (force-static)
│   ├── actions/
│   │   └── comments.ts          # Server action for comment submission
│   ├── globals.css              # Tailwind v4 entry + dark mode variant
│   ├── sitemap.ts               # Dynamic sitemap from Sanity slugs
│   └── robots.ts                # Robots config (disallow /studio)
│
├── components/
│   ├── Header.tsx               # Server component — fetches categories from Sanity
│   ├── HeaderAuth.tsx           # Client component — Clerk SignIn/UserButton + ThemeToggle
│   ├── Footer.tsx               # Static footer with Privacy/Terms links
│   ├── ThemeProvider.tsx        # Client wrapper for next-themes
│   ├── ThemeToggle.tsx          # Client component — dark/light toggle button
│   ├── PostCard.tsx             # Post preview card (image, title, excerpt, badge)
│   ├── PortableTextComponents.tsx  # Custom Portable Text renderers (image, codeBlock, links, headings)
│   ├── CodeBlock.tsx            # Client component — syntax-highlighted code blocks (Prism)
│   ├── Comments.tsx             # Server component — fetches + displays comments, submit form
│   └── MembersOnlyPaywall.tsx   # Paywall UI with Clerk sign-in/sign-up buttons
│
├── sanity/
│   ├── lib/
│   │   ├── client.ts            # Read-only Sanity client (CDN in prod)
│   │   ├── writeClient.ts       # Write-capable Sanity client (token required)
│   │   ├── queries.ts           # All GROQ queries
│   │   ├── types.ts             # TypeScript interfaces (Post, Category, Author, Comment)
│   │   └── image.ts             # urlForImage helper
│   └── schemaTypes/
│       ├── index.ts             # Schema registry
│       ├── post.ts              # Post document type
│       ├── author.ts            # Author document type
│       ├── category.ts          # Category document type
│       ├── blockContent.ts      # Rich text block content (includes custom codeBlock)
│       └── comment.tsx          # Comment document type (inline SVG icon)
│
├── proxy.ts                     # Clerk auth middleware (NOT middleware.ts!)
├── next.config.ts               # Image remote patterns (cdn.sanity.io, img.clerk.com)
└── AGENTS.md                    # AI agent context file
```

---

## Architecture

### Routing

Next.js 16 App Router with two route groups:

- **`(main)`** — All public blog content. Wrapped in `ClerkProvider` + `ThemeProvider` + `Header` + `Footer`. Pages: `/`, `/posts/[slug]`, `/categories/[slug]`, `/sign-in`, `/sign-up`.
- **`/studio`** — Sanity Studio. Minimal pass-through layout (no Clerk provider, no theming). Uses `force-static` export. Separated from the main site to avoid Clerk hydration conflicts.

### Data Fetching

All content pages are **React Server Components** that fetch directly from Sanity:

```tsx
// In a server component:
const posts = await client.fetch<Post[]>(POSTS_QUERY);
```

**ISR** (Incremental Static Regeneration) is configured on every content page with `revalidate = 60` — pages are re-generated at most once per minute.

A **dynamic sitemap** at `src/app/sitemap.ts` fetches all post and category slugs from Sanity to generate a complete sitemap.

### Authentication

Auth is handled by Clerk:

- **Middleware** lives in `src/proxy.ts` (not `middleware.ts` — the filename is non-standard). It protects all routes except public ones: `/`, `/sign-in`, `/sign-up`, `/studio`, `/categories`, `/posts`.
- **Sign-in/Sign-up** use Clerk's `mode="modal"` — popovers instead of full-page redirects.
- **Members-only posts** are gated server-side. The post page calls `auth()` and checks `post.isMembersOnly`:
  ```tsx
  const { userId } = await auth();
  const canViewFullContent = !post.isMembersOnly || Boolean(userId);
  ```
- `HeaderAuth` is a client component using Clerk's `Show`, `SignInButton`, `UserButton`.

### Sanity CMS

Two Sanity clients exist for different purposes:

| Client | File | CDN | Token | Used For |
|---|---|---|---|---|
| Read | `client.ts` | Yes (in prod) | No | Server components fetching content |
| Write | `writeClient.ts` | No | `SANITY_API_WRITE_TOKEN` | Server actions (comment submissions) |

**Schema** includes 5 document types:

- **Post** — Title, slug, author reference, main image, categories, publishedAt, excerpt, body (blockContent), isMembersOnly flag
- **Author** — Name, slug, photo, bio
- **Category** — Title, slug, description
- **Block Content** — Rich text with headings, quotes, images, links, and a custom `codeBlock` type (language + code text)
- **Comment** — Post reference, userId, userName, userImageUrl, text, approved flag, createdAt

### Comments

Comments are submitted via a **server action** at `src/app/actions/comments.ts`:

1. The action validates the user is signed in via `auth()`
2. Fetches user profile via `currentUser()`
3. Writes to Sanity using `writeClient.create()`
4. Revalidates the post page path so the new comment appears immediately

The `Comments` component is a server component that fetches approved comments on render and conditionally shows the submit form based on Clerk's `Show` component.

### Theme

Dark/light mode is implemented with `next-themes`:

- `ThemeProvider` wraps the app with `attribute="class"` and `defaultTheme="system"`
- Tailwind v4's dark mode uses the `.dark` class variant: `@custom-variant dark (&:where(.dark, .dark *))`
- `ThemeToggle` is a client component using `useSyncExternalStore` to safely handle hydration

### Tailwind CSS v4

This project uses Tailwind v4's CSS-first configuration:

```css
/* globals.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

body {
  @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100;
}
```

Notable differences from v3:
- `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
- `@plugin` replaces `plugins` in config
- No `tailwind.config.js` or `postcss.config.js` needed
- `@custom-variant` replaces `darkMode: "class"`

### Open Graph Images

Dynamic OG images are generated at `/posts/[slug]/opengraph-image.tsx` using `next/og` (Satori). The runtime is set to `"nodejs"` because the Sanity client doesn't work in the Edge runtime. Falls back to a 500 response if Sanity fetch fails.

### Middleware

The auth middleware at `src/proxy.ts` uses Clerk's `clerkMiddleware`. Its config matcher excludes:

- `_next` (Next.js internals)
- Static files (images, fonts, CSS, etc.)
- `/studio` (Sanity Studio routes are excluded from middleware entirely)

```ts
matcher: [
  "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|...)|studio).*)",
  "/(api|trpc)(.*)",
]
```

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js ESLint config) |
| `npx tsc --noEmit` | TypeScript type-check (no npm script — run separately) |
| `npx sanity` | Sanity CLI (schema validation, dataset management, etc.) |

No test framework is configured.

## Deployment

Deployable to any Node.js platform (Vercel, Netlify, Railway, etc.).

Required environment variables at deploy time (see the [table above](#environment-variables)). The `SANITY_API_WRITE_TOKEN` must have write access to the Sanity dataset.

The Sanity Studio route uses `force-static` export and does not require any server-side rendering at request time.

## License

All rights reserved. Personal project.
