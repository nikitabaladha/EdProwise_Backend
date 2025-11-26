// import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

// const addSubjects = async (req, res) => {
//   try {
//     const { schoolId, academicYear, className, sectionName, subjects } =
//       req.body;

//     if (!schoolId || !academicYear || !className || !sectionName || !subjects) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "Missing required fields" });
//     }
// const classValue = className;
// const sectionValue = sectionName;
//     let record = await ClassSubject.findOne({
//       schoolId,
//       academicYear,
//       class: classValue,
//       section: sectionValue,
//     });

//     if (record) {
//       record.subjects.push(...subjects.map((s) => ({ subjectName: s })));
//       await record.save();
//       return res.json({
//         hasError: false,
//         message: "Subjects added successfully",
//         data: record,
//       });
//     } else {
//       const newRecord = new ClassSubject({
//         schoolId,
//         academicYear,
//         class: classValue,
//         section: sectionValue,
//         subjects: subjects.map((s) => ({ subjectName: s })),
//       });

//       await newRecord.save();
//       return res.json({
//         hasError: false,
//         message: "Subjects created successfully",
//         data: newRecord,
//       });
//     }
//   } catch (error) {
//     console.error("Error adding subjects:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default addSubjects;

// controllers/classSubjectController.js
import ClassSubject from "../../../models/OperationalModule/ClassSubject.js";

 const addSubjects = async (req, res) => {
   try {
     const { schoolId, academicYear, classId, sectionId, subjects } = req.body;

     if (
       !schoolId ||
       !academicYear ||
       !classId ||
       !sectionId ||
       !subjects?.length
     ) {
       return res.status(400).json({
         hasError: true,
         message:
           "Missing required fields (schoolId, academicYear, classId, sectionId, subjects).",
       });
     }

     // Convert subjects array to objects with subjectName
     const formattedSubjects = subjects.map((name) => ({ subjectName: name }));

     const newClassSubjects = new ClassSubject({
       schoolId,
       academicYear,
       classId,
       sectionId,
       subjects: formattedSubjects,
     });

     await newClassSubjects.save();

     return res.status(201).json({
       hasError: false,
       message: "Subjects added successfully",
       data: newClassSubjects,
     });
   } catch (error) {
     console.error("Error adding class subjects:", error);
     return res.status(500).json({
       hasError: true,
       message: "Server error while adding subjects",
       error: error.message,
     });
   }
 };

 export default addSubjects;