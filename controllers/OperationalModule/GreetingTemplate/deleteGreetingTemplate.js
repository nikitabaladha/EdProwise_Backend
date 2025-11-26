import GreetingsmsTemplate from "../../../models/OperationalModule/GreetingsmsTemplate.js";
const deleteGreetingTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await GreetingsmsTemplate.findByIdAndDelete(id);

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
export default deleteGreetingTemplate;