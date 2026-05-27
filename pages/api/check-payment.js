import Stripe from "stripe";
import { getAuth, createClerkClient } from "@clerk/nextjs/server";

function normalizeEmail(e) {
  return typeof e === "string" ? e.trim().toLowerCase() : "";
}

async function userHasPaidSession(stripe, { userId, email }) {
  const target = normalizeEmail(email);

  // 1. Most reliable: any checkout session whose metadata.userId matches.
  if (userId) {
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      for (const s of sessions.data) {
        if (s.metadata?.userId === userId && s.payment_status === "paid") return s.id;
      }
    } catch (e) {
      console.error("[check-payment] list by metadata failed:", e.message);
    }
  }

  // 2. Fallback: any paid checkout session for this email.
  if (target) {
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      for (const s of sessions.data) {
        const sEmail = normalizeEmail(s.customer_details?.email || s.customer_email);
        if (sEmail === target && s.payment_status === "paid") return s.id;
      }
    } catch (e) {
      console.error("[check-payment] list by email failed:", e.message);
    }
  }

  // 3. Last resort: Stripe Customer search + charges (covers older flows that created a Customer).
  if (target) {
    try {
      const customers = await stripe.customers.list({ email: target, limit: 5 });
      for (const customer of customers.data) {
        const charges = await stripe.charges.list({ customer: customer.id, limit: 10 });
        if (charges.data.some(c => c.paid && !c.refunded)) return `charge:${customer.id}`;
      }
    } catch (e) {
      console.error("[check-payment] customer/charge lookup failed:", e.message);
    }
  }

  return null;
}

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
  const stripe = new Stripe(stripeKey);

  const proof = await userHasPaidSession(stripe, { userId, email });
  if (proof) {
    await clerk.users.updateUser(userId, {
      publicMetadata: { paid: true, stripeSessionId: proof },
    });
    console.log(`[check-payment] Pro granted to userId=${userId} (proof=${proof})`);
    return res.status(200).json({ paid: true });
  }

  return res.status(200).json({ paid: false });
}
