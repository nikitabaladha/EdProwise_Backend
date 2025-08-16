// import ProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";

// const createOrUpdateEmployeePFDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId, monthKey, pfDetail } = req.body;

//     if (!schoolId || !employeeId || !monthKey || !pfDetail) {
//       return res.status(400).json({ hasError: true, message: "Missing required fields" });
//     }

//     let pfRecord = await ProvidentFund.findOne({ schoolId, employeeId });

//     if (pfRecord) {
//       // Update the existing month's entry
//       pfRecord.pfDetails.set(monthKey, pfDetail);
//       await pfRecord.save();
//     } else {
//       // Create new document
//       pfRecord = new ProvidentFund({
//         schoolId,
//         employeeId,
//         pfDetails: {
//           [monthKey]: pfDetail
//         }
//       });
//       await pfRecord.save();
//     }

//     return res.status(200).json({ hasError: false, message: "PF details saved successfully", data: pfRecord });
//   } catch (error) {
//     console.error("PF Save Error:", error);
//     return res.status(500).json({ hasError: true, message: "Server error while saving PF details" });
//   }
// };

// export default createOrUpdateEmployeePFDetails;

// import EmployeeProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";

// const createOrUpdateEmployeePFDetails = async (req, res) => {
//   const { schoolId, employeeId, academicYear, pfData } = req.body;

//   if (!schoolId || !employeeId || !academicYear || !pfData) {
//     return res.status(400).json({ hasError: true, message: "Missing required fields" });
//   }

//   const pfRecords = Object.keys(pfData).map(month => ({
//     monthLabel: month,
//     mandatoryPFContribution: pfData[month].mandatoryPFContribution || "",
//     voluntaryPFContribution: parseFloat(pfData[month].voluntaryPFContribution || 0),
//   }));

//   try {
//     const record = await EmployeeProvidentFund.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { pfRecords },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({ hasError: false, message: "PF data saved", data: record });
//   } catch (error) {
//     return res.status(500).json({ hasError: true, message: error.message });
//   }
// };

// export default createOrUpdateEmployeePFDetails

import EmployeeProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";

const createOrUpdateEmployeePFDetails = async (req, res) => {
  const { schoolId, employeeId, academicYear, pfData } = req.body;

  if (!schoolId || !employeeId || !academicYear || !pfData) {
    return res.status(400).json({ hasError: true, message: "Missing required fields" });
  }

  const month = Object.keys(pfData)[0];
  const record = {
    monthLabel: month,
    mandatoryPFContribution: pfData[month].mandatoryPFContribution,
    voluntaryPFContribution: parseFloat(pfData[month].voluntaryPFContribution),
  };

  try {
    let existing = await EmployeeProvidentFund.findOne({
      schoolId,
      employeeId,
      academicYear
    });

    if (existing) {
      // Update existing month or push new
      const index = existing.pfRecords.findIndex(r => r.monthLabel === month);
      if (index > -1) {
        existing.pfRecords[index] = record; // update
      } else {
        existing.pfRecords.push(record); // add
      }

      await existing.save();
      return res.status(200).json({ hasError: false, message: "PF month updated", data: existing });
    } else {
      // New doc
      const newDoc = await EmployeeProvidentFund.create({
        schoolId,
        employeeId,
        academicYear,
        pfRecords: [record],
      });

      return res.status(200).json({ hasError: false, message: "PF record created", data: newDoc });
    }

  } catch (error) {
    return res.status(500).json({ hasError: true, message: error.message });
  }
};


export default createOrUpdateEmployeePFDetails;
