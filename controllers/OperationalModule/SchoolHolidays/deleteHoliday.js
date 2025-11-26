// import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";
// const deleteHoliday = async (req, res) => {
//   try {
//     const { schoolId, academicYear, holidayDate, holidayName } = req.body;

//     const date = new Date(holidayDate);
//     const record = await OperationalSchoolHoliday.findOne({
//       schoolId,
//       academicYear,
//     });

//     if (!record)
//       return res.json({ hasError: true, message: "No record found" });

//     const holiday = record.holidayDetails.find(
//       (h) => h.holidayDate.toDateString() === date.toDateString()
//     );

//     if (!holiday)
//       return res.json({ hasError: true, message: "Holiday not found" });

//     holiday.holidayNames = holiday.holidayNames.filter(
//       (h) => h !== holidayName
//     );

//     if (holiday.holidayNames.length === 0) {
//       record.holidayDetails = record.holidayDetails.filter(
//         (h) => h.holidayDate.toDateString() !== date.toDateString()
//       );
//     }

//     await record.save();
//     return res.json({
//       hasError: false,
//       message: "Holiday deleted",
//       data: record,
//     });
//   } catch (err) {
//     return res.status(500).json({ hasError: true, message: err.message });
//   }
// };
// export default deleteHoliday;

import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";

const deleteHoliday = async (req, res) => {
  try {
    const { parentId, holidayId } = req.params;

    if (!parentId || !holidayId) {
      return res.status(400).json({
        hasError: true,
        message: "parentId and holidayId are required",
      });
    }

    const record = await OperationalSchoolHoliday.findById(parentId);
    if (!record) {
      return res
        .status(404)
        .json({ hasError: true, message: "Record not found" });
    }

    record.holidayDetails = record.holidayDetails.filter(
      (h) => h._id.toString() !== holidayId
    );

    await record.save();

    return res.status(200).json({
      hasError: false,
      message: "Holiday deleted successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ hasError: true, message: "Internal Server Error" });
  }
};

export default deleteHoliday;
