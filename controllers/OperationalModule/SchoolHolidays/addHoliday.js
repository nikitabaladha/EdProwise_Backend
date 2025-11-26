// import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";
// const addHoliday = async (req, res) => {
//   try {
//     const { schoolId, academicYear, holidayDate, holidayName } = req.body;

//     const date = new Date(holidayDate);
//     let record = await OperationalSchoolHoliday.findOne({
//       schoolId,
//       academicYear,
//     });

//     if (!record) {
//       record = new OperationalSchoolHoliday({
//         schoolId,
//         academicYear,
//         holidayDetails: [{ holidayDate: date, holidayNames: [holidayName] }],
//       });
//     } else {
//       const existing = record.holidayDetails.find(
//         (h) => h.holidayDate.toDateString() === date.toDateString()
//       );

//       if (existing) {
//         if (!existing.holidayNames.includes(holidayName)) {
//           existing.holidayNames.push(holidayName);
//         }
//       } else {
//         record.holidayDetails.push({
//           holidayDate: date,
//           holidayNames: [holidayName],
//         });
//       }
//     }

//     await record.save();
//     return res.json({
//       hasError: false,
//       message: "Holiday added",
//       data: record,
//     });
//   } catch (err) {
//     return res.status(500).json({ hasError: true, message: err.message });
//   }
// };
// export default addHoliday;

import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";

const addHoliday = async (req, res) => {
  try {
    const { schoolId, academicYear, holidayDate, holidayName } = req.body;

    if (!schoolId || !academicYear || !holidayDate || !holidayName) {
      return res.status(400).json({
        hasError: true,
        message:
          "schoolId, academicYear, holidayDate, and holidayName are required",
      });
    }

    const date = new Date(holidayDate);

    let record = await OperationalSchoolHoliday.findOne({
      schoolId,
      academicYear,
    });

    if (!record) {
      // Create new parent document
      record = new OperationalSchoolHoliday({
        schoolId,
        academicYear,
        holidayDetails: [{ holidayDate: date, holidayNames: holidayName }],
      });
    } else {
      // Just push new holiday entry
      record.holidayDetails.push({
        holidayDate: date,
        holidayNames: holidayName,
      });
    }

    await record.save();

    return res.json({
      hasError: false,
      message: "Holiday added successfully",
      data: record,
    });
  } catch (err) {
    console.error("Error adding holiday:", err);
    return res.status(500).json({ hasError: true, message: err.message });
  }
};

export default addHoliday;
