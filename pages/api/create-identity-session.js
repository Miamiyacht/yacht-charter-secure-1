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
      return_url: `${process.env.BASE_URL}/verify/${charter_id}?verified=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating identity session:', err);
    res.status(500).json({ error: 'Failed to create identity session' });
  }
}

