# Responsiveness Fixes

Audit and fixes applied on 2026-07-13 to make the frontend mobile-friendly across all breakpoints.

## Issues Fixed

### High Severity

| # | File | Change |
|---|---|---|
| 1 | `src/components/CodeBlock.tsx` | Wrapped `SyntaxHighlighter` in `<div className="overflow-x-auto">` so long code lines scroll instead of being cut off. |
| 2 | `src/components/Header.tsx` | Added `flex-wrap` to `<nav>` and responsive gaps (`gap-2 sm:gap-4`) so category links wrap gracefully when they exceed screen width. |
| 3 | `src/app/(main)/posts/[slug]/page.tsx` | Featured image height changed from fixed `h-96` to `h-48 sm:h-64 lg:h-96` so it doesn't consume half the viewport on mobile. |
| 4 | `src/components/PortableTextComponents.tsx` | Body images changed from fixed `h-96` to `h-48 sm:h-64 lg:h-96` for the same reason. |

### Medium Severity

| # | File | Change |
|---|---|---|
| 5 | `src/app/(main)/posts/[slug]/page.tsx` | Post title size made responsive: `text-2xl sm:text-3xl lg:text-4xl` (was `text-4xl` at all sizes). |
| 6 | `src/app/(main)/page.tsx` | Hero heading made responsive: `text-4xl sm:text-5xl lg:text-6xl` (was `text-5xl sm:text-6xl`). |
| 7 | `src/app/(main)/categories/[slug]/page.tsx` | Category heading made responsive: `text-2xl sm:text-3xl lg:text-4xl` (was `text-4xl`). |
| 8 | `src/app/(main)/authors/[slug]/page.tsx` | Author name made responsive: `text-2xl sm:text-3xl` (was `text-3xl`). |
| 9 | `src/components/PortableTextComponents.tsx` | Article body headings (h1-h3) made responsive: `text-2xl sm:text-3xl`, `text-xl sm:text-2xl`, `text-lg sm:text-xl`. |
| 10 | `src/components/Footer.tsx` | Footer changed to `flex-col sm:flex-row` with centered text on mobile so copyright and links don't overlap. |
| 11 | `src/components/PostCard.tsx` | Image container changed from fixed `h-48` to `aspect-[16/9]` for fluid scaling. |

### Low Severity

| # | File | Change |
|---|---|---|
| 12 | `src/app/(main)/authors/[slug]/page.tsx` | Author layout changed to `flex-col sm:flex-row` so avatar and bio stack on mobile. |
| 13 | `src/components/MembersOnlyPaywall.tsx` | Padding changed to `p-6 sm:p-8` to avoid being too cramped on small viewports. |

## Global Patterns

All page containers already use the correct responsive pattern: `mx-auto max-w-N px-4`. Grid layouts use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. These were already correct and remain unchanged.
