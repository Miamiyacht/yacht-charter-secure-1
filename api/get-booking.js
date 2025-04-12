import Airtable from "airtable";

// Connect to Airtable using your environment variables
const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { charterId } = req.query;

  if (!charterId) {
    return res.status(400).json({ error: "Missing charterId in query" });
  }

  try {
    // Search the "Charters" table for a record matching the Charter ID
    const records = await base("Charters")
      .select({
        filterByFormula: `{Charter ID} = '${charterId}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      return res.status(404).json({ error: "Charter not found" });
    }

    // Return the record's fields
    return res.status(200).json(records[0].fields);
  } catch (err) {
    console.error("❌ Airtable error:", err);
    return res.status(500).json({ error: "Failed to fetch booking" });
  }
}
