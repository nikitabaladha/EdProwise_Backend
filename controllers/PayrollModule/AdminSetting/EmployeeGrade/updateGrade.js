import EmployeeGrade from "../../../../models/PayrollModule/AdminSetting/EmployeeGrade.js";

const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeName, academicYear, schoolId } = req.body;

    if (!gradeName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "gradeName, academicYear, and schoolId are required.",
      });
    }

    // Ensure uniqueness on update
    const duplicate = await EmployeeGrade.findOne({
      _id: { $ne: id },
      gradeName,
      academicYear,
      schoolId,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "Another Grade with the same name already exists for the selected year and school.",
      });
    }

    const updated = await EmployeeGrade.findByIdAndUpdate(
      id,
      { gradeName, academicYear, schoolId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "Grade not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Grade updated successfully.",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error updating Grade.",
      error: error.message,
    });
  }
};

export default updateGrade;
