import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardRegistrationFees from "../../../../models/FeesModule/BoardRegistrationFees.js";

const getClassAndSectionsbyyear = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: 'School ID and academic year are required in params.',
      });
    }


    const classes = await ClassAndSection.aggregate([
      {
        $match: {
          schoolId: schoolId,
          academicYear: academicYear,
        },
      },
      {
        $lookup: {
          from: "boardregistrationfees",
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$schoolId", schoolId] },
                    { $eq: ["$academicYear", academicYear] },
                    {
                      $or: [
                        { $eq: ["$classId", "$$classId"] },
                        { $in: ["$$classId", "$sectionIds"] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "boardFees",
        },
      },
      {
        $match: {
          boardFees: { $ne: [] }, 
        },
      },
      {
        $project: {
          boardFees: 0, 
        },
      },
    ]);

    if (!classes || classes.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No classes found with board registration fees for school ID ${schoolId} and academic year ${academicYear}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Classes and sections with board registration fees fetched successfully.",
      data: classes,
    });
  } catch (err) {
    console.error("Fetch Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch class and section data.",
      error: err.message,
    });
  }
};

export default getClassAndSectionsbyyear;