import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";

export const getAllFeesInstallments = async (req, res) => {
  try {
    const { classId, sectionIds, schoolId, academicYear } = req.query;

    if (!classId || !sectionIds || !schoolId || !academicYear) {
      return res.status(400).json({
        message:
          "classId, sectionIds, schoolId, and academicYear are required",
      });
    }

  
    const sectionIdArray = Array.isArray(sectionIds)
      ? sectionIds
      : [sectionIds];


    const feesStructures = await FeesStructure.find({
      schoolId,
      classId,
      sectionIds: { $in: sectionIdArray },
      academicYear,
    }).lean();

    if (!feesStructures || feesStructures.length === 0) {
      return res.status(404).json({
        message:
          "No fee structure found for the given school, class, section, and academic year.",
      });
    }


    const maxInstallments = Math.max(
      ...feesStructures.map((structure) => structure.installments?.length || 0)
    );

    const response = [];


    for (let i = 0; i < maxInstallments; i++) {
      for (const structure of feesStructures) {
        const inst = structure.installments?.[i];

        if (inst) {
          response.push({
            academicYear: structure.academicYear,
            installmentId: inst._id,
            name: inst.name,
            dueDate: inst.dueDate,
            fees: inst.fees?.map((fee) => ({
              feesTypeId: fee.feesTypeId,
              amount: fee.amount,
            })) || [],
          });
        }
      }
    }

    res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching fee installments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllFeesInstallments;
