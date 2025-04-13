const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { charterId, name, email, amount, description } = req.body;

  if (!charterId || !email || !amount || !description) {
    console.error("❌ Missing required fields:", { charterId, email, amount, description });
    return res.status(400).json({ error: "Missing required booking data." });
  }

  try {
    // 1. Create a Stripe Customer with metadata
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        charter_id: charterId
      }
    });

    // 2. Create a Checkout Session with metadata and future card storage
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: customer.id,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: description,
          },
        },
        quantity: 1,
      }],
      metadata: {
        charter_id: charterId,
        email: email
      },
      payment_intent_data: {
        setup_future_usage: "on_session" // ✅ Store card for future manual charges
      },
      success_url: `${process.env.DOMAIN}/thank-you`,
      cancel_url: `${process.env.DOMAIN}/payment-cancelled`
    });

    console.log("✅ Created checkout session for charter:", charterId);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("🔥 Stripe Checkout creation failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

