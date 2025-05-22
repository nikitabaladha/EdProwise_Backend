import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import createFeesStructureValidator from "../../../../validators/FeesModule/FeesStructure.js";

export const updateFeesStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update Fees Structure.",
      });
    }


    const { error, value } = createFeesStructureValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ hasError: true, message: error.message });
    }

    const { classId,sectionIds, feesTypeId, academicYear,installments } = value;


    const duplicate = await FeesStructure.findOne({
      _id: { $ne: id },
      schoolId,
      classId,
      sectionIds,
      feesTypeId,
      academicYear
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "A fees structure already exists for this class section and and fee type.",
      });
    }

    
    const updatedStructure = await FeesStructure.findOneAndUpdate(
      { _id: id, schoolId },
      { 
        classId,
        sectionIds,
        feesTypeId,
        sectionIds: value.sectionIds,
        installments: installments.map((installment) => ({
          ...installment,
          fees: installment.fees.map((fee) => ({
            feesTypeId: fee.feesTypeId,
            amount: fee.amount,
          })),
        })),
      },
      { new: true }
    );

    if (!updatedStructure) {
      return res.status(404).json({
        hasError: true,
        message: "Fee structure not found or access denied.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Fee structure updated successfully.",
      data: updatedStructure,
    });
  } catch (err) {
    console.error("Error updating fee structure:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while updating Fees Structure.",
    });
  }
};

export default updateFeesStructure;

