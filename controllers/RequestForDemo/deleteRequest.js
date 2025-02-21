import RequestForDemo from "../../models/RequestForDemo.js";

async function deleteRequest(req, res) {
  try {
    const { id } = req.params;
   console.log(id);
   
    // Check if the request exists
    const existingRequest = await RequestForDemo.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Demo request not found."
      });
    }

    // Delete the request
    await RequestForDemo.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Demo request deleted successfully!"
    });

  } catch (error) {
    console.error("Error deleting demo request:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later."
    });
  }
}

export default deleteRequest;
