import EntranceExamSubject from "../../../models/OperationalModule/EntranceExamSubject.js";

const createEntranceExamSubject = async (req, res) => {
    try {
       const { schoolId, academicYear, classId,  subjects } = req.body;
  
       if (
         !schoolId ||
         !academicYear ||
         !classId ||
         !subjects?.length
       ) {
         return res.status(400).json({
           hasError: true,
           message:
             "Missing required fields (schoolId, academicYear, classId, subjects).",
         });
       }
  
       // Convert subjects array to objects with subjectName
       const formattedSubjects = subjects.map((name) => ({ subjectName: name }));
  
       const newClassSubjects = new EntranceExamSubject({
         schoolId,
         academicYear,
         classId,
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

export default createEntranceExamSubject;

