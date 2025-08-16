import SchoolHoliday from "../../../../models/PayrollModule/AdminSettings/SchoolHoliday.js";

const createSchoolHoliday = async (req, res) => {
  try {
    const { schoolId, holidayName, date } = req.body;

    if (!schoolId || !holidayName || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newHoliday = new SchoolHoliday({ schoolId, holidayName, date });
    await newHoliday.save();

    res.status(201).json(newHoliday);
  } catch (err) {
    console.error("Error posting holiday:", err);
    res.status(500).json({ error: "Failed to add holiday." });
  }
};

export default createSchoolHoliday;
