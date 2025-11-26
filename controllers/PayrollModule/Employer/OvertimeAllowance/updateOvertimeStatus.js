import OvertimeApplications from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";

const updateOvertimeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        hasError: true,
        message: "Invalid status value",
      });
    }

    const updated = await OvertimeApplications.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "Overtime application not found",
      });
    }

    res.status(200).json({
      hasError: false,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    console.error("School status update error:", err);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default updateOvertimeStatus;
