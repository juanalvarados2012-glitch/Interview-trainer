import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: "Stripe not configured" });

  const stripe = new Stripe(stripeKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const amount = parseInt(process.env.STRIPE_PRICE_AMOUNT || "2900", 10); // $29.00

  let userId = null;
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { getAuth } = await import("@clerk/nextjs/server");
      userId = getAuth(req).userId;
    } catch {}
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: "InterviewHub — Lifetime Access",
            description: "Unlimited AI interview practice, forever.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    metadata: { userId: userId ?? "anonymous" },
  });

  return res.status(200).json({ url: session.url });
}
