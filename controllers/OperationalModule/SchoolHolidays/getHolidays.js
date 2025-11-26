// import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";

// const getHolidays = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.params;
//      console.log("schoolId",schoolId);
//      console.log("academicYear", academicYear);
     
     
//     const holidays = await OperationalSchoolHoliday.findOne({
//       schoolId,
//       academicYear,
//     });
 
//     console.log("holidays",holidays);
    
//     return res.json({
//       hasError: false,
//       data: holidays || { holidayDetails: [] },
//     });
//   } catch (err) {
//     return res.status(500).json({ hasError: true, message: err.message });
//   }
// };

// export default getHolidays;

import OperationalSchoolHoliday from "../../../models/OperationalModule/OperationalSchoolHoliday.js";

const getHolidays = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and academicYear are required",
      });
    }

    const record = await OperationalSchoolHoliday.findOne({
      schoolId,
      academicYear,
    });

    return res.json({
      hasError: false,
      data: record || { holidayDetails: [] },
    });
  } catch (err) {
    console.error("Error fetching holidays:", err);
    return res.status(500).json({ hasError: true, message: err.message });
  }
};

export default getHolidays;


