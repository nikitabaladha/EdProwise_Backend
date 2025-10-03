import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";
const getTimePeriodForSchool = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    const records = await TimePeriod.find({ schoolId, academicYear });

    if (!records || records.length === 0) {
      return res
        .status(404)
        .json({ hasError: true, message: "No TimePeriods found" });
    }

    res.json({ hasError: false, count: records.length, data: records });
  } catch (error) {
    console.error("Error fetching TimePeriods:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default getTimePeriodForSchool;
