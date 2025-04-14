import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { charter_id, email, amount, description } = req.body;

  if (!charter_id || !email || !amount || !description) {
    console.error('❌ Missing required fields', { charter_id, email, amount, description });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const customer = await stripe.customers.create({
      email,
      metadata: { charter_id },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: description },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/thank-you`,
      cancel_url: `${process.env.BASE_URL}/payment-cancelled`,
      metadata: { charter_id, email },
      customer_email: email,
      customer_creation: 'always',
      setup_future_usage: 'on_session',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe error:', err);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
}
