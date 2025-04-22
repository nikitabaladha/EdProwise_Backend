import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";

export const deleteFeesStructureById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "ID is required to delete fee structure.",
      });
    }

    const deletedStructure = await FeesStructure.findByIdAndDelete(id);

    if (!deletedStructure) {
      return res.status(404).json({
        hasError: true,
        message: "Fee structure not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Fee structure deleted successfully.",
      data: deletedStructure,
    });
  } catch (err) {
    console.error("Error deleting fee structure:", err);
    return res.status(500).json({
      hasError: true,
      message: "Server error while deleting fee structure.",
    });
  }
};

export default deleteFeesStructureById;