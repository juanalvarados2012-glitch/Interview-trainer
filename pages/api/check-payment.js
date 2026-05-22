import Stripe from "stripe";
import { getAuth, createClerkClient } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (!stripeKey || !clerkSecret) return res.status(200).json({ paid: false });

  const clerk = createClerkClient({ secretKey: clerkSecret });
  const user = await clerk.users.getUser(userId);

  if (user.publicMetadata?.paid) return res.status(200).json({ paid: true });

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) return res.status(200).json({ paid: false });

  try {
    const stripe = new Stripe(stripeKey);
    const customers = await stripe.customers.list({ email, limit: 5 });
    for (const customer of customers.data) {
      const charges = await stripe.charges.list({ customer: customer.id, limit: 5 });
      const paid = charges.data.some(c => c.paid && !c.refunded);
      if (paid) {
        await clerk.users.updateUser(userId, { publicMetadata: { paid: true } });
        return res.status(200).json({ paid: true });
      }
    }
  } catch (e) {
    console.error("Stripe check failed:", e.message);
  }

  return res.status(200).json({ paid: false });
}
