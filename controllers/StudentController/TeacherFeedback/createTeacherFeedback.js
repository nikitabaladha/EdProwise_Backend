import TeacherFeedback from "../../../models/StudentModels/TeacherFeedback.js";

const createTeacherFeedback = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      staffId,
      subjectId,
      className,
      sectionName,
      admissionNumber,
      overallRating,
      teachingStyle,
      teachingExplanation,
      classActivity,
      engagementWithStudents,
      lessonPlanning,
      behaviourSkills,
      discipline,
      communicationSkills,
      goodListener,
      arrivalOnTime,
      guidanceAndMotivational,
      inspiration,
      remarks,
      status,
    } = req.body;

    // if (
    //   !schoolId ||
    //   !academicYear ||
    //   !staffId ||
    //   !subjectId ||
    //   !className ||
    //   !sectionName ||
    //   !admissionNumber 
    // ) {
    //   return res.status(400).json({ message: "Missing required fields" });
    // }

    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
    }

    if (!academicYear) {
      return res.status(400).json({ message: "academicYear is required" });
    }

    if (!staffId) {
      return res.status(400).json({ message: "staffId is required" });
    }

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    if (!className) {
      return res.status(400).json({ message: "className is required" });
    }

    if (!sectionName) {
      return res.status(400).json({ message: "sectionName is required" });
    }

    if (!admissionNumber) {
      return res.status(400).json({ message: "admissionNumber is required" });
    }


    const newFeedback = new TeacherFeedback({
      schoolId,
      academicYear,
      staffId,
      subjectId,
      className,
      sectionName,
      admissionNumber,
      overallRating,
      teachingStyle,
      teachingExplanation,
      classActivity,
      engagementWithStudents,
      lessonPlanning,
      behaviourSkills,
      discipline,
      communicationSkills,
      goodListener,
      arrivalOnTime,
      guidanceAndMotivational,
      inspiration,
      remarks,
      status: status || "Submit",
    });

    const savedFeedback = await newFeedback.save();

    return res.status(201).json({
      message: "Teacher feedback submitted successfully",
      data: savedFeedback,
    });
  } catch (error) {
    console.error("Error creating teacher feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default createTeacherFeedback;