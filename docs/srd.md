# Software Requirements Document — GreyMatter Journal

A personal tech blog built with Next.js 16 (App Router), Sanity CMS v6, Clerk auth, and Tailwind v4.

---

## 1. Project Overview

GreyMatter Journal is a production-grade personal blog focused on software engineering, AI systems, architecture, and modern web development. It serves two audiences: the author (content creator) and readers (public visitors). Content is gated behind authentication on a per-post basis for a future members-only model.

### Design Tenets

- Fast page loads with minimal client-side JavaScript
- Clean separation: content (Sanity), presentation (Next.js), auth (Clerk)
- ISR-based content freshness without full rebuilds
- Strongly typed throughout (TypeScript strict mode)
- Dark / Light / System theming

---

## 2. User Personas

### Persona A — Reader (Unauthenticated)

Can browse all public pages and read free posts. Cannot:
- Read members-only post content (sees paywall)
- Submit comments
- Access Sanity Studio

### Persona B — Reader (Authenticated)

Has signed in via Clerk (GitHub / Google / email). Can:
- Read full content of members-only posts
- Submit comments on any post
- Manage their Clerk session

### Persona C — Author / Admin

Has access to `/studio`. Can:
- Create, edit, publish, and delete posts
- Manage authors and categories
- Moderate comments (approve / delete)
- Upload images

---

## 3. Functional Requirements

### FR-01 — Blog Roll (P0)

| Id | Requirement |
|---|---|
| FR-01.1 | Homepage displays a grid of post cards, newest first |
| FR-01.2 | Each card shows: title, excerpt, main image, author (name + avatar), published date, members-only badge if applicable |
| FR-01.3 | Cards link to the full post page |
| FR-01.4 | Pagination or infinite scroll (future) |

### FR-02 — Post Detail (P0)

| Id | Requirement |
|---|---|
| FR-02.1 | Full post page at `/posts/[slug]` |
| FR-02.2 | Displays: title, author (name + avatar + link to author page), published date, main image, body (Portable Text with code highlighting), categories |
| FR-02.3 | Members-only posts show a paywall for unauthenticated users; authenticated users see full content |
| FR-02.4 | Dynamic OG image at `/posts/[slug]/opengraph-image` |
| FR-02.5 | ISR: `revalidate = 60` |

### FR-03 — Author Pages (P0)

| Id | Requirement |
|---|---|
| FR-03.1 | Author profile at `/authors/[slug]` |
| FR-03.2 | Displays: avatar, name, bio, grid of that author's posts |
| FR-03.3 | Links from post detail author byline to author page |

### FR-04 — Categories (P0)

| Id | Requirement |
|---|---|
| FR-04.1 | Category listing at `/categories/[slug]` |
| FR-04.2 | Displays: category title, description, grid of posts in that category |
| FR-04.3 | Category nav links in the header |
| FR-04.4 | Categories shown on post detail page |

### FR-05 — Authentication (P0)

| Id | Requirement |
|---|---|
| FR-05.1 | Sign-in / sign-up via Clerk modal at `/sign-in` and `/sign-up` |
| FR-05.2 | Public routes: `/`, `/sign-in`, `/sign-up`, `/studio`, `/categories/**`, `/posts/**` |
| FR-05.3 | All other routes redirect to sign-in |
| FR-05.4 | Members-only content gated server-side via `auth()` |

### FR-06 — Comments (P1)

| Id | Requirement |
|---|---|
| FR-06.1 | Authenticated users can submit comments on posts |
| FR-06.2 | Comment form: name (from Clerk), text area, submit button |
| FR-06.3 | Comments stored in Sanity via server action with `writeClient` |
| FR-06.4 | Comments list shows avatar, name, text, timestamp |
| FR-06.5 | Comments are not available for members-only posts until authenticated |

### FR-07 — Sanity Studio (P0)

| Id | Requirement |
|---|---|
| FR-07.1 | Studio available at `/studio` with `force-static` export |
| FR-07.2 | Separate layout — no Clerk, no Header/Footer |
| FR-07.3 | Schemas: Post, Author, Category, BlockContent (rich text), Comment |
| FR-07.4 | Vision tool enabled for GROQ playground |

### FR-08 — Theming (P1)

| Id | Requirement |
|---|---|
| FR-08.1 | Light / Dark / System toggle via `next-themes` |
| FR-08.2 | Persisted in localStorage |
| FR-08.3 | `.dark` class on `<html>` for Tailwind dark variant |

### FR-09 — Typography & Code (P0)

| Id | Requirement |
|---|---|
| FR-09.1 | `@tailwindcss/typography` (`prose`) for article body |
| FR-09.2 | Custom `codeBlock` in Portable Text rendered with `react-syntax-highlighter` (Prism, oneDark theme) |
| FR-09.3 | Link marks open in new tab with proper styling |

### FR-10 — SEO & Metadata (P1)

| Id | Requirement |
|---|---|
| FR-10.1 | Dynamic `<title>` and `<meta name="description">` per page |
| FR-10.2 | Canonical URLs on post pages |
| FR-10.3 | Open Graph tags for social preview |
| FR-10.4 | Dynamic OG images for posts |
| FR-10.5 | Dynamic sitemap from Sanity content |

### FR-11 — Responsiveness (P1)

| Id | Requirement |
|---|---|
| FR-11.1 | Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop for post grids |
| FR-11.2 | Header nav wraps gracefully on small screens |
| FR-11.3 | Article body readable on all viewport widths (max-width constraint) |

---

## 4. Non-Functional Requirements

### NFR-01 — Performance

| Id | Requirement |
|---|---|
| NFR-01.1 | All content pages use ISR with `revalidate = 60` |
| NFR-01.2 | Client-side JavaScript minimized — server components preferred |
| NFR-01.3 | Images use `next/image` with Sanity CDN for on-the-fly resizing |

### NFR-02 — Security

| Id | Requirement |
|---|---|
| NFR-02.1 | Auth middleware protects non-public routes |
| NFR-02.2 | Members-only content gated server-side — never sent to unauthorized clients |
| NFR-02.3 | Sanity write token never exposed to the browser |
| NFR-02.4 | Comment submission uses server action with auth validation |

### NFR-03 — Maintainability

| Id | Requirement |
|---|---|
| NFR-03.1 | All GROQ queries live in a single file (`queries.ts`) |
| NFR-03.2 | All TypeScript interfaces co-located in `types.ts` |
| NFR-03.3 | Schema types defined in code (version-controlled) |
| NFR-03.4 | Two explicit Sanity clients: read-only CDN + write-capable token |

### NFR-04 — Availability

| Id | Requirement |
|---|---|
| NFR-04.1 | Static generation for all content pages via `generateStaticParams` |
| NFR-04.2 | Studio deployed as static export |
| NFR-04.3 | Vercel deployment with zero-downtime deploys |

### NFR-05 — SEO

| Id | Requirement |
|---|---|
| NFR-05.1 | Each page has unique title + meta description |
| NFR-05.2 | Sitemap generated from Sanity slugs |
| NFR-05.3 | `prose` typography produces semantic HTML headings |

---

## 5. Route Map

| Path | Type | Auth | Description |
|---|---|---|---|
| `/` | Server Component | Public | Homepage — hero + latest posts grid |
| `/posts/[slug]` | Server Component | Public* | Full post with author, body, comments |
| `/authors/[slug]` | Server Component | Public | Author profile + their posts |
| `/categories/[slug]` | Server Component | Public | Category listing + posts in it |
| `/sign-in/[[...sign-in]]` | Clerk Page | Public | Clerk sign-in modal route |
| `/sign-up/[[...sign-up]]` | Clerk Page | Public | Clerk sign-up modal route |
| `/studio/[[...tool]]` | Client Component | Studio Auth | Sanity Studio editor |
| `/sitemap.ts` | Route Handler | Public | Dynamic XML sitemap |
| `/posts/[slug]/opengraph-image` | Route Handler | Public | Dynamic OG image (Node.js runtime) |

\* Members-only posts gate content server-side for unauthenticated users.

Protected by middleware (`src/proxy.ts`): everything not in the public list redirects to sign-in.

---

## 6. Data Model

### 6.1 Post

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | string | auto | Sanity document ID |
| `title` | string | yes | Headline |
| `slug` | slug | yes | URL path, from title |
| `author` | reference → Author | yes | Single author |
| `mainImage` | image | no | Hero image with hotspot + alt |
| `categories` | array<reference → Category> | no | 0+ categories |
| `publishedAt` | datetime | no | Defaults to now |
| `excerpt` | text | yes | Max 200 chars |
| `body` | blockContent | no | Portable Text rich content |
| `isMembersOnly` | boolean | no | Defaults to false |

### 6.2 Author

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Display name |
| `slug` | slug | yes | From name |
| `image` | image | no | Avatar |
| `bio` | text | no | Short biography |

### 6.3 Category

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Display name |
| `slug` | slug | yes | From title |
| `description` | text | no | Shown on category page |

### 6.4 Comment

| Field | Type | Required | Notes |
|---|---|---|---|
| `post` | reference → Post | yes | Parent post |
| `userId` | string | yes | Clerk user ID |
| `userName` | string | yes | From Clerk profile |
| `userImageUrl` | url | no | Avatar |
| `text` | text | yes | Body |
| `approved` | boolean | no | Defaults to true |
| `createdAt` | datetime | no | Auto-timestamped |

### 6.5 BlockContent (Portable Text)

Reusable schema type for rich text. Supports: headings (h1–h4), paragraphs, blockquotes, bullet/numbered lists, bold/italic/code marks, hyperlinks, inline images, custom code blocks (language dropdown + code textarea).

---

## 7. Authentication & Authorization

| Concern | Mechanism |
|---|---|
| Session management | Clerk (`@clerk/nextjs`) |
| Route protection | `clerkMiddleware` in `src/proxy.ts` — whitelist of public routes |
| Members-only gating | Server-side `auth()` — post body hidden unless `userId` present |
| Comment auth | Server action calls `auth()` before writing |
| Studio auth | Sanity provides its own auth (Clerk is not injected into studio layout) |
| Auth UI | Clerk modal via `SignInButton`, `SignUpButton`, `UserButton` with `mode="modal"` |

---

## 8. Architecture Highlights

```
app/layout.tsx           → html, body, Inter font, globals.css
(app/(main)/layout.tsx)  → ClerkProvider, ThemeProvider, Header, Footer
(app/studio/layout.tsx)  → bare minimum (no Clerk, no Header)
```

Data flow: Server Component → `client.fetch<Type>(GROQ, params)` → Sanity CDN → React render → HTML.

Write path: Server Action → `auth()` → `writeClient.create()` → `revalidatePath()`.

---

## 9. Future Considerations

| Item | Priority | Notes |
|---|---|---|
| Pagination on homepage / author / category pages | P2 | Beyond ~20 posts, grid needs pages |
| Search (full-text) | P2 | GROQ `*[_type == "post" && title match $query]` or Sanity Search |
| RSS / Atom feed | P2 | Route handler generating XML from Sanity data |
| Newsletter integration | P2 | ConvertKit or similar via server action |
| Reading time estimate | P2 | Calculated from body block count / word count |
| Related posts | P2 | By shared categories |
| Content webhooks + on-demand revalidation | P2 | Replace 60s ISR with instant updates via `revalidateTag` |
| Admin comment moderation UI | P2 | Custom page or Studio dashboard |
| Social share buttons | P3 | Quick share links for Twitter, LinkedIn |
| Analytics | P3 | Plausible or similar privacy-first option |
| Multiple authors shown on a post | P3 | Schema currently supports single author reference |
