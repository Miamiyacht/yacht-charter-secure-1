const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { charter_id, email, amount, description, name } = req.body;

    if (!charter_id || !email || !amount || !description) {
      console.error("❌ Missing required fields", {
        charter_id,
        email,
        amount,
        description,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { charter_id },
    });

    console.log("🧾 Creating checkout session with metadata:", {
      charter_id,
      email,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customer.id,
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
        charter_id,
        email,
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
