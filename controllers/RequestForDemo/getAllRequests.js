import RequestForDemo from "../../models/RequestForDemo.js";

// Get all demo requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await RequestForDemo.find().sort({ createdAt: 1 });

    if (!requests.length) {
      return res.status(404).json({
        hasError: true,
        message: "No demo requests found."
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Demo requests retrieved successfully.",
      data: requests
    });

  } catch (error) {
    console.error("Error fetching demo requests:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later."
    });
  }
};
export default getAllRequests;
// Get a single demo request by ID

