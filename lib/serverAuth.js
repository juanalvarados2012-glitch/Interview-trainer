import { getAuth, createClerkClient } from "@clerk/nextjs/server";

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY;

export async function getIsPaid(req) {
  if (!CLERK_ENABLED) return true;
  try {
    const { userId } = getAuth(req);
    if (!userId) return false;
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    return user.publicMetadata?.paid === true;
  } catch {
    return false;
  }
}
