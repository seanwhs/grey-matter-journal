<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GreyMatter Journal

Personal tech blog — Next.js 16 (App Router), React 19, Sanity CMS v6, Clerk auth, Tailwind v4, TypeScript (strict).

## Commands

| Command | What |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Prod server after build |
| `npm run lint` | ESLint (Next.js config) |
| `npx tsc --noEmit` | Type-check only (no npm script; run separately) |
| `npx sanity` | Sanity CLI (schema validation, dataset ops) |

No test framework is configured.

## Architecture

- **Route group `(main)`** — public blog (Header/Footer, ClerkProvider, ThemeProvider). All content pages under `src/app/(main)/`.
- **Sanity Studio** — separate route at `/studio` (`src/app/studio/`), no Clerk provider, uses `force-static` export.
- **Auth middleware** — lives in `src/proxy.ts` (not `middleware.ts`). Public routes: `/`, `/sign-in`, `/sign-up`, `/studio`, `/categories`, `/posts`.
- **ISR** — `revalidate = 60` on every content page.
- **`params` is `Promise<>`** — must be `await`ed in every page and layout (Next.js 16).
- **Dynamic OG images** — `src/app/(main)/posts/[slug]/opengraph-image.tsx`, requires `runtime = "nodejs"`.

## Sanity CMS

- **Read client** (`src/sanity/lib/client.ts`): uses CDN in production. Fetch with `client.fetch<T>(QUERY, params)`.
- **Write client** (`src/sanity/lib/writeClient.ts`): `useCdn: false`, requires `SANITY_API_WRITE_TOKEN`. Used only in server actions.
- **GROQ queries** at `src/sanity/lib/queries.ts`. Types at `src/sanity/lib/types.ts`.
- **Schema types** (5 documents): `post`, `author`, `category`, `blockContent` (includes custom `codeBlock`), `comment`.
- **Image helper** (`src/sanity/lib/image.ts`): `urlForImage(source).width(w).url()`.

## Auth (Clerk)

- Members-only posts: gated server-side in post page via `auth()` — `!post.isMembersOnly || Boolean(userId)`.
- Comment submission: server action `src/app/actions/comments.ts` — validates `auth()`, writes via `writeClient`.
- Components: `@clerk/nextjs`'s `Show`, `SignInButton`, `SignUpButton`, `UserButton` — all use `mode="modal"`.

## Env Variables

All gitignored (`.env*` in `.gitignore`). Create `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SANITY_API_WRITE_TOKEN=
```

## Tailwind v4

- Uses `@import "tailwindcss"` syntax — not `@tailwind` directives.
- Plugin: `@plugin "@tailwindcss/typography"`.
- Dark mode via `.dark` class (`@custom-variant dark (&:where(.dark, .dark *))`).

## Gotchas

- `babel-plugin-react-compiler` is listed as a devDependency but there is no React Compiler config in `next.config.ts`.
- No CI workflows exist yet (no `.github/workflows/`).
- `params` is always a `Promise` in Next.js 16 — the old sync API does not work.
- The Sanity Studio catch-all route (`studio/[[...tool]]/page.tsx`) re-exports `metadata` and `viewport` from `next-sanity/studio`.
