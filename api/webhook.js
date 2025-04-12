
import { buffer } from "micro";
import Stripe from "stripe";
import Airtable from "airtable";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const { metadata } = event.data.object;
    const charterId = metadata.charter_id;

    const records = await base("Charters")
      .select({ filterByFormula: `{Charter ID} = '${charterId}'` })
      .firstPage();

    if (records.length > 0) {
      await base("Charters").update(records[0].id, {
        Status: "PAID"
      });
    }
  }

  res.status(200).json({ received: true });
}
