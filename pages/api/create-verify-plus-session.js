// pages/api/create-verify-plus-session.js

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { charter_id, email } = req.body;

  if (!charter_id || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      return_url: `https://yacht-charter-secure-1.vercel.app/verify-plus/${charter_id}?verified=true`,
      metadata: {
        charter_id,
        email,
      },
      options: {
        document: {
          require_matching_selfie: true,
        },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating Tier 3 identity session:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
