# Authentication & Authorization with Clerk

A reference for my future self — how auth works in this project, what Clerk is, and why "Register" works without us writing any registration code.

---

## Table of Contents

1. [What is Clerk?](#1-what-is-clerk)
2. [The Big Mental Model: What Clerk Owns vs What We Own](#2-the-big-mental-model)
3. [How Accounts Get Created (Sign-Up / Register)](#3-how-accounts-get-created)
4. [How Login Works](#4-how-login-works)
5. [How Logout Works](#5-how-logout-works)
6. [The 5 Integration Points in This Project](#6-the-5-integration-points)
7. [Server-Side: auth() vs currentUser()](#7-server-side-auth-vs-currentuser)
8. [Client-Side: Pre-built Components](#8-client-side-pre-built-components)
9. [Members-Only Gating (Authorization)](#9-members-only-gating)
10. [Middleware: Route Protection](#10-middleware-route-protection)
11. [Session Internals (What You Don't Need to Touch)](#11-session-internals)
12. [Clerk Dashboard](#12-clerk-dashboard)

---

## 1. What is Clerk?

Clerk is **auth as a service**. Like Auth0 or Firebase Auth, but simpler and with pre-built React components.

What Clerk provides that we **don't have to build**:

| Feature | Handled by Clerk |
|---|---|
| User database | Clerk stores all users on their servers |
| Password hashing | Handled server-side by Clerk |
| Email verification | Clerk sends + verifies emails |
| Password reset flow | Complete UI + logic provided |
| Social login (Google, GitHub, etc.) | Toggle in Clerk dashboard |
| Session management | Clerk issues + refreshes encrypted cookies |
| MFA / 2FA | Toggle in dashboard |
| User profile management | Clerk provides `<UserProfile>` component |
| Bot detection | Built into sign-up flows |

What **we** write:

| Piece | Where |
|---|---|
| Clerk `publishableKey` + `secretKey` | `.env.local` |
| `<ClerkProvider>` wrapping the app | `(main)/layout.tsx` |
| Middleware to protect routes | `proxy.ts` |
| Sign in / Sign up page shells | `sign-in/` + `sign-up/` pages |
| UI buttons (Sign In, User Avatar) | `HeaderAuth.tsx`, `MembersOnlyPaywall.tsx` |
| Server-side auth checks | `posts/[slug]/page.tsx`, `actions/comments.ts` |

---

## 2. The Big Mental Model

```
                     clerk.com (SaaS)
                    ┌───────────────────┐
                    │   User Database    │
                    │   Session Store     │
                    │   Email Service     │
                    │   OAuth Providers    │
                    └────────┬──────────┘
                             │ HTTPS + Cookies
                    ┌────────▼──────────┐
                    │   Our Next.js App  │
                    │                    │
                    │  ClerkProvider ────┤  <-- context for all Clerk components
                    │  clerkMiddleware ──┤  <-- protect routes at edge/request level
                    │  auth() ──────────┤  <-- get userId on the server
                    │  currentUser() ───┤  <-- get full user on the server
                    │  <SignIn> ────────┤  <-- rendered UI for login
                    │  <SignUp> ────────┤  <-- rendered UI for registration
                    │  <UserButton> ────┤  <-- avatar + dropdown (manage account / sign out)
                    └──────────────────┘
```

**Key insight**: Clerk is an **external service**. Our app talks to Clerk via the `@clerk/nextjs` SDK. Clerk owns the authentication *process* (UI flows, password validation, email sending, session tokens). We own the *integration points* (where to render the UI, which routes to protect, how to use the user's identity).

---

## 3. How Accounts Get Created

### The Short Answer

We never write registration code. Clerk provides a `<SignUp>` component. When a user fills out the form and clicks "Create Account", the form POSTs directly to `clerk.com`. Clerk creates the user record, starts a session, sets a cookie, and redirects back to our app. Our app then sees `userId` is defined.

### The Flow Step by Step

```
User clicks "Create Account" button
        │
        ▼
<SignUpButton mode="modal">            ← our code in MembersOnlyPaywall.tsx
        │
        ▼
Clerk opens a modal dialog             ← Clerk's code (invisible to us)
  - email + password fields
  - (optionally) social login buttons
  - name, username, etc.
        │
        ▼
User fills out and submits
        │
        ▼
POST to clerk.com                       ← NOT to our server
  Clerk validates:
  - email format
  - password strength
  - bot detection (turnstile/hcaptcha)
  - email verification (if enabled)
        │
        ▼
Clerk creates user in its database
  - assigns a unique `userId` (e.g. "user_2abc123...")
  - creates a session
  - sets `__session` cookie on our domain
        │
        ▼
Redirect back to our app
        │
        ▼
Next.js middleware (`proxy.ts`) reads the cookie
  - Clerk middleware validates it with clerk.com
  - request now has auth context
        │
        ▼
Our React components re-render
  - <Show when="signed-in"> renders instead of <Show when="signed-out">
  - auth() now returns { userId: "user_2abc123..." }
```

### Where Users Can Sign Up

In this project there are **three** places a user can trigger sign-up:

1. **MembersOnlyPaywall** (`src/components/MembersOnlyPaywall.tsx:16`) — "Create Account" button on members-only posts
2. **HeaderAuth** (`src/components/HeaderAuth.tsx:12`) — "Sign In" button (which has a "Create account" link inside Clerk's modal)
3. **`/sign-up` page** (`src/app/(main)/sign-up/[[...sign-up]]/page.tsx`) — direct URL if someone navigates there

All three render Clerk's `<SignUp>` component or `<SignUpButton>`. Clerk handles everything after the click.

### Social Login

If enabled in the [Clerk Dashboard](https://dashboard.clerk.com) (under "Social Connections"), Clerk shows Google/GitHub/etc. buttons in the sign-up form. When clicked, Clerk redirects to the OAuth provider, gets a token, creates the user, and returns to our app. **Zero code changes needed** to add social login — it's a toggle.

---

## 4. How Login Works

Same pattern as sign-up — Clerk does the heavy lifting.

```
User clicks "Sign In"
        │
        ▼
<SignInButton mode="modal">              ← our code
        │
        ▼
Clerk opens a modal with email + password fields
  - (or social login buttons)
        │
        ▼
User submits credentials
        │
        ▼
POST to clerk.com
  - Clerk validates email + password hash
  - Creates session
  - Sets __session cookie
        │
        ▼
Redirect back to our app
  - auth() now returns { userId }
```

The sign-in page at `/sign-in` (`src/app/(main)/sign-in/[[...sign-in]]/page.tsx`) renders `<SignIn />` — Clerk's pre-built full-page component. It's a fallback in case the modal doesn't work or user navigates there directly.

---

## 5. How Logout Works

Logout is triggered by `<UserButton />` (`src/components/HeaderAuth.tsx:19`). This renders a small avatar icon. When clicked, it shows a dropdown with "Manage account" and "Sign out".

```
User clicks avatar → "Sign out"
        │
        ▼
Clerk's UserButton component handles it
  - POSTs to clerk.com to invalidate session
  - Removes __session cookie
  - Re-renders the app
  - auth() now returns { userId: null }
```

No code on our side. Clerk's `<UserButton>` handles everything.

---

## 6. The 5 Integration Points

### 6.1 Dependency & Environment (`package.json` + `.env.local`)

```json
"@clerk/nextjs": "^7.5.17"
```

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Public — safe in client code
CLERK_SECRET_KEY=                      # Secret — server-only
```

The publishable key identifies our app to Clerk. The secret key authenticates our server to Clerk's API. Both come from the Clerk Dashboard.

### 6.2 ClerkProvider (`src/app/(main)/layout.tsx`)

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>...</html>
    </ClerkProvider>
  );
}
```

This wraps the app and provides Clerk context to all components. Without it, `<SignIn>`, `<UserButton>`, `<Show>`, `auth()`, and `currentUser()` won't work.

### 6.3 Middleware (`src/proxy.ts`)

```tsx
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", "/sign-in(.*)", "/sign-up(.*)", "/studio(.*)", "/categories(.*)", "/posts(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

This runs on **every request** (matching the config matcher). For non-public routes (like `/dashboard` if we had one), it redirects to sign-in. Public routes pass through — the middleware just attaches auth context to the request.

**Why `proxy.ts` and not `middleware.ts`?** Next.js by default looks for `middleware.ts`. The file is named `proxy.ts` but is registered as middleware via Next.js config (or it just works because of the `matcher` export). This is a deliberate naming choice — the AGENTS.md docs mention it.

### 6.4 Server-Side Helpers (`auth()` and `currentUser()`)

Used in:

- **PostPage** (`src/app/(main)/posts/[slug]/page.tsx:46`):
  ```tsx
  const { userId } = await auth();
  const canViewFullContent = !post.isMembersOnly || Boolean(userId);
  ```

- **Comment submission** (`src/app/actions/comments.ts:8-17`):
  ```tsx
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  ```

Both functions are imported from `@clerk/nextjs/server`. Both return `Promise<>` — must be `await`ed.

`auth()` is lightweight — it just reads the `__session` cookie and validates it with Clerk. `currentUser()` makes an API call to Clerk to fetch the full user profile (name, avatar, email, etc.).

### 6.5 Pre-Built UI Components

| Component | File | Purpose |
|---|---|---|
| `<SignInButton mode="modal">` | `HeaderAuth.tsx`, `MembersOnlyPaywall.tsx` | Renders a button that opens sign-in modal on click |
| `<SignUpButton mode="modal">` | `MembersOnlyPaywall.tsx` | Renders a button that opens sign-up modal on click |
| `<UserButton />` | `HeaderAuth.tsx` | Renders user avatar + dropdown (manage/sign out) |
| `<Show when="signed-in/out">` | `HeaderAuth.tsx`, `Comments.tsx` | Conditionally renders children based on auth state |
| `<SignIn />` | `sign-in/[[...sign-in]]/page.tsx` | Full-page sign-in form (fallback) |
| `<SignUp />` | `sign-up/[[...sign-up]]/page.tsx` | Full-page sign-up form (fallback) |

---

## 7. Server-Side: auth() vs currentUser()

Both imported from `@clerk/nextjs/server`:

| Function | What it does | API call to Clerk? | When to use |
|---|---|---|---|
| `auth()` | Reads + validates the `__session` cookie, returns `{ userId }` (or empty object if not signed in) | No (validates locally via signed cookie) | Everywhere — checking if user is logged in, passing userId to queries |
| `currentUser()` | Fetches the full user profile from Clerk's API — name, email, imageUrl, username, etc. | Yes (HTTP to clerk.com) | When you need user details (e.g. comment submission to get `fullName` and `imageUrl`) |

**Always `await` both.** They return Promises.

```tsx
// ✅ Correct
const { userId } = await auth();
const user = await currentUser();

// ❌ Wrong — these are Promises, not plain objects
const { userId } = auth();               // { userId } is undefined
```

---

## 8. Client-Side: Pre-Built Components

Clerk's client components (`@clerk/nextjs`) work via React context (set up by `<ClerkProvider>`). They dynamically control what renders:

```tsx
// Only renders children when user is signed in
<Show when="signed-in">
  <UserButton />
</Show>

// Only renders children when user is signed out
<Show when="signed-out">
  <SignInButton mode="modal" />
</Show>
```

The `<Show>` component replaces the older `<SignedIn>` / `<SignedOut>` components. It's more flexible — you could do `<Show when="signed-in" fallback={<LoginButton />}>`.

**`mode="modal"`** means the sign-in/sign-up form appears as a modal overlay instead of navigating to a separate page. This keeps the user on the current page. If the modal fails to load (e.g. JavaScript disabled), the user can navigate to `/sign-in` or `/sign-up` directly as a fallback.

---

## 9. Members-Only Gating (Authorization)

This project has **authorization** (not just authentication) — some content is restricted to signed-in users.

```tsx
// src/app/(main)/posts/[slug]/page.tsx:46-47
const { userId } = await auth();
const canViewFullContent = !post.isMembersOnly || Boolean(userId);
```

- `auth()` is called **server-side** inside a React Server Component
- `userId` is a Clerk user ID (e.g. `"user_2abc123..."`) or `null`
- If `post.isMembersOnly === true` AND `userId` is null, the full content is hidden and a paywall is shown instead

**This is server-side gating.** The user cannot bypass it by inspecting client-side code or manipulating the DOM. The full post body is never sent to the client unless `canViewFullContent` is true.

---

## 10. Middleware: Route Protection

The middleware (`src/proxy.ts`) runs on every request before it reaches a page:

```tsx
const isPublicRoute = createRouteMatcher([
  "/",                    // homepage
  "/sign-in(.*)",         // sign-in page
  "/sign-up(.*)",         // sign-up page
  "/studio(.*)",          // Sanity Studio
  "/categories(.*)",      // category pages
  "/posts(.*)",           // post pages (individual gating happens inside the page)
]);

if (!isPublicRoute(request)) {
  await auth.protect();   // redirects to sign-in if not authenticated
}
```

**The matcher config** (the weird regex at the bottom) tells Next.js which routes the middleware should run on at all. Routes not matching the regex bypass middleware entirely (speeds up static file serving and the Sanity Studio).

```
"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|...)|studio).*)"
```

This regex: "match everything EXCEPT `_next`, file extensions, and `/studio`".

---

## 11. Session Internals

You do not need to touch these, but understanding them helps:

1. **Session cookie**: Clerk sets a cookie named `__session` on our domain. It's an encrypted payload containing the session ID and a signature. Clerk validates the signature on every request.

2. **Automatic refresh**: When the session is about to expire, Clerk's client-side SDK (`@clerk/nextjs` bundled in `<ClerkProvider>`) automatically refreshes it by talking to clerk.com. No code needed.

3. **No database tables**: We never store user records in our database. The `userId` string (like `"user_2abc123"`) is the foreign key we reference in Sanity — the `comment` documents store `userId` as a plain string field.

4. **Auth state lifecycle**:
   ```
   Request arrives → middleware runs → auth context attached → page renders
                                     ↓
                              auth() reads the cookie
                              validates signature
                              returns { userId } or null
   ```

---

## 12. Clerk Dashboard

The Clerk Dashboard at [https://dashboard.clerk.com](https://dashboard.clerk.com) is where you configure:

| Setting | Location in Dashboard | Impact |
|---|---|---|
| API Keys | "API Keys" tab | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` |
| Social login | "User & Authentication" → "Social Connections" | Enable Google, GitHub, etc. — appears in sign-in/sign-up modals automatically |
| Email + Password auth | "User & Authentication" → "Email, Phone, Username" | Configure which fields sign-up collects |
| Email verification | "User & Authentication" → "Email" | Require email verification before sign-in |
| Customization | "Customization" tab | Brand colors, logo, redirect URLs |
| Users | "Users" tab | View, search, ban, or impersonate users |
| Sessions | "Sessions" tab | View active sessions, revoke them |
| Webhooks | "Webhooks" tab | Fire events to your server when users are created/updated/deleted (useful for syncing to your database) |

---

## Summary: What Happens Where

| Action | Code we wrote | Code Clerk owns |
|---|---|---|
| User clicks "Sign In" | `<SignInButton mode="modal">` in `HeaderAuth.tsx` | Opening modal, form fields, validation, POST to clerk.com |
| User fills in email + password | — | Form UI, hashing, API call |
| User submits | — | Clerk validates, creates session, sets cookie |
| User is now "signed in" | `auth()` in page.tsx reads cookie | `clerkMiddleware` validated the session |
| User clicks "Create Account" | `<SignUpButton>` or `<SignUp />` | Full registration UI + logic |
| User clicks avatar → "Sign Out" | `<UserButton />` in `HeaderAuth.tsx` | POST to clerk.com, clear cookie |
| Members-only post gating | `auth()` → check `post.isMembersOnly` | Just provides `userId`; gating logic is ours |

**Bottom line**: Clerk is a black box for auth *processes*. We just render its components and read its `userId`. Everything from password storage to session rotation to email verification happens on Clerk's servers, invisible to us.
