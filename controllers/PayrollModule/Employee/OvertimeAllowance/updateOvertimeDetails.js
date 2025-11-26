import OvertimeApplications from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";

const updateOvertimeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    
    const {
      overtimeDate,
      fromTime,
      toTime,
      totalHours,
      rate,
      calculatedAmount,
    } = req.body;

    const existing = await OvertimeApplications.findById(id);
    console.log(existing);
    
    if (!existing) {
      return res.status(404).json({
        hasError: true,
        message: "Overtime application not found",
      });
    }

    if (existing.status !== "pending") {
      return res.status(403).json({
        hasError: true,
        message: "Only pending applications can be updated",
      });
    }

    existing.overtimeDate = overtimeDate;
    existing.fromTime = fromTime;
    existing.toTime = toTime;
    existing.totalHours = parseFloat(totalHours.toFixed(2));
    existing.rate = parseFloat(rate.toFixed(2));
    existing.calculatedAmount = parseFloat(calculatedAmount.toFixed(2));

    await existing.save();

    res.status(200).json({
      hasError: false,
      message: "Overtime application updated",
      data: existing,
    });
  } catch (err) {
    console.error("Employee update overtime error:", err);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default updateOvertimeDetails;
