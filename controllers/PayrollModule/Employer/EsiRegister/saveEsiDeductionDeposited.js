import EsiRegister from "../../../../models/PayrollModule/Employer/EsiRegister.js";

const saveEsiDeductionDeposited = async (req, res) => {
  try {
    const { schoolId, academicYear, year, month, data } = req.body;

    if (!schoolId || !academicYear || !year || !month || !data) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const existingRecord = await EsiRegister.findOne({ schoolId, academicYear, year, month });

    if (existingRecord) {
      existingRecord.data = data;
      await existingRecord.save();
      return res.status(200).json({ message: "ESI data updated successfully" });
    }

    const newEntry = new EsiRegister({ schoolId, academicYear, year, month, data });
    await newEntry.save();
    return res.status(201).json({ message: "ESI data saved successfully" });
  } catch (err) {
    console.error("Error saving ESI data:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
export default saveEsiDeductionDeposited;