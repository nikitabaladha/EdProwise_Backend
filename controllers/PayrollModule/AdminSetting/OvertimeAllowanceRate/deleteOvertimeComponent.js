import OvertimeAllowanceRate from "../../../../models/PayrollModule/AdminSettings/OvertimeAllowanceRate.js";

const deleteOvertimeComponent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await OvertimeAllowanceRate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Component not found or already deleted",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Component deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      hasError: true,
      message: "Server Error while deleting component",
    });
  }
};

export default deleteOvertimeComponent;