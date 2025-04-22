import Fine from '../../../../models/FeesModule/Fine.js';


export const deleteFineById = async (req, res) => {
  const { id } = req.params; 

  if (!id) {
    return res.status(400).json({
      hasError: true,
      message: "Fine ID is required.",
    });
  }

  try {

    const deletedFine = await Fine.findByIdAndDelete(id);

    if (!deletedFine) {
      return res.status(404).json({
        hasError: true,
        message: `Fine with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      hasError: false,
      message: "Fine deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while deleting fine.",
    });
  }
};

export default deleteFineById;
