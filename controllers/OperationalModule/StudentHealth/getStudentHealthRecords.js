import StudentHealthDetail from "../../../models/OperationalModule/StudentHealthDetail.js";

const getStudentHealthRecords = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;
    const { class: className, section: sectionName } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "School ID and academic year are required.",
      });
    }

    let query = { schoolId, "healthDetails.academicYear": academicYear };
    if (className) query["healthDetails.class"] = className;
    if (sectionName) query["healthDetails.section"] = sectionName;

    const healthRecords = await StudentHealthDetail.find(query);
        console.log("healthRecords",healthRecords);
        
    const formatted = healthRecords.flatMap((r) =>
      r.healthDetails.map((hd) => ({
        mainId: r._id,
        _id: r._id,
        schoolId: r.schoolId,
        admissionNumber: r.admissionNumber,
        studentName: r.studentName,
        dateOfBirth: r.dateOfBirth,
        ...hd.toObject(), 
      }))
    );

    console.log("formatted", formatted);
    

    return res.status(200).json({
      hasError: false,
      message: "Health records fetched successfully.",
      data: formatted,
    });
  } catch (err) {
    console.error("Fetch Health Records Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch health records.",
      error: err.message,
    });
  }
};

export default getStudentHealthRecords;
