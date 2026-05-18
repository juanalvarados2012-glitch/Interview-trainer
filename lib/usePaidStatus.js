const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function usePaidStatus() {
  if (!CLERK_ENABLED) return { isPaid: true, isLoaded: true };

  // Dynamic import so the module still loads without Clerk keys
  const { useUser } = require("@clerk/nextjs");
  const { user, isLoaded } = useUser();
  return {
    isPaid: isLoaded && (user?.publicMetadata?.paid === true),
    isLoaded,
  };
}
