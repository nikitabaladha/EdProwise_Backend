import StudentNotice from "../../../models/OperationalModule/StudentNotice.js";
 const addNotice = async (req, res) => {
  try {
    const { schoolId, academicYear, noticeDate, subject, shortDescription } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Notice file is required" });
    }

    const fileUrl = req.file.path; 

    const notice = new StudentNotice({
      schoolId,
      academicYear,
      noticeDate,
      subject,
      shortDescription,
      fileUrl,
    });

    await notice.save();

    res.status(201).json({ message: "Notice added successfully", notice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default addNotice;
