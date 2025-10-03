import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";

const addTimePeriod = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      className,
      sectionName,
      timePeriodDetails,
    } = req.body;

    if (
      !schoolId ||
      !academicYear ||
      !className ||
      !sectionName ||
      !timePeriodDetails
    ) {
      return res
        .status(400)
        .json({ hasError: true, message: "Missing required fields" });
    }

    let record = await TimePeriod.findOne({
      schoolId,
      academicYear,
      className,
      sectionName,
    });

    if (record) {
      record.timePeriodDetails.push(...timePeriodDetails);
      await record.save();

      return res.json({
        hasError: false,
        message: "TimePeriods added successfully",
        data: record,
      });
    } else {
      const newRecord = new TimePeriod({
        schoolId,
        academicYear,
        className,
        sectionName,
        timePeriodDetails,
      });

      await newRecord.save();

      return res.json({
        hasError: false,
        message: "TimePeriod created successfully",
        data: newRecord,
      });
    }
  } catch (error) {
    console.error("Error adding TimePeriod:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default addTimePeriod;
