import EmployeeDesignation from "../../../../models/PayrollModule/AdminSettings/EmployeeDesignation.js";

const updateJobDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designationName, academicYear, schoolId } = req.body;

    if (!designationName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "designationName, academicYear, and schoolId are required.",
      });
    }

    // Ensure uniqueness on update
    const duplicate = await EmployeeDesignation.findOne({
      _id: { $ne: id },
      designationName,
      academicYear,
      schoolId,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "Another designation with the same name already exists for the selected year and school.",
      });
    }

    const updated = await EmployeeDesignation.findByIdAndUpdate(
      id,
      { designationName, academicYear, schoolId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "Designation not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Employee designation updated successfully.",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error updating employee designation.",
      error: error.message,
    });
  }
};

export default updateJobDesignation;
