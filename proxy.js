const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let middleware;

if (CLERK_ENABLED) {
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");
  const isPublic = createRouteMatcher(["/", "/api/webhooks/(.*)"]);
  middleware = clerkMiddleware((auth, req) => {
    if (!isPublic(req)) auth.protect();
  });
} else {
  middleware = () => undefined;
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
