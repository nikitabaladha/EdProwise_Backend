import EaseBuzzData from "../../../models/EasebuzzData.js";

export const createOrUpdateEaseBuzz = async (req, res) => {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
        return res.status(401).json({
            hasError: true,
            message: "Access denied: You do not have permission to modify EaseBuzz data.",
        });
    }

    const { EASEBUZZ_KEY, EASEBUZZ_SALT } = req.body;

    if (!EASEBUZZ_KEY || !EASEBUZZ_SALT) {
        return res.status(400).json({
            hasError: true,
            message: "Missing required fields: EASEBUZZ_KEY and EASEBUZZ_SALT.",
        });
    }

    try {

        const updatedData = await EaseBuzzData.findOneAndUpdate(
            { schoolId },
            { schoolId, EASEBUZZ_KEY, EASEBUZZ_SALT },
            { new: true, upsert: true, runValidators: true }
        );

        const message = updatedData.createdAt
            ? "EaseBuzz data saved successfully."
            : "EaseBuzz data updated successfully.";

        res.status(200).json({
            hasError: false,
            message,
            data: updatedData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            hasError: true,
            message: "Server error while saving EaseBuzz data.",
        });
    }
};

export default createOrUpdateEaseBuzz;
