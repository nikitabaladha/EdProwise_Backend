import Onetimefees from "../../../../models/FeesModule/OneTimeFees.js";

async function getAllBySchoolClassAndSection(req, res) {
  try {
    const { schoolId, classId, sectionId,academicYear } = req.params;

    if (!schoolId || !classId || !sectionId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "School ID, Class ID, and Section ID  and Academic Year are required.",
      });
    }

    const oneTimeFees = await Onetimefees.find({
      schoolId,
      classId,
      sectionIds: sectionId,
      academicYear
    })
      .populate('classId', 'name')
      .populate('sectionIds', 'name')
      .populate('oneTimeFees.feesTypeId', 'feesTypeName');

    return res.status(200).json({
      hasError: false,
      message: "One-time fees retrieved successfully.",
      data: oneTimeFees,
    });
  } catch (error) {
    console.error("Error retrieving one-time fees:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to retrieve one-time fees.",
      error: error.message,
    });
  }
}

export default getAllBySchoolClassAndSection;
