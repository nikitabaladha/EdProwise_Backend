import LessonPlan from "../../../models/OperationalModule/LessonPlan.js";

const addLessonPlan = async (req, res) => {
  try {
    const {
      schoolId,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
      chapters, 
    } = req.body;

    // 1. Basic validation
    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required",
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "academicYear is required",
      });
    }

    if (!className) {
      return res.status(400).json({
        hasError: true,
        message: "className is required",
      });
    }

    if (!sectionName) {
      return res.status(400).json({
        hasError: true,
        message: "sectionName is required",
      });
    }

    if (!staffId) {
      return res.status(400).json({
        hasError: true,
        message: "staffId is required",
      });
    }

    if (!subjectId) {
      return res.status(400).json({
        hasError: true,
        message: "subjectId is required",
      });
    }

    if (!chapters) {
      return res.status(400).json({
        hasError: true,
        message: "chapters is required",
      });
    }

    if (!Array.isArray(chapters)) {
      return res.status(400).json({
        hasError: true,
        message: "chapters must be an array",
      });
    }


    // 2. Check if a LessonPlan already exists
    let lessonPlan = await LessonPlan.findOne({
      schoolId,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
    });

    if (lessonPlan) {
      // 3. If exists → push new chapters into existing plan
      lessonPlan.chapters.push(...chapters);

      // Optionally, you can update `completePercentage` or `subjectProgress` here if needed

      await lessonPlan.save();

      return res.status(200).json({
        hasError: false,
        message: "Lesson Plan updated with new chapters successfully",
        data: lessonPlan,
      });
    }

    // 4. If not exists → create a new plan
    lessonPlan = new LessonPlan({
      schoolId,
      academicYear,
      className,
      sectionName,
      staffId,
      subjectId,
      chapters,
    });

    await lessonPlan.save();

    return res.status(201).json({
      hasError: false,
      message: "Lesson Plan created successfully",
      data: lessonPlan,
    });
  } catch (error) {
    console.error("Error creating lesson plan:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while creating lesson plan",
      error: error.message,
    });
  }
};

export default addLessonPlan;
