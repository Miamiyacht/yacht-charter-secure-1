import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { charter_id, email } = req.body;

  if (!charter_id || !email) {
    return res.status(400).json({ error: 'Missing charter_id or email' });
  }

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { charter_id, email },
      options: {
        document: { require_matching_selfie: true }
      },
      return_url: `${process.env.BASE_URL}/verify-plus/${charter_id}?verified=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating Tier 3 identity session:', err);
    res.status(500).json({ error: 'Failed to create Tier 3 identity session' });
  }
}
