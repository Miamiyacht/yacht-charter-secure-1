
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  const { charterId } = req.query;

  try {
    const records = await base("Charters")
      .select({ filterByFormula: `{Charter ID} = '${charterId}'` })
      .firstPage();

    if (records.length === 0) return res.status(404).json({ error: "Charter not found" });

    res.status(200).json(records[0].fields);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
}
