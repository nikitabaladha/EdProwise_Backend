import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

const addSubjects = async (req, res) => {
  try {
    const { schoolId, academicYear, className,  subjects } =
      req.body;

    if (!schoolId || !academicYear || !className || !subjects) {
      return res
        .status(400)
        .json({ hasError: true, message: "Missing required fields" });
    }
const classValue = className;
// const sectionValue = sectionName;
    
let record = await ClassSubject.findOne({
      schoolId,
      academicYear,
      class: classValue,
      // section: sectionValue,
    });

    if (record) {
      record.subjects.push(...subjects.map((s) => ({ subjectName: s })));
      await record.save();
      return res.json({
        hasError: false,
        message: "Subjects added successfully",
        data: record,
      });
    } else {
      const newRecord = new ClassSubject({
        schoolId,
        academicYear,
        class: classValue,
        // section: sectionValue,
        subjects: subjects.map((s) => ({ subjectName: s })),
      });

      await newRecord.save();
      return res.json({
        hasError: false,
        message: "Subjects created successfully",
        data: newRecord,
      });
    }
  } catch (error) {
    console.error("Error adding subjects:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

export default addSubjects;



// ✅ Delete Entire Class + Section Record
