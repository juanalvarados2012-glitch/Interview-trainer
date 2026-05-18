import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) return res.status(500).json({ error: "Stripe not configured" });

  const stripe = new Stripe(stripeKey);
  const rawBody = await readRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (userId && userId !== "anonymous" && process.env.CLERK_SECRET_KEY) {
      try {
        const { createClerkClient } = await import("@clerk/nextjs/server");
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await clerk.users.updateUser(userId, {
          publicMetadata: { paid: true },
        });
      } catch (e) {
        console.error("Failed to update Clerk user:", e.message);
      }
    }
  }

  return res.status(200).json({ received: true });
}
