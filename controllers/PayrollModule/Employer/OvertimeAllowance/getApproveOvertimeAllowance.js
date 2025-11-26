import OvertimeApplication from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";
import EmployeeRegistration from "../../../../models/PayrollModule/Employer/EmployeeRegistration.js";

const getApproveOvertimeAllowance = async (req, res) => {
  try {
    const { schoolId, academicYear, month, year, fromDate, toDate } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({ hasError: true, message: "Missing schoolId or academicYear" });
    }

    const matchQuery = {
      schoolId,
      academicYear,
      status: "approved"
    };

    if (month && year) {
      // filter by month
      const start = new Date(`${year}-${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      matchQuery.overtimeDate = { $gte: start.toISOString().split('T')[0], $lt: end.toISOString().split('T')[0] };
    } else if (fromDate && toDate) {
      matchQuery.overtimeDate = { $gte: fromDate, $lte: toDate };
    }

    const results = await OvertimeApplication.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "employeeregistrations",
          localField: "employeeId",
          foreignField: "employeeId",
          as: "employeeInfo"
        }
      },
      { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          employeeName: "$employeeInfo.employeeName"
        }
      },
      {
        $project: {
          employeeInfo: 0
        }
      },
      { $sort: { overtimeDate: 1 } }
    ]);

    res.status(200).json({ hasError: false, data: results });
  } catch (error) {
    console.error("Overtime report error:", error);
    res.status(500).json({ hasError: true, message: "Server error" });
  }
};

export default getApproveOvertimeAllowance;
