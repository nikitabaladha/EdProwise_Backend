import OneTimeFees from "../../../../models/FeesModule/OneTimeFees.js";
import createOneTimeFeesValidator from "../../../../validators/FeesModule/OneTimeFees.js";

export const updateOneTimeFees = async (req, res) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({
                hasError: true,
                message: "Access denied: You do not have permission to update One Time Fees.",
            });
        }

        const { id } = req.params;
        const { error, value } = createOneTimeFeesValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ hasError: true, message: error.message });
        }

        const { classId, sectionIds, oneTimeFees,academicYear } = value;


        const existingOneTimeFees = await OneTimeFees.findById(id);
        if (!existingOneTimeFees) {
            return res.status(404).json({
                hasError: true,
                message: "One-time fees structure not found.",
            });
        }


        for (let fee of oneTimeFees) {
            const { feesTypeId } = fee;

            const conflict = await OneTimeFees.findOne({
                schoolId,
                academicYear,
                classId,
                sectionIds: { $in: sectionIds },
                'oneTimeFees.feesTypeId': feesTypeId,
                _id: { $ne: id },
            });

            if (conflict) {
                return res.status(409).json({
                    hasError: true,
                    message: `One-time fee with feesTypeId ${feesTypeId} already exists for this class and sections.`,
                });
            }
        }
        const updatedOneTimeFees = await OneTimeFees.findByIdAndUpdate(id, { ...value, schoolId }, { new: true });

        return res.status(200).json({
            hasError: false,
            message: "One-time fees structure updated successfully.",
            data: updatedOneTimeFees,
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            hasError: true,
            message: "Server error while updating One-Time Fees Structure.",
        });
    }
};

export default updateOneTimeFees;
