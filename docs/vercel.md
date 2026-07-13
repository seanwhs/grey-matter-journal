# Vercel — Deployment Primer

GreyMatter Journal is deployed on Vercel's Hobby plan at [grey-matter-journal.vercel.app](https://grey-matter-journal.vercel.app/).

---

## 1. How It Works

Push to `main` → GitHub webhook notifies Vercel → Vercel runs `npm run build` → deploys the output.

No manual steps, no CI config — Vercel picks up the `next build` output automatically.

---

## 2. Project Settings

These are configured in the Vercel dashboard (not in this repo):

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `npm run build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |
| Node Version | 20.x (Vercel default, matches `.nvmrc` if present) |
| Git Integration | `seanwhs/grey-matter-journal`, branch `main` |
| Auto-deploy | On every push to `main` |

---

## 3. Environment Variables

All set in Vercel Dashboard → Project → Settings → Environment Variables.

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity dashboard | Public — prefixed with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Public |
| `NEXT_PUBLIC_SITE_URL` | `https://grey-matter-journal.vercel.app` | Public — used for OG images, canonical URLs, sitemap |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard | Public |
| `CLERK_SECRET_KEY` | Clerk dashboard | **Secret** — never exposed to browser |
| `SANITY_API_WRITE_TOKEN` | Sanity dashboard → API → Tokens | **Secret** — used by server actions for comments |

Add new env vars in **two places**: Vercel (production) and `.env.local` (local dev).

---

## 4. The Deploy Lifecycle

```
git push origin main
  │
  ▼
GitHub receives push → fires webhook to Vercel
  │
  ▼
Vercel clones repo → runs `npm install` → runs `npm run build`
  │
  ▼
.next/ output is deployed to Vercel's edge network
  │
  ▼
Old deployment receives traffic-drain → new deployment goes live
  (zero-downtime — active requests finish on the old version)
```

To watch a deploy in real time:

```bash
npx vercel logs grey-matter-journal
# or: open https://vercel.com/seanwhs/grey-matter-journal
```

---

## 5. Preview Deployments

Every PR branch gets its own preview URL automatically. Useful for testing before merging.

```bash
git checkout -b feat/foo
# make changes, commit
git push origin feat/foo
```

Vercel comments on the PR with the preview URL. Preview deployments use the same environment variables as production.

---

## 6. ISR on Vercel

All content pages use `export const revalidate = 60`. On Vercel:

- First request after a deploy renders on the server and caches the result
- Subsequent requests within 60 seconds serve the cached page (instant)
- After 60 seconds, the next request triggers a background re-render; the stale cache is served until the new one is ready
- Sanity webhooks + `revalidateTag()` would replace this polling pattern (future improvement)

ISR is included in the Hobby plan — no additional cost.

---

## 7. Verifying a Deploy

```bash
# Check that the build passes locally first
npm run build

# Push to trigger Vercel deploy
git push origin main

# Then visit:
#   https://grey-matter-journal.vercel.app/
#   https://vercel.com/seanwhs/grey-matter-journal (deploy logs)
```

Use `curl -I https://grey-matter-journal.vercel.app/` to check response headers and confirm the latest deploy is live (`x-vercel-id` header).

---

## 8. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Build fails with TS errors | Type violation in new code | Run `npx tsc --noEmit` locally before pushing |
| Old content still showing | ISR cache not refreshed | Wait 60s or trigger a new deploy (empty commit: `git commit --allow-empty -m "purge cache" && git push`) |
| 404 on a page you just created | Route not exported / ISR not triggered | Ensure the page has `export const revalidate = 60` and `generateStaticParams` if using SSG |
| Env var not working | Missing from Vercel dashboard | Add it in Vercel → Settings → Environment Variables, then redeploy |
| OG images broken | `NEXT_PUBLIC_SITE_URL` wrong | Check it's set to `https://grey-matter-journal.vercel.app` (no trailing slash) |
| Studio loads but can't log in | Studio uses Sanity auth, not Clerk | Ensure `SANITY_API_WRITE_TOKEN` is set and Studio is excluded from Clerk middleware |

---

## 9. Useful Vercel CLI Commands

```bash
npm i -g vercel            # Install the CLI
npx vercel --version       # Check installed version
npx vercel list            # List all deployments
npx vercel inspect         # Inspect current deployment
npx vercel logs            # Stream deployment logs
npx vercel env pull        # Pull production env vars into .env.local
```

---

## 10. Costs

Hobby plan (current): Free.

| Feature | Included |
|---|---|
| Bandwidth | 100 GB / month |
| Serverless Functions | 100 GB-hours / month |
| Build minutes | 6,000 min / month |
| Team members | 1 |
| Preview deployments | Unlimited |
| ISR | Yes |

This project will stay well within free-tier limits. If it grows, upgrade to Pro ($20/mo) for more bandwidth and team features.
