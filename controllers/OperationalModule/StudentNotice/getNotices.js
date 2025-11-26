import StudentNotice from "../../../models/OperationalModule/StudentNotice.js";

const getNotices = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res
        .status(400)
        .json({ message: "schoolId and academicYear are required" });
    }

    const notices = await StudentNotice.find({ schoolId, academicYear }).sort({
      noticeDate: -1, // latest first
    });

    res.status(200).json({ notices });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default getNotices;