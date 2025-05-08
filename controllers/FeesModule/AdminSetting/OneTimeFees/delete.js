import OneTimeFees from "../../../../models/FeesModule/OneTimeFees.js";


export const deleteOneTimeFees = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedOneTimeFees = await OneTimeFees.findByIdAndDelete(id);
  
      if (!deletedOneTimeFees) {
        return res.status(404).json({
          hasError: true,
          message: "One-time fees structure not found.",
        });
      }
  
      return res.status(200).json({
        hasError: false,
        message: "One-time fees structure deleted successfully.",
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({
        hasError: true,
        message: "Server error while deleting One-Time Fees Structure.",
      });
    }
  };

export default  deleteOneTimeFees;
