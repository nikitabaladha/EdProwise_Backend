import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import SellerProfile from "../../../models/SellerProfile.js";
import EdprowiseProfile from "../../../models/EdprowiseProfile.js";

async function getLocation(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required as a query parameter.",
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "SellerId is required as a query parameter.",
      });
    }

    // Fetch location data for all parties with only necessary fields
    const [quoteRequest, sellerProfile, edprowiseProfile] = await Promise.all([
      QuoteRequest.findOne({ enquiryNumber }).select("deliveryState"),
      SellerProfile.findOne({ sellerId }).select("state"),
      EdprowiseProfile.findOne().select("state"),
    ]);

    // Check if all required data exists
    const missingData = [];
    if (!quoteRequest) missingData.push("quote request");
    if (!sellerProfile) missingData.push("seller profile");
    if (!edprowiseProfile) missingData.push("edprowise profile");

    if (missingData.length > 0) {
      return res.status(404).json({
        hasError: true,
        message: `Required data not found: ${missingData.join(", ")}.`,
      });
    }

    const schoolState = quoteRequest.deliveryState;
    const sellerState = sellerProfile.state;
    const edprowiseState = edprowiseProfile.state;

    // Check if state extraction was successful
    const missingStates = [];
    if (!schoolState) missingStates.push("school delivery location");
    if (!sellerState) missingStates.push("seller location");
    if (!edprowiseState) missingStates.push("edprowise location");

    if (missingStates.length > 0) {
      return res.status(400).json({
        hasError: true,
        message: `Could not extract state from: ${missingStates.join(", ")}.`,
        details: {
          schoolLocation: quoteRequest.deliveryLocation,
          sellerLocation: sellerProfile.cityStateCountry,
          edprowiseLocation: edprowiseProfile.cityStateCountry,
        },
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Location data retrieved successfully.",
      data: {
        schoolState,
        sellerState,
        edprowiseState,
      },
    });
  } catch (error) {
    console.error("Error retrieving location data:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error while processing location data.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export default getLocation;
