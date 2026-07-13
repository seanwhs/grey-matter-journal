import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/studio(.*)",
  "/categories(.*)",
  "/posts(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all non-public routes (e.g. admin pages)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match everything EXCEPT static files and the /studio route (handled separately)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|studio).*)",
    "/(api|trpc)(.*)",
  ],
};
