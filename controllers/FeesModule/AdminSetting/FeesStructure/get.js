import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";

export const getFeesStructuresBySchoolId = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "Both School ID and Academic Year are required.",
      });
    }
    const structures = await FeesStructure.find({ schoolId,academicYear });

    return res.status(200).json({
      hasError: false,
      message: "Fees structures fetched successfully.",
      data: structures,
    });
  } catch (err) {
    console.error("Error fetching fees structures:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching fees structures.",
    });
  }
};

export default getFeesStructuresBySchoolId;


// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";


// export const getFeesStructuresBySchoolId = async (req, res) => {
//   try {
//     const { schoolId } = req.params;

//     if (!schoolId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "School ID is required.",
//       });
//     }

//     const structures = await FeesStructure.find({ schoolId })
//       .populate({
//         path: "classId",
//         select: "className sections", 
//       })
//       .populate({
//         path: "feesTypeId",
//         select: "feesTypeName",
//       });


//     const result = structures.map((structure) => {
//       const sectionNames = structure.sectionIds.map((sectionId) => {
//         const sectionObj = structure.classId.sections.find(
//           (sec) => sec._id.toString() === sectionId.toString()
//         );
//         return sectionObj ? sectionObj.name : null;
//       });

//       return {
//         _id: structure._id,
//         schoolId: structure.schoolId,
//         className: structure.classId?.className,
//         sectionNames: sectionNames.filter(Boolean),
//         feesTypeName: structure.feesTypeId?.feesTypeName,
//         installments: structure.installments,
//         createdAt: structure.createdAt,
//         updatedAt: structure.updatedAt,
//       };
//     });

//     return res.status(200).json({
//       hasError: false,
//       message: "Fees structures fetched successfully.",
//       data: result,
//     });
//   } catch (err) {
//     console.error("Error fetching fees structures:", err);
//     return res.status(500).json({
//       hasError: true,
//       message: "Server error while fetching fees structures.",
//     });
//   }
// };


// export default getFeesStructuresBySchoolId;

