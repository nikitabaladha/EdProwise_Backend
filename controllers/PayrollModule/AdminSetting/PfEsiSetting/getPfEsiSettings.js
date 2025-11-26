import PfEsiSetting from "../../../../models/PayrollModule/AdminSettings/PfEsiSetting.js";

const getPfEsiSettings = async (req, res) => {
  const { schoolId } = req.params;
  const { academicYear } = req.query;

  if (!schoolId || !academicYear) {
    return res.status(400).json({ hasError: true, message: "Missing schoolId or academicYear" });
  }

  try {
    const setting = await PfEsiSetting.findOne({ schoolId, academicYear });

    if (setting) {
      return res.status(200).json({ hasError: false, data: setting });
    } else {
      return res.status(200).json({ hasError: false, data: { pfEnabled: false, esiEnabled: false } });
    }
  } catch (err) {
    console.error("Error fetching PF/ESI settings:", err);
    return res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};
export default getPfEsiSettings;