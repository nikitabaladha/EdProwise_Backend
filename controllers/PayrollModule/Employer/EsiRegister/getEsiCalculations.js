import EsiRegister from "../../../../models/PayrollModule/Employer/EsiRegister.js";

const getEsiCalculations = async (req, res) => {
  try {
    const { schoolId, academicYear, year, month } = req.query;

    if (!schoolId || !academicYear || !year || !month) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const record = await EsiRegister.findOne({ schoolId, academicYear, year, month });

    if (!record) {
      return res.status(200).json({ message: "No data found", data: [] });
    }

    return res.status(200).json({ message: "ESI data fetched", data: record.data });
  } catch (err) {
    console.error("Error fetching ESI data:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default getEsiCalculations;