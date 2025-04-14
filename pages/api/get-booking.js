import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { charterId } = req.query;

  if (!charterId) {
    return res.status(400).json({ error: "Missing charterId" });
  }

  try {
    const records = await base("Charters")
      .select({ filterByFormula: `{Charter ID} = "${charterId}"` })
      .firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const record = records[0];
    const data = record.fields;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
