
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';



export const getFeesStructuresBySchoolId = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: 'Both School ID and Academic Year are required.',
      });
    }

    const structures = await FeesStructure.find({ schoolId, academicYear })
      .populate({
        path: 'installments.fees.feesTypeId',
        select: 'feesTypeName',
      })
      .lean();

    if (!structures || structures.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: 'No fees structures found for the given school and academic year.',
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Fees structures fetched successfully.',
      data: structures,
    });
  } catch (err) {
    console.error('Error fetching fees structures:', err);
    return res.status(500).json({
      hasError: true,
      message: 'Server error while fetching fees structures.',
    });
  }
};


export default getFeesStructuresBySchoolId;