import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { charter_id, email } = req.body;

  if (!charter_id || !email) {
    return res.status(400).json({ error: "Missing charter_id or email" });
  }

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: {
        charter_id,
        email
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${charter_id}?verified=true`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: `Error creating identity session: ${err.message}` });
  }
}
