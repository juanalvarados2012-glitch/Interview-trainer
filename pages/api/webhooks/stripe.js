import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function normalizeEmail(e) {
  return typeof e === "string" ? e.trim().toLowerCase() : "";
}

async function grantPro(clerk, { userId, email, sessionId }) {
  if (userId && userId !== "anonymous") {
    try {
      await clerk.users.updateUser(userId, {
        publicMetadata: { paid: true, stripeSessionId: sessionId || null },
      });
      console.log(`[stripe-webhook] Pro granted by userId=${userId}`);
      return true;
    } catch (e) {
      console.error(`[stripe-webhook] updateUser by id failed (${userId}):`, e.message);
    }
  }

  const normalized = normalizeEmail(email);
  if (!normalized) {
    console.warn("[stripe-webhook] No userId metadata and no email — cannot grant Pro");
    return false;
  }

  try {
    const list = await clerk.users.getUserList({ emailAddress: [normalized] });
    const found = list.data?.[0];
    if (!found) {
      console.warn(`[stripe-webhook] No Clerk user for email=${normalized} — will be picked up on first sign-in via /api/check-payment`);
      return false;
    }
    await clerk.users.updateUser(found.id, {
      publicMetadata: { paid: true, stripeSessionId: sessionId || null },
    });
    console.log(`[stripe-webhook] Pro granted by email=${normalized} (userId=${found.id})`);
    return true;
  } catch (e) {
    console.error(`[stripe-webhook] email lookup/update failed (${normalized}):`, e.message);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    console.error("[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env var");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(stripeKey);
  const rawBody = await readRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log(`[stripe-webhook] event=${event.type} id=${event.id}`);

  const paidEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);

  if (paidEvents.has(event.type)) {
    const session = event.data.object;
    if (session.payment_status && session.payment_status !== "paid") {
      console.log(`[stripe-webhook] Session ${session.id} not paid (status=${session.payment_status}) — skipping`);
      return res.status(200).json({ received: true });
    }

    if (!process.env.CLERK_SECRET_KEY) {
      console.warn("[stripe-webhook] CLERK_SECRET_KEY not set — cannot grant Pro");
      return res.status(200).json({ received: true });
    }

    const { createClerkClient } = await import("@clerk/nextjs/server");
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    const userId = session.metadata?.userId;
    const email = session.customer_details?.email || session.customer_email;

    await grantPro(clerk, { userId, email, sessionId: session.id });
  }

  return res.status(200).json({ received: true });
}
