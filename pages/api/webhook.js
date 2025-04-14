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
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const charterId = session.metadata?.charter_id;

    console.log("✅ Webhook received for charter_id:", charterId);

    if (!charterId) {
      console.error("❌ charter_id not found in metadata.");
      return res.status(400).json({ error: "Missing charter_id" });
    }

    try {
      const records = await base("Charters")
        .select({ filterByFormula: `{Charter ID} = '${charterId}'`, maxRecords: 1 })
        .firstPage();

      if (records.length > 0) {
        await base("Charters").update(records[0].id, {
          Status: "PAID"
        });
        console.log("✅ Airtable updated to PAID for", charterId);
      } else {
        console.warn("⚠️ No matching Airtable record for charter_id:", charterId);
      }
    } catch (airtableError) {
      console.error("❌ Airtable update failed:", airtableError);
      return res.status(500).json({ error: "Airtable update failed" });
    }
  }

  res.status(200).json({ received: true });
}


