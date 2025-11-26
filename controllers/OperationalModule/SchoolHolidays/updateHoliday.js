// import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";
// const updateHoliday = async (req, res) => {
//   try {
//     const { schoolId, academicYear, holidayDate, oldName, newName } = req.body;

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

//     const idx = holiday.holidayNames.indexOf(oldName);
//     if (idx === -1)
//       return res.json({ hasError: true, message: "Holiday name not found" });

//     holiday.holidayNames[idx] = newName;

//     await record.save();
//     return res.json({
//       hasError: false,
//       message: "Holiday updated",
//       data: record,
//     });
//   } catch (err) {
//     return res.status(500).json({ hasError: true, message: err.message });
//   }
// };
// export default updateHoliday;

import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";

const updateHoliday = async (req, res) => {
  try {
    const { parentId, holidayId, holidayDate, holidayName } = req.body;

    if (!parentId || !holidayId || !holidayDate || !holidayName) {
      return res.status(400).json({
        hasError: true,
        message:
          "parentId, holidayId, holidayDate, and holidayName are required",
      });
    }

    const record = await OperationalSchoolHoliday.findOneAndUpdate(
      { _id: parentId, "holidayDetails._id": holidayId },
      {
        $set: {
          "holidayDetails.$.holidayDate": new Date(holidayDate),
          "holidayDetails.$.holidayNames": holidayName,
        },
      },
      { new: true }
    );

    if (!record) {
      return res
        .status(404)
        .json({ hasError: true, message: "Holiday not found" });
    }

    return res.json({
      hasError: false,
      message: "Holiday updated successfully",
      data: record,
    });
  } catch (err) {
    console.error("Error updating holiday:", err);
    return res.status(500).json({ hasError: true, message: err.message });
  }
};

export default updateHoliday;
