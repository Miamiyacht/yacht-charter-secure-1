import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { charterId, email } = req.body;
  console.log("📨 Received request:", { charterId, email });

  if (!charterId || !email) {
    console.error("❌ Missing charterId or email", { charterId, email });
    return res.status(400).json({ error: "Missing charterId or email" });
  }

  try {
    const customer = await stripe.customers.create({
      email,
      metadata: { charter_id: charterId }
    });

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      return_url: `${process.env.DOMAIN}/verify/${charterId}?verified=true`,
      metadata: {
        charter_id: charterId,
        email
      },
      customer: customer.id
    });

    console.log("✅ Created verification session:", session.id);
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Error creating identity session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
