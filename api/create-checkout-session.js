
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { charterId, name, email, amount, description } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: description },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      metadata: { charter_id: charterId, email },
      success_url: `${process.env.DOMAIN}/thank-you`,
      cancel_url: `${process.env.DOMAIN}/payment-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Stripe session failed" });
  }
}
