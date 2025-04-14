import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { charter_id, email, amount, description } = req.body;

  if (!charter_id || !email || !amount || !description) {
    return res.status(400).json({ error: "Missing required fields", charter_id, email, amount, description });
  }

  try {
    const customer = await stripe.customers.create({
      email,
      metadata: { charter_id }
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: description
          }
        },
        quantity: 1
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancelled`,
      metadata: {
        charter_id,
        email
      },
      customer_email: email,
      payment_intent_data: {
        metadata: {
          charter_id,
          email
        }
      },
      setup_future_usage: "on_session"
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

