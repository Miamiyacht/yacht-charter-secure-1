const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { charterId, name, email, amount, description } = req.body;

  if (!charterId || !email || !amount || !description) {
    console.error("❌ Missing required fields:", { charterId, email, amount, description });
    return res.status(400).json({ error: "Missing required booking data." });
  }

  console.log("🧾 Creating checkout session with metadata:", {
    charter_id: charterId,
    email: email
  });

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
      metadata: {
        charter_id: charterId,
        email: email,
      },
      success_url: `${process.env.DOMAIN}/thank-you`,
      cancel_url: `${process.env.DOMAIN}/payment-cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("🔥 Stripe session creation failed:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
