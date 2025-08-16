import SchoolHoliday from "../../../../models/PayrollModule/AdminSettings/SchoolHoliday.js";

const getSchoolHolidays = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ error: "schoolId is required." });
    }

    const holidays = await SchoolHoliday.find({ schoolId });
    res.status(200).json(holidays);
  } catch (err) {
    console.error("Error fetching holidays:", err);
    res.status(500).json({ error: "Failed to fetch holidays." });
  }
};
export default getSchoolHolidays;