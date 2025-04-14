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
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_DECLINE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;
  const object = data.object || {};
  let charterId;

  // Read metadata correctly based on event type
  if (type === "payment_intent.payment_failed") {
    charterId = object.metadata?.charter_id;
  } else if (type === "checkout.session.async_payment_failed") {
    charterId = object.metadata?.charter_id;
  }

  if (!charterId) {
    console.error("❌ No charter_id found in event metadata:", JSON.stringify(object));
    return res.status(400).json({ error: "Missing charter_id" });
  }

  try {
    const records = await base("Charters")
      .select({ filterByFormula: `{Charter ID} = '${charterId}'`, maxRecords: 1 })
      .firstPage();

    if (records.length > 0) {
      await base("Charters").update(records[0].id, {
        Status: "DECLINED"
      });
      console.log(`❗ Payment failed – marked DECLINED for charter_id: ${charterId}`);
    } else {
      console.warn(`⚠️ No matching Airtable record for charter_id: ${charterId}`);
    }
  } catch (err) {
    console.error("❌ Airtable update failed:", err.message);
    return res.status(500).json({ error: "Airtable update failed" });
  }

  return res.status(200).json({ received: true });
}

