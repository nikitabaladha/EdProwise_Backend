import GreetingsmsTemplate from "../../../models/OperationalModule/GreetingsmsTemplate.js";
import AbsentsmsTemplate from "../../../models/OperationalModule/AbsentsmsTemplate.js";
const deleteAbsentsmsTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AbsentsmsTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "Template not found",
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Template deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while deleting template",
    });
  }
};
export default deleteAbsentsmsTemplate;