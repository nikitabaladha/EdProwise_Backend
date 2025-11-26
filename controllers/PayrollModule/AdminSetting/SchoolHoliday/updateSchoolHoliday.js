import SchoolHoliday from "../../../../models/PayrollModule/AdminSettings/SchoolHoliday.js";

const updateSchoolHoliday = async (req, res) => {
  try {
    const { holidayId, holidayName } = req.body;

    if (!holidayId || !holidayName) {
      return res.status(400).json({ hasError: true, message: "Missing fields" });
    }

    const updated = await SchoolHoliday.findByIdAndUpdate(
      holidayId,
      { holidayName },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ hasError: true, message: "Holiday not found" });
    }

    return res.status(200).json({ hasError: false, message: "Holiday updated", data: updated });
  } catch (err) {
    return res.status(500).json({ hasError: true, message: "Server error" });
  }
};
export default updateSchoolHoliday;