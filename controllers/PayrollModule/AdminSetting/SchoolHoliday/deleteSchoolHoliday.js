import SchoolHoliday from "../../../../models/PayrollModule/AdminSettings/SchoolHoliday.js";

const deleteSchoolHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SchoolHoliday.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    res.status(200).json({ message: "Holiday deleted successfully." });
  } catch (err) {
    console.error("Error deleting holiday:", err);
    res.status(500).json({ error: "Failed to delete holiday." });
  }
};

export default deleteSchoolHoliday;
