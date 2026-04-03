import OvertimeApplications from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";

const applyOvertime = async (req, res) => {
  try {
    const {
      schoolId,
      employeeId,
      academicYear,
      category,
      grade,
      overtimeDate,
      fromTime,
      toTime,
      totalHours,
      rate,
      calculatedAmount,
    } = req.body;

    // console.log(req.body);

    // if (
    //   !schoolId ||
    //   !employeeId ||
    //   !academicYear ||
    //   !category ||
    //   !grade ||
    //   !overtimeDate ||
    //   !fromTime ||
    //   !toTime
    // ) {
    //   return res.status(400).json({
    //     hasError: true,
    //     message: "Missing required fields",
    //   });
    // }

    if (
      !schoolId ||
      !employeeId ||
      !academicYear ||
      !category ||
      !grade ||
      !overtimeDate ||
      !fromTime ||
      !toTime
    ) {
      const missingFields = [];

      if (!schoolId) missingFields.push("schoolId");
      if (!employeeId) missingFields.push("employeeId");
      if (!academicYear) missingFields.push("academicYear");
      if (!category) missingFields.push("category");
      if (!grade) missingFields.push("grade");
      if (!overtimeDate) missingFields.push("overtimeDate");
      if (!fromTime) missingFields.push("fromTime");
      if (!toTime) missingFields.push("toTime");

      return res.status(400).json({
        hasError: true,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const newRecord = new OvertimeApplications({
      schoolId,
      employeeId,
      academicYear,
      category,
      grade,
      overtimeDate,
      fromTime,
      toTime,
      totalHours: parseFloat(totalHours.toFixed(2)),
      rate: parseFloat(rate.toFixed(2)),
      calculatedAmount: parseFloat(calculatedAmount.toFixed(2)),
      status: "pending",
    });

    await newRecord.save();

    res.status(200).json({
      hasError: false,
      message: "Overtime application submitted successfully",
      data: newRecord,
    });
  } catch (err) {
    console.error("Overtime Application Error:", err);
    res.status(500).json({
      hasError: true,
      message: "Internal Server Error",
    });
  }
};

export default applyOvertime;
