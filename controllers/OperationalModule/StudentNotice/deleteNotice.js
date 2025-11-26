import StudentNotice from "../../../models/OperationalModule/StudentNotice.js";
import fs from "fs";

 const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await StudentNotice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Delete file from storage if exists
    if (notice.fileUrl && fs.existsSync(notice.fileUrl)) {
      fs.unlinkSync(notice.fileUrl);
    }

    await notice.deleteOne();

    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default deleteNotice;