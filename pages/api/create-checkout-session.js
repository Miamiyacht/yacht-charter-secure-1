const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { charterId, email, amount, description } = req.body;

    if (!charterId || !email || !amount || !description) {
      console.error("❌ Missing required fields", { charterId, email, amount, description });
      return res.status(400).json({ error: "Missing required booking info" });
    }

    console.log("🧾 Creating checkout session with metadata:", {
      charter_id: charterId,
      email
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        charter_id: charterId,
        email,
      },
      payment_intent_data: {
        metadata: {
          charter_id: charterId,
          email,
        },
      },
      success_url: `${process.env.DOMAIN}/thank-you`,
      cancel_url: `${process.env.DOMAIN}/payment-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("🔥 Stripe Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
