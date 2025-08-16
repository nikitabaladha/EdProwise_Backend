import OvertimeApplications from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";

const deleteOvertimeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await OvertimeApplications.findById(id);

    if (!existing) {
      return res.status(404).json({
        hasError: true,
        message: "Overtime application not found",
      });
    }

    if (existing.status !== "pending") {
      return res.status(403).json({
        hasError: true,
        message: "Only pending applications can be deleted",
      });
    }

    await existing.deleteOne();

    res.status(200).json({
      hasError: false,
      message: "Overtime application deleted successfully",
    });
  } catch (err) {
    console.error("Employee delete overtime error:", err);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default deleteOvertimeDetails;
