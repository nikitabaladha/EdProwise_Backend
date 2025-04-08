import PrepareQuote from "../../models/PrepareQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SchoolRegistration from "../../models/School.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import SubmitQuote from "../../models/SubmitQuote.js";
import SellerProfile from "../../models/SellerProfile.js";
import EdprowiseProfile from "../../models/EdprowiseProfile.js";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";

async function getAllBySellerIdAndEnquiryNumber(req, res) {
  try {
    const { sellerId, enquiryNumber, schoolId } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID is required.",
      });
    }

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    // =====================Profile data=================================
    const school = await SchoolRegistration.findOne({
      schoolId: schoolId,
    }).select(
      "schoolName schoolEmail schoolMobileNo panNo schoolAddress schoolLocation landMark schoolPincode"
    );

    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    const quoteRequest = await QuoteRequest.findOne({
      schoolId: schoolId,
      enquiryNumber: enquiryNumber,
    }).select(
      "deliveryAddress deliveryLandMark deliveryLocation createdAt enquiryNumber"
    );

    if (!quoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Quote request not found for the provided school ID.",
      });
    }

    const quoteProposal = await QuoteProposal.findOne({
      enquiryNumber: enquiryNumber,
      sellerId: sellerId,
    }).select("quoteNumber createdAt sellerId");

    if (!quoteProposal) {
      return res.status(404).json({
        hasError: true,
        message: "Quote proposal not found for the provided enquiry number.",
      });
    }

    const submitQuote = await SubmitQuote.findOne({
      enquiryNumber: quoteRequest.enquiryNumber,
      sellerId: quoteProposal.sellerId,
    }).select(
      "paymentTerms advanceRequiredAmount expectedDeliveryDateBySeller"
    );

    const sellerProfile = await SellerProfile.findOne({
      sellerId: quoteProposal.sellerId,
    }).select(
      "companyName address landmark cityStateCountry gstin pan contactNo emailId"
    );

    if (!sellerProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Seller profile not found for the given seller ID.",
      });
    }

    const edprowiseProfile = await EdprowiseProfile.findOne().select(
      "companyName companyType gstin pan tan cin address cityStateCountry landmark pincode contactNo alternateContactNo emailId"
    );

    if (!edprowiseProfile) {
      return res.status(404).json({
        hasError: true,
        message: "Edprowise Profile not found.",
      });
    }

    const orderDetails = await OrderDetailsFromSeller.findOne({
      schoolId: schoolId,
      sellerId: quoteProposal.sellerId,
      quoteNumber: quoteProposal.quoteNumber,
    }).select("invoiceDate invoiceForSchool invoiceForEdprowise");

    //=============================== Prepare Quote data=============================
    const prepareQuotes = await PrepareQuote.find({ sellerId, enquiryNumber });

    if (!prepareQuotes.length) {
      return res.status(404).json({
        hasError: true,
        message: "No quotes found for the given seller and enquiry number.",
      });
    }

    const prepareQuotesWithStatus = prepareQuotes.map((quote) => ({
      ...quote.toObject(),
      supplierStatus: quoteProposal ? quoteProposal.supplierStatus : null,
    }));

    // how to retrive this data in frontend
    return res.status(200).json({
      hasError: false,
      message: "Data retrieved successfully.",
      data: {
        prepareQuotes: prepareQuotesWithStatus,
        quoteProposal: quoteProposal,
        profileData: {
          buyerName: school?.schoolName,
          schoolContactNumber: school?.schoolMobileNo,
          schoolPanNumber: school?.panNo,
          schoolAddress: school?.schoolAddress,
          schoolLocation: school?.schoolLocation,
          schoolLandmark: school?.landMark,
          schoolPincode: school?.schoolPincode,
          schoolEmailId: school?.schoolEmail,
          schoolDeliveryAddress: `${quoteRequest?.deliveryAddress || ""}${
            quoteRequest?.deliveryLandMark
              ? `, ${quoteRequest.deliveryLandMark}`
              : ""
          }`.trim(),
          schoolDeliveryLocation: quoteRequest?.deliveryLocation,
          quoteRequestedDate: quoteRequest?.createdAt,
          enquiryNumber: quoteRequest?.enquiryNumber,
          quoteNumber: quoteProposal?.quoteNumber,
          quoteProposalDate: quoteProposal?.createdAt,
          paymentTerms: submitQuote?.paymentTerms,
          advanceRequiredAmount: submitQuote?.advanceRequiredAmount,
          expectedDeliveryDate: submitQuote?.expectedDeliveryDateBySeller,
          // Seller Details
          sellerCompanyName: sellerProfile?.companyName,
          sellerAddress: `${sellerProfile?.address || ""}${
            sellerProfile?.landmark ? `, ${sellerProfile.landmark}` : ""
          }`.trim(),
          sellerCityStateCountry: sellerProfile?.cityStateCountry,
          sellerGstin: sellerProfile?.gstin,
          sellerPanNumber: sellerProfile?.pan,
          sellerContactNumber: sellerProfile?.contactNo,
          sellerEmailId: sellerProfile?.emailId,
          // Edprowise Details
          edprowiseCompanyName: edprowiseProfile?.companyName,
          edprowiseCompanyType: edprowiseProfile?.companyType,
          edprowiseGstin: edprowiseProfile?.gstin,
          edprowisePan: edprowiseProfile?.pan,
          edprowiseTan: edprowiseProfile?.tan,
          edprowiseCin: edprowiseProfile?.cin,
          edprowiseAddress: `${edprowiseProfile?.address || ""}${
            edprowiseProfile?.landmark ? `, ${edprowiseProfile?.landmark}` : ""
          }`.trim(),
          edprowiseCityStateCountry: edprowiseProfile?.cityStateCountry,
          edprowisePincode: edprowiseProfile?.pincode,
          edprowiseContactNo: edprowiseProfile?.contactNo,
          edprowiseAlternateContactNo: edprowiseProfile?.alternateContactNo,
          edprowiseEmailId: edprowiseProfile?.emailId,
          // Order Details
          invoiceDate: orderDetails?.invoiceDate || null,
          invoiceForSchool: orderDetails?.invoiceForSchool || null,
          invoiceForEdprowise: orderDetails?.invoiceForEdprowise || null,
        },
      },
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default getAllBySellerIdAndEnquiryNumber;
