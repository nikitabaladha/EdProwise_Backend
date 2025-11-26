// import LessonPlan from "../../../models/OperationalModule/LessonPlan.js";

// const updateLessonPlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { chapters, subjectProgress, subjectStatus, completePercentage } =
//       req.body;

//     if (!id) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Lesson Plan ID is required",
//       });
//     }

//     if (!Array.isArray(chapters)) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Chapters must be an array",
//       });
//     }

//     const updatedPlan = await LessonPlan.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           chapters,
//           subjectProgress,
//           subjectStatus,
//           completePercentage,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedPlan) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Lesson Plan not found",
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "Lesson Plan updated successfully",
//       data: updatedPlan,
//     });
//   } catch (err) {
//     console.error("Error updating lesson plan:", err);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while updating lesson plan",
//     });
//   }
// };

// export default updateLessonPlan;

import LessonPlan from "../../../models/OperationalModule/LessonPlan.js";

const updateLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapters, subjectProgress, subjectStatus, completePercentage } =
      req.body;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Lesson Plan ID is required",
      });
    }

    if (!Array.isArray(chapters)) {
      return res.status(400).json({
        hasError: true,
        message: "Chapters must be an array",
      });
    }

    let finalSubjectStatus = subjectStatus;
    let finalCompletePercentage = completePercentage;

    if (chapters.length > 0) {
      const allCompleted = chapters.every(
        (ch) => ch.status && ch.status === "Completed"
      );

      if (allCompleted) {
        finalSubjectStatus = "Completed";
        finalCompletePercentage = "100";
      } else{
        finalSubjectStatus = "Pending";
      }
    }

    const updatedPlan = await LessonPlan.findByIdAndUpdate(
      id,
      {
        $set: {
          chapters,
          subjectProgress,
          subjectStatus: finalSubjectStatus,
          completePercentage: finalCompletePercentage,
        },
      },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        hasError: true,
        message: "Lesson Plan not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Lesson Plan updated successfully",
      data: updatedPlan,
    });
  } catch (err) {
    console.error("Error updating lesson plan:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating lesson plan",
    });
  }
};

export default updateLessonPlan;

