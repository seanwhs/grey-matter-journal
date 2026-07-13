import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/studio(.*)", // Ensure this is here
  "/categories(.*)",
  "/posts(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  // If it's NOT a public route, protect it
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // This regex says: "Match everything EXCEPT static files AND /studio"
    // By adding (?!studio) we ensure the middleware doesn't touch the studio at all.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|studio).*)",
    "/(api|trpc)(.*)",
  ],
};