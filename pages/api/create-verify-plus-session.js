import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { charterId, email } = req.body;

  if (!charterId || !email) {
    return res.status(400).json({ error: "Missing charterId or email" });
  }

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      options: {
        selfie: true // ✅ this is a true boolean (NOT a string)
      },
      return_url: `${process.env.DOMAIN}/verify-plus/${charterId}?verified=true`,
      metadata: {
        charter_id: charterId,
        email
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating Tier 3 identity session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
