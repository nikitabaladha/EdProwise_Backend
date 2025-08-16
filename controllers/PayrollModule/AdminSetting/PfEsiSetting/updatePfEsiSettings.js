import PfEsiSetting from "../../../../models/PayrollModule/AdminSettings/PfEsiSetting.js";

const updatePfEsiSettings = async (req, res) => {
  const { schoolId, academicYear, pfEnabled, esiEnabled } = req.body;

  if (!schoolId || !academicYear) {
    return res.status(400).json({ hasError: true, message: "Missing required fields" });
  }

  try {
    const updated = await PfEsiSetting.findOneAndUpdate(
      { schoolId, academicYear },
      { pfEnabled, esiEnabled },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      hasError: false,
      message: "Settings updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating PF/ESI settings:", err);
    return res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default updatePfEsiSettings;