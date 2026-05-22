const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

let middleware;

if (CLERK_ENABLED) {
  const { clerkMiddleware } = require("@clerk/nextjs/server");
  middleware = clerkMiddleware();
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
