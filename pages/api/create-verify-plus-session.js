import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, charter_id } = req.body;

  if (!email || !charter_id) {
    return res.status(400).json({ error: "Missing email or charter_id" });
  }

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        charter_id,
        email
      },
      return_url: `${process.env.DOMAIN}/verify-plus/${charter_id}?verified=true`,
      options: {
        document: {
          require_matching_selfie: true
        }
      }
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Error creating Tier 3 identity session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
