# Content Management with Sanity CMS

A reference for my future self — what Sanity is, how it's integrated in this project, and how content flows from the editor to the browser.

---

## Table of Contents

1. [What is Sanity?](#1-what-is-sanity)
2. [The Big Mental Model: What Sanity Owns vs What We Own](#2-the-big-mental-model)
3. [Content Modeling: The 5 Schema Types](#3-content-modeling-the-5-schema-types)
4. [Two Clients: Read vs Write](#4-two-clients-read-vs-write)
5. [GROQ: How We Query Content](#5-groq-how-we-query-content)
6. [Sanity Studio: The Editor Interface](#6-sanity-studio-the-editor-interface)
7. [Data Flow: Content Creation to Browser](#7-data-flow-content-creation-to-browser)
8. [Portable Text: Rich Content Rendering](#8-portable-text-rich-content-rendering)
9. [Images: Upload to Render Pipeline](#9-images-upload-to-render-pipeline)
10. [The Config Files](#10-the-config-files)
11. [ISR & Content Updates](#11-isr--content-updates)
12. [CLI Commands](#12-cli-commands)
13. [Sanity vs. Traditional CMS](#13-sanity-vs-traditional-cms)

---

## 1. What is Sanity?

Sanity is a **headless CMS** — a content management system that stores content in the cloud and delivers it via API, with no built-in frontend. Unlike WordPress (which couples content + templates), Sanity is just the content layer.

| Feature | What Sanity Provides |
|---|---|
| Content storage | Cloud-hosted, real-time, collaborative |
| Content editing UI | **Sanity Studio** — a React app you embed in your site |
| Content modeling | Custom document types + fields (defined in code) |
| Query API | **GROQ** (Sanity's query language) or GraphQL |
| Image pipeline | On-the-fly resizing, cropping, format conversion |
| Real-time sync | Content updates stream to connected clients via listener |
| Asset CDN | Images/files served from `cdn.sanity.io` |
| History & rollback | Every content change is versioned |

### Key Term: "Headless"

Traditional CMS: "Here's your content AND your HTML templates."
Headless CMS: "Here's your content as JSON — render it however you want."

Sanity is headless. Our Next.js app fetches content as JSON and renders it into React components.

---

## 2. The Big Mental Model

```
                     Sanity (SaaS)
                    ┌───────────────────────────────────┐
                    │          Sanity Project             │
                    │   ┌───────────────────────────┐     │
                    │   │   Dataset: "production"    │     │
                    │   │                           │     │
                    │   │   Post documents          │     │
                    │   │   Author documents        │     │
                    │   │   Category documents      │     │
                    │   │   Comment documents       │     │
                    │   └───────────────────────────┘     │
                    │                │                     │
                    │   Content Delivery API (CDN)        │
                    │   Content Lake API (for writes)     │
                    └────────────────┬──────────────────┘
                                     │ HTTPS + JSON
                    ┌────────────────▼──────────────────┐
                    │       Our Next.js App              │
                    │                                    │
                    │  /studio ──► Sanity Studio (editor)│
                    │  client.fetch(GROQ) ──► read data  │
                    │  writeClient.create() ──► write    │
                    │  urlForImage() ──► image URLs      │
                    │  PortableText ──► render rich text │
                    └──────────────────────────────────┘
```

**Key insight**: Sanity has two separate API surfaces:
1. **Content Lake API** — the source-of-truth API for all CRUD operations
2. **CDN API** — cached, read-only version for fast public reads (used by `client.ts` in production)

And two separate contexts:
1. **Editor context** — the Sanity Studio at `/studio` where authors write content
2. **Reader context** — the public Next.js pages where content is displayed

---

## 3. Content Modeling: The 5 Schema Types

Schemas are defined in `src/sanity/schemaTypes/` as plain TypeScript files using `defineType` and `defineField` from the `sanity` package. Each schema defines a **document type** — like a table in a database.

### 3.1 Post (`src/sanity/schemaTypes/post.ts`)

The main content type. Every blog post is a Post document.

| Field | Type | Purpose |
|---|---|---|
| `title` | `string` (required) | Post headline |
| `slug` | `slug` (required, auto-generated from title) | URL path (`/posts/my-title`) |
| `author` | `reference → author` (required) | Links to an Author document |
| `mainImage` | `image` with hotspot + alt text | Hero image for the post |
| `categories` | `array of references → category` | Tags/categories |
| `publishedAt` | `datetime` (defaults to now) | Publication date for sorting |
| `excerpt` | `text` (max 200 chars) | Short summary for homepage + SEO |
| `body` | `blockContent` (custom type) | The full post content (rich text) |
| `isMembersOnly` | `boolean` (defaults to false) | Gates full content behind auth |

The `preview` block in the schema tells Sanity Studio what to show in the document list: title, author name (as subtitle), and main image (as thumbnail).

### 3.2 Author (`src/sanity/schemaTypes/author.ts`)

Represents a blog author.

| Field | Type | Purpose |
|---|---|---|
| `name` | `string` (required) | Display name |
| `slug` | `slug` (required, from name) | URL identifier |
| `image` | `image` with hotspot | Author photo |
| `bio` | `text` | Short biography |

### 3.3 Category (`src/sanity/schemaTypes/category.ts`)

A taxonomy term for organizing posts.

| Field | Type | Purpose |
|---|---|---|
| `title` | `string` (required) | Display name (e.g. "React") |
| `slug` | `slug` (required, from title) | URL identifier |
| `description` | `text` | Category description shown on listing page |

### 3.4 Block Content (`src/sanity/schemaTypes/blockContent.ts`)

This is not a document type — it's a **reusable content schema** used as the `body` field of Post. It defines what rich text blocks are available in the Studio editor:

- **Text blocks**: normal, H1–H4, blockquote
- **Lists**: bullet, numbered
- **Inline marks**: bold, italic, code, links (URL annotations)
- **Image blocks**: inline images with alt text, hotspot
- **Custom code blocks**: a custom `codeBlock` object type with `language` (dropdown) and `code` (textarea)

This is the **Portable Text** specification. Portable Text is Sanity's JSON-based rich text format — more on that later.

### 3.5 Comment (`src/sanity/schemaTypes/comment.tsx`)

Stores reader comments on posts. Written via the server action, not the Studio.

| Field | Type | Purpose |
|---|---|---|
| `post` | `reference → post` | Which post this comment belongs to |
| `userId` | `string` | Clerk user ID of the commenter |
| `userName` | `string` | Display name (from Clerk profile) |
| `userImageUrl` | `url` | Avatar URL (from Clerk profile) |
| `text` | `text` | Comment body |
| `approved` | `boolean` (defaults to true) | Moderation flag |
| `createdAt` | `datetime` | Timestamp |

The inline SVG icon avoids a dependency resolution issue with `@sanity/icons`.

### Schema Registry

All 5 types are registered in `src/sanity/schemaTypes/index.ts`:

```ts
export const schema = {
  types: [post, author, category, blockContent, comment],
};
```

This is imported by `sanity.config.ts` at the project root.

---

## 4. Two Clients: Read vs Write

Sanity uses API tokens for write access. Public reads don't need tokens — they go through the CDN. This project separates those two concerns into two client files.

### Read Client (`src/sanity/lib/client.ts`)

```ts
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,  // public
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,        // public
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",           // CDN in prod, direct in dev
});
```

- **No token** — safe to use in server components and client components
- **CDN in production** — faster, cached reads
- **Direct in development** — no caching, see edits immediately

### Write Client (`src/sanity/lib/writeClient.ts`)

```ts
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,                                            // must be false for writes
  token: process.env.SANITY_API_WRITE_TOKEN,                 // secret — only on server
});
```

- **Requires `SANITY_API_WRITE_TOKEN`** — generate this in Sanity Dashboard → API → Tokens
- **`useCdn: false`** — writes must go to the Content Lake API directly, not the CDN
- **Server-only** — never exposed to the browser. Used only in server actions (`src/app/actions/comments.ts`)

### Rule of Thumb

| If you want to... | Use |
|---|---|
| Read content for display | `client` (read) |
| Create/update/delete content from user actions | `writeClient` (write) |
| Edit content manually | Sanity Studio at `/studio` |

---

## 5. GROQ: How We Query Content

GROQ (Graph-Relational Object Queries) is Sanity's query language. It's similar to GraphQL in spirit but uses a different syntax. All queries live in `src/sanity/lib/queries.ts`.

### Query Patterns

**Fetch all posts**:
```groq
*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
  author->{name, slug, image},
  categories[]->{title, slug}
}
```

- `*[_type == "post"]` — find all documents of type "post"
- `| order(publishedAt desc)` — sort by date descending
- `{ ... }` — projection (which fields to return)
- `author->` — follows the author reference and embeds the author document's fields
- `categories[]->` — follows each category reference in the array

**Fetch a single post by slug**:
```groq
*[_type == "post" && slug.current == $slug][0]
```
- `[$slug]` is a parameter (passed via `client.fetch(POST_QUERY, { slug })`)
- `[0]` means "first match"

**Fetch only slugs (for static params / sitemap)**:
```groq
*[_type == "post" && defined(slug.current)].slug.current
```
- Returns an array of strings (`["post-one", "post-two", ...]`)

**Fetch comments for a post**:
```groq
*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt asc)
```
- Filters by the post reference ID and only approved comments

### How Queries Are Used

```tsx
// In a server component:
import { client } from "@/sanity/lib/client";
import { POST_QUERY } from "@/sanity/lib/queries";

const post = await client.fetch<Post>(POST_QUERY, { slug });
```

The `<Post>` TypeScript type (from `src/sanity/lib/types.ts`) ensures the returned JSON matches our expected shape at compile time.

---

## 6. Sanity Studio: The Editor Interface

### Where it lives

- **URL**: `/studio` (configured in `sanity.config.ts`)
- **Code**: `src/app/studio/[[...tool]]/page.tsx` + `studio-component.tsx`
- **Config**: `sanity.config.ts` at project root

### How it's set up

```tsx
// sanity.config.ts
export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: schema,
});
```

### Why Studio has its own layout

```tsx
// src/app/studio/layout.tsx — bare minimum
export default function StudioLayout({ children }) {
  return <>{children}</>;
}
```

The Studio layout is separate from the main `(main)/layout.tsx` because:
- It must **not** be wrapped in `ClerkProvider` (Studio provides its own auth)
- It must **not** include our Header/Footer/ThemeProvider
- The Studio manages its own theming and navigation

The page exports `dynamic = 'force-static'` and re-exports `metadata` and `viewport` from `next-sanity/studio`:

```tsx
export { metadata, viewport } from 'next-sanity/studio';
export const dynamic = 'force-static';
```

### Studio is a client-side React app

The `studio-component.tsx` is a `'use client'` component that renders `<NextStudio config={config} />`. The entire Studio editing experience is a client-side React app embedded in a Next.js route.

### Vision Tool

The `visionTool()` plugin adds a `/studio/vision` route with a GROQ playground — useful for testing queries before putting them in code.

---

## 7. Data Flow: Content Creation to Browser

```
Author writes in Studio (/studio)
        │
        ▼
Sanity saves to Content Lake (their cloud)
        │
        ▼
Next.js request comes in (someone visits the blog)
        │
        ▼
Server component calls client.fetch(POST_QUERY, { slug })
        │
        ▼
Read client queries Sanity CDN (cached, fast)
        │
        ▼
JSON response arrives
        │
        ▼
React renders: <PortableText value={post.body} />, etc.
        │
        ▼
HTML sent to browser
        │
        (60 seconds later — ISR revalidation)
        │
        ▼
Next rebuilds this page in background
New content appears on next visitor's request
```

### For Comments (write path)

```
Reader submits comment form
        │
        ▼
Server action: submitComment()
        │
        ▼
auth() verifies Clerk session
        │
        ▼
writeClient.create({ _type: "comment", text, userId, ... })
        │
        ▼
Sanity Content Lake (direct write, not CDN)
        │
        ▼
revalidatePath(`/posts/${slug}`)
        │
        ▼
Next.js regenerates the post page
Comments now visible to the next visitor
```

---

## 8. Portable Text: Rich Content Rendering

Portable Text is Sanity's JSON-based rich text format. Instead of HTML (which is hard to edit programmatically and dangerous to render from CMS), Sanity stores content as a JSON array of blocks.

### What Portable Text looks like

```json
[
  { "_type": "block", "style": "h2", "children": [{ "text": "Introduction" }] },
  { "_type": "block", "style": "normal", "children": [{ "text": "Here is a paragraph." }] },
  { "_type": "image", "asset": { "_ref": "image-abc123" }, "alt": "Screenshot" },
  { "_type": "codeBlock", "language": "typescript", "code": "const x = 1;" }
]
```

### How we render it

In the post page (`src/app/(main)/posts/[slug]/page.tsx`):

```tsx
import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "@/components/PortableTextComponents";

<PortableText value={post.body} components={portableTextComponents} />
```

`PortableTextComponents` (`src/components/PortableTextComponents.tsx`) maps each `_type` to a React component:

| `_type` | Renders As |
|---|---|
| `block` with `style: "h1"` | `<h1>` with Tailwind styling |
| `block` with `style: "h2"` | `<h2>` with Tailwind styling |
| `block` with `style: "h3"` | `<h3>` with Tailwind styling |
| `block` with `style: "blockquote"` | Styled `<blockquote>` |
| `image` | `<Image>` component (Next.js optimized) |
| `codeBlock` | `<CodeBlock>` (syntax highlighted with Prism) |
| link mark (`_type: "link"`) | `<a>` with styling + `target="_blank"` |

If a block type is not handled by the custom components, `@portabletext/react` falls back to sensible defaults.

---

## 9. Images: Upload to Render Pipeline

```
Author uploads image in Studio
        │
        ▼
Sanity stores original on CDN (cdn.sanity.io)
        │
        ▼
Query returns asset reference:
  { "_type": "image", "_ref": "image-R4bU4knP-1920x1080-png" }

        │
        ▼
urlForImage(value).width(1200).url()
        │
        ▼
Generates URL:
  https://cdn.sanity.io/images/{projectId}/{dataset}/R4bU4knP-1920x1080.png?w=1200

        │
        ▼
Next.js <Image> component fetches + optimizes
```

The helper in `src/sanity/lib/image.ts`:

```ts
const builder = createImageUrlBuilder(client);
export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
```

Usage:
```tsx
<Image
  src={urlForImage(post.mainImage).width(1200).url()}
  alt={post.mainImage.alt || post.title}
  fill
  className="object-cover"
/>
```

The remote pattern `cdn.sanity.io` is registered in `next.config.ts` so Next.js allows serving images from Sanity's CDN.

---

## 10. The Config Files

### `sanity.config.ts` (project root)

Configures the Studio itself — project identity, dataset, plugins (structure + vision), and schema import.

### `sanity.cli.ts` (project root)

Configures the Sanity CLI — allows running `npx sanity` commands against this project.

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=       # Public — identifies your Sanity project
NEXT_PUBLIC_SANITY_DATASET=production # Public — which dataset to use

# Required only for writes (comments)
SANITY_API_WRITE_TOKEN=              # Secret — generated in Sanity Dashboard → API → Tokens
```

### File Organization

```
src/sanity/
├── lib/
│   ├── client.ts           # Read-only Sanity client (CDN in prod)
│   ├── writeClient.ts      # Write-capable client (token required)
│   ├── queries.ts          # All GROQ queries
│   ├── types.ts            # TypeScript interfaces
│   └── image.ts            # urlForImage helper
└── schemaTypes/
    ├── index.ts            # Schema registry
    ├── post.ts             # Post document type
    ├── author.ts           # Author document type
    ├── category.ts         # Category document type
    ├── blockContent.ts     # Portable Text schema (rich text)
    └── comment.tsx         # Comment document type

sanity.config.ts             # Studio configuration
sanity.cli.ts                # CLI configuration
```

---

## 11. ISR & Content Updates

Every content page exports `revalidate = 60`:

```tsx
export const revalidate = 60; // seconds
```

This means:
1. First visitor after a content update triggers a **stale-while-revalidate** — they get the old page, but the server starts rebuilding in the background
2. Subsequent visitors get the **fresh page** (until the 60-second window passes again)
3. If no content changes, the page is served from cache indefinitely

### To see edits immediately during development

In dev mode (`npm run dev`), `client.ts` sets `useCdn: false`, so every request hits the Content Lake API directly with no caching. Edits appear on refresh.

### For instant updates in production (not yet implemented)

Sanity supports **Content Webhooks** + **On-Demand Revalidation** (Next.js `revalidateTag`). Currently the project relies on ISR's 60-second window, which is fine for a low-traffic personal blog.

---

## 12. CLI Commands

```bash
# Validate schemas
npx sanity schema validate

# List datasets
npx sanity dataset list

# Export a dataset
npx sanity dataset export production backup.tar.gz

# Import a dataset
npx sanity dataset import backup.tar.gz production

# Manage CORS origins
npx sanity cors add https://yourdomain.com
```

---

## 13. Sanity vs. Traditional CMS

| Concern | WordPress | Sanity |
|---|---|---|
| Content editing | PHP admin panel | React app embedded in your site at `/studio` |
| Content storage | MySQL | Cloud-hosted JSON documents (Content Lake) |
| Content delivery | Rendered HTML from PHP server | JSON via API — you render it |
| Schema | Defined by plugins + PHP | Defined in TypeScript code, version-controlled |
| Media | Uploaded to wp-content | CDN at `cdn.sanity.io` with on-the-fly transforms |
| Querying | SQL / WP_Query | GROQ (custom query language) or GraphQL |
| Versioning | Revisions in DB | Every change is tracked, point-in-time restore |
| Real-time | Not built-in | Listeners + live preview built in |
| Custom fields | ACF plugin | Any schema you define in code |

---

## Summary: Files & Their Roles

| File | What it does |
|---|---|
| `sanity.config.ts` | Studio identity + plugins + schema import |
| `sanity.cli.ts` | CLI project binding |
| `src/sanity/client.ts` | Read-only client for fetching content in server components |
| `src/sanity/writeClient.ts` | Write-capable client for server actions (comments) |
| `src/sanity/queries.ts` | All GROQ queries in one place |
| `src/sanity/types.ts` | TypeScript interfaces matching query projections |
| `src/sanity/image.ts` | Image URL builder |
| `src/sanity/schemaTypes/*.ts` | Document type definitions in code |
| `src/app/studio/layout.tsx` | Minimal layout for Studio route (no Clerk, no Header) |
| `src/app/studio/[[...tool]]/page.tsx` | Studio entry point with `force-static` |
| `src/app/studio/[[...tool]]/studio-component.tsx` | Client component rendering `<NextStudio>` |
| `src/components/PortableTextComponents.tsx` | Maps Portable Text types → React components |
| `src/components/CodeBlock.tsx` | Syntax-highlighted code rendering (Prism) |
| `src/app/actions/comments.ts` | Server action that uses `writeClient` |
| `src/app/sitemap.ts` | Dynamic sitemap from Sanity query |
| `next.config.ts` | `remotePatterns` for `cdn.sanity.io` |
