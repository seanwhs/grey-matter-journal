# Architecture

## Overview

GreyMatter Journal is a personal tech blog built with **Next.js 16** using the App Router, **React 19**, **Sanity CMS v6**, **Clerk** for authentication, **Tailwind v4** for styling, and **TypeScript** in strict mode.

```mermaid
graph TB
    User((User)) --> Next["Next.js 16 App"]
    Next --> Pages["Public blog routes\n(main) route group"]
    Next --> Studio["Sanity Studio\n/studio route"]
    Pages --> Root["Root Layout\nhtml, body, font"]
    Root --> MainGroup["(main) Layout\nClerkProvider, ThemeProvider"]
    MainGroup --> Header["Header\nSanity categories + auth"]
    MainGroup --> Content["Page content"]
    MainGroup --> Footer["Footer"]
    Content --> Sanity["Sanity CMS\nread client via CDN"]
    Content --> Clerk["Clerk auth"]
    Content --> Comments["Comments\nwrite client via token"]
```

## Directory Structure

```text
src/
├── app/
│   ├── (main)/                 # Route group: public blog
│   │   ├── layout.tsx          # (main) layout: ClerkProvider, ThemeProvider, Header, Footer
│   │   ├── page.tsx            # Homepage
│   │   ├── authors/[slug]/     # Author profile
│   │   ├── categories/[slug]/  # Category listing
│   │   ├── posts/[slug]/       # Post detail + OG image
│   │   ├── sign-in/            # Clerk sign-in
│   │   └── sign-up/            # Clerk sign-up
│   ├── layout.tsx              # Root layout: html, body, Inter font, globals.css
│   ├── studio/                 # Sanity Studio (separate layout)
│   ├── globals.css             # Tailwind v4
│   ├── sitemap.ts
│   └── robots.ts
├── actions/
│   └── comments.ts             # Server action
├── components/
│   ├── Header.tsx              # Server: dynamic category nav
│   ├── HeaderAuth.tsx          # Client: Clerk buttons + theme toggle
│   ├── Footer.tsx
│   ├── PostCard.tsx
│   ├── Comments.tsx            # Server: comment list + form
│   ├── CodeBlock.tsx           # Client: Prism syntax highlighting
│   ├── PortableTextComponents.tsx  # Sanity block content renderers
│   ├── MembersOnlyPaywall.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
├── sanity/
│   ├── lib/
│   │   ├── client.ts           # Read client, CDN in production
│   │   ├── writeClient.ts      # Write client, token-based
│   │   ├── image.ts            # urlForImage helper
│   │   ├── queries.ts          # GROQ queries
│   │   └── types.ts            # TypeScript types
│   └── schemaTypes/            # Document schemas
└── proxy.ts                    # Clerk middleware
```

## Routing & Layouts

Layouts are split into two layers:

1. `app/layout.tsx` is the root layout. It provides the outer `<html>` and `<body>` wrapper, the font, and the global CSS import.
2. `app/(main)/layout.tsx` is the public route-group layout. It adds `ClerkProvider`, `ThemeProvider`, `Header`, `Footer`, and the main content container.

The `/studio` route has its own layout and stays separate from the public blog shell. It does not need Clerk and is exported as `force-static`.

```mermaid
flowchart LR
    subgraph App["Next.js App"]
        direction LR
        Root["app/layout.tsx\nhtml, body, font, globals"]

        subgraph Public["(main) Route Group"]
            direction TB
            ML["layout.tsx\nClerkProvider, ThemeProvider,\nHeader, Footer"] --> H["Home /"]
            ML --> P["Post /posts/[slug]"]
            ML --> A["Author /authors/[slug]"]
            ML --> C["Category /categories/[slug]"]
            ML --> SI["Sign In /sign-in"]
            ML --> SU["Sign Up /sign-up"]
        end

        subgraph Studio["Studio Route"]
            S["Sanity Studio\n/studio/[[...tool]]\nforce-static"]
        end
    end

    Root --> Public
    Root --> Studio
    ML -.-> Clerk["Clerk"]
    SI -.-> ClerkAuth["Clerk modal"]
    SU -.-> ClerkAuth
```

## Data Flow

All content pages are server components that fetch data from Sanity at request time. ISR with `revalidate = 60` keeps pages cached for 60 seconds between regenerations.

```mermaid
sequenceDiagram
    participant User
    participant Next as Next.js Server
    participant Sanity as Sanity CDN
    participant Write as Sanity API
    participant Clerk

    User->>Next: GET /posts/[slug]
    Next->>Clerk: auth() - get userId
    Next->>Sanity: client.fetch(POST_QUERY)
    Sanity-->>Next: Post data
    Next->>Next: Check isMembersOnly vs userId
    alt public post
        Next->>Sanity: client.fetch(COMMENTS_QUERY)
        Sanity-->>Next: Approved comments
    else members-only + not signed in
        Next->>Next: Render MembersOnlyPaywall
    end
    Next-->>User: HTML page (ISR cached for 60s)

    Note over User,Next: Comment submission
    User->>Next: POST submitComment (form action)
    Next->>Clerk: auth() + currentUser()
    Next->>Write: writeClient.create(comment)
    Write-->>Next: Created
    Next->>Next: revalidatePath("/posts/[slug]")
    Next-->>User: Redirect and re-render with new comment
```

## Auth Architecture

Auth middleware lives in `proxy.ts`, not `middleware.ts`. Public-facing blog routes are open, while any route not listed as public is protected.

```mermaid
flowchart TD
    Request["HTTP Request"] --> Match{"Clerk middleware\nconfig.matcher"}
    Match -->|Static files\n_next, /studio| Skip["Skip middleware"]
    Match -->|All other routes| MW["clerkMiddleware runs"]
    MW --> Public{"isPublicRoute?\n/, /posts/*, /categories/*\n/sign-in, /sign-up, /studio"}
    Public -->|Yes| Allow["Allow - no auth check"]
    Public -->|No| Protect["auth.protect()\nredirects to /sign-in"]

    subgraph PostPage["Post Page Server Component"]
        A["auth()"] --> ID{"userId exists?"}
        ID -->|Yes + post.isMembersOnly| Show["Show full content + comments"]
        ID -->|No + post.isMembersOnly| Paywall["Show MembersOnlyPaywall"]
        ID -->|post.isMembersOnly = false| Show
    end
```

## Sanity Schema

Five document types define the content model in the CMS.

```mermaid
erDiagram
    POST ||--o{ CATEGORY : categorizes
    POST ||--o{ COMMENT : has
    POST ||--|| AUTHOR : authored_by
    POST ||--|| BLOCKCONTENT : contains

    POST {
        string title
        slug slug
        reference author
        image mainImage
        array categories
        datetime publishedAt
        text excerpt
        blockContent body
        boolean isMembersOnly
    }

    AUTHOR {
        string name
        slug slug
        image image
        text bio
    }

    CATEGORY {
        string title
        slug slug
        text description
    }

    COMMENT {
        reference post
        string userId
        string userName
        string userImageUrl
        text text
        boolean approved
        datetime createdAt
    }

    BLOCKCONTENT {
        array blocks
        array images
        array codeBlocks
    }
```

## Component Tree

```mermaid
graph TB
    Root["app/layout.tsx\nhtml, body, font"] --> MainGroup["(main)/layout.tsx"]
    MainGroup --> Clerk["ClerkProvider"]
    Clerk --> Theme["ThemeProvider\nnext-themes"]
    Theme --> Header["Header - Server"]
    Theme --> Main["<main>{children}"]
    Theme --> Footer["Footer - Server"]

    Header --> Nav["Nav - Sanity categories"]
    Header --> Auth["HeaderAuth - Client"]
    Auth --> Toggle["ThemeToggle"]
    Auth --> SignedOut["SignInButton modal"]
    Auth --> SignedIn["UserButton"]

    Main --> Home["HomePage"]
    Main --> Post["PostPage"]
    Main --> Author["AuthorPage"]
    Main --> Category["CategoryPage"]

    Home --> Cards["PostCard[] grid"]
    Post --> Paywall["MembersOnlyPaywall\nif gated"]
    Post --> PT["PortableText\nrich content"]
    Post --> Cmt["Comments"]
    PT --> Code["CodeBlock - Client"]
    PT --> Img["Image - next/image"]
```

## Image Pipeline

```mermaid
flowchart LR
    Upload["Image uploaded\nto Sanity"] --> URL["urlForImage()\n@sanity/image-url"]
    URL --> URLB["urlForImage(src)\n.width(w).url()"]
    URLB --> NextImage["next/image\nfill + object-cover"]
    NextImage --> Config["next.config.ts\nremotePatterns: cdn.sanity.io"]
    Config --> HTML["Optimized image rendered"]
```

## ISR Strategy

```mermaid
sequenceDiagram
    participant User
    participant Vercel as Vercel Edge/CDN
    participant App as Next.js Server
    participant Sanity

    User->>Vercel: GET /posts/[slug]
    Vercel->>Vercel: Check cache
    alt Cache fresh (< 60s old)
        Vercel-->>User: Stale-while-revalidate HTML
        Vercel->>App: Background revalidation
        App->>Sanity: client.fetch(POST_QUERY)
        App-->>Vercel: Updated HTML
    else Cache expired (> 60s)
        Vercel->>App: Forward request
        App->>Sanity: client.fetch(POST_QUERY)
        Sanity-->>App: Post data
        App-->>Vercel: Fresh HTML
        Vercel-->>User: Fresh HTML
        Vercel->>Vercel: Update cache
    end
```

## Key Decisions

| Decision | Implementation |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Styling | Tailwind v4 with `@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, class-based dark mode |
| CMS | Sanity v6 at `/studio`, queried via GROQ |
| Auth | Clerk v7; middleware in `proxy.ts`, server `auth()`, client `SignInButton` and `UserButton`, public blog routes |
| Rendering | ISR with `revalidate = 60` on content pages |
| Image handling | Sanity `@sanity/image-url` to `next/image` with `fill` and `remotePatterns` |
| Rich content | `@portabletext/react` with custom code block, image, and heading renderers |
| Comments | Server action with `auth()` check, writes via `writeClient` with token, auto-approved |
| Types | TypeScript strict mode, `@/*` alias mapped to `./src/*` |
| SEO | Dynamic `sitemap.ts`, `robots.ts`, `generateMetadata`, dynamic OG images via `next/og` |
