import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { fileURLToPath } from "url";

import PrepareQuote from "../../../models/ProcurementService/PrepareQuote.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import SchoolRegistration from "../../../models/School.js";
import QuoteRequest from "../../../models/ProcurementService/QuoteRequest.js";
import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import SellerProfile from "../../../models/SellerProfile.js";
import EdprowiseProfile from "../../../models/EdprowiseProfile.js";
import OrderDetailsFromSeller from "../../../models/ProcurementService/OrderDetailsFromSeller.js";
import GeneratePDFMail from "./generatePDFMail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function quotePDFRequirementsForEmail(params) {
  try {
    const { sellerId, enquiryNumber, schoolId } = params;

    if (!sellerId || !enquiryNumber || !schoolId) {
      return {
        hasError: true,
        message: "Seller ID, Enquiry Number, and School ID are required.",
      };
    }

    const [
      school,
      quoteRequest,
      quoteProposal,
      submitQuote,
      sellerProfile,
      edprowiseProfile,
      orderDetails,
      prepareQuotes,
    ] = await Promise.all([
      SchoolRegistration.findOne({ schoolId }).select(
        "schoolName schoolEmail schoolMobileNo panNo schoolAddress schoolLocation landMark schoolPincode"
      ),
      QuoteRequest.findOne({ schoolId, enquiryNumber }).select(
        "deliveryAddress deliveryLandMark deliveryLocation createdAt enquiryNumber"
      ),
      QuoteProposal.findOne({ enquiryNumber, sellerId }).lean(),
      SubmitQuote.findOne({ enquiryNumber, sellerId }).select(
        "paymentTerms advanceRequiredAmount expectedDeliveryDateBySeller"
      ),
      SellerProfile.findOne({ sellerId }).select(
        "companyName address landmark cityStateCountry gstin pan contactNo emailId"
      ),
      EdprowiseProfile.findOne().select(
        "companyName companyType gstin pan tan cin address cityStateCountry landmark pincode contactNo alternateContactNo emailId"
      ),
      OrderDetailsFromSeller.findOne({ schoolId, sellerId }).select(
        "invoiceDate invoiceForSchool invoiceForEdprowise"
      ),
      PrepareQuote.find({ sellerId, enquiryNumber }),
    ]);

    if (
      !school ||
      !quoteRequest ||
      !quoteProposal ||
      !sellerProfile ||
      !edprowiseProfile ||
      !prepareQuotes.length
    ) {
      return {
        hasError: true,
        message: "Required data not found for PDF generation.",
      };
    }

    const prepareQuotesWithStatus = prepareQuotes.map((quote) => ({
      ...quote.toObject(),
      supplierStatus: quoteProposal?.supplierStatus || null,
    }));

    // Define paths and ensure directory exists

    // Set paths
    const invoicesDir = path.join(__dirname, "../../Documents/RequestQuotePDF");
    const templatePath = path.join(__dirname, "Quote-PDF-Format.ejs");
    const outputPath = path.join(
      invoicesDir,
      `Quote_${enquiryNumber}_${sellerId}.pdf`
    );

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Verify template exists
    if (!fs.existsSync(templatePath)) {
      return {
        hasError: true,
        message: `Template not found at ${templatePath}`,
        path: templatePath,
      };
    }

    const formatCost = (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      }).format(value);

    const formatDate = (dateString) =>
      dateString ? format(new Date(dateString), "dd/MM/yyyy") : "N/A";

    const convertToWords = (n) => {
      if (n === 0) return "Zero Rs only";
      const units = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      const thousands = ["", "Thousand", "Million", "Billion"];

      const convertLessThanThousand = (num) => {
        let str = "";
        if (num >= 100) {
          str += `${units[Math.floor(num / 100)]} Hundred `;
          num %= 100;
        }
        if (num >= 20) {
          str += `${tens[Math.floor(num / 10)]} `;
          num %= 10;
        }
        if (num > 0) str += `${units[num]} `;
        return str.trim();
      };

      let words = "",
        group = 0;
      while (n > 0) {
        const chunk = n % 1000;
        if (chunk > 0) {
          words = `${convertLessThanThousand(chunk)} ${
            thousands[group]
          } ${words}`;
        }
        n = Math.floor(n / 1000);
        group++;
      }
      return words.trim();
    };

    const dynamicData = {
      prepareQuoteData: prepareQuotesWithStatus,
      quoteProposalData: quoteProposal,
      profileData: {
        // School
        buyerName: school.schoolName,
        schoolContactNumber: school.schoolMobileNo,
        schoolPanNumber: school.panNo,
        schoolAddress: school.schoolAddress,
        schoolLocation: school.schoolLocation,
        schoolLandmark: school.landMark,
        schoolPincode: school.schoolPincode,
        schoolEmailId: school.schoolEmail,
        schoolDeliveryAddress: `${quoteRequest.deliveryAddress || ""}${
          quoteRequest.deliveryLandMark
            ? `, ${quoteRequest.deliveryLandMark}`
            : ""
        }`,
        schoolDeliveryLocation: quoteRequest.deliveryLocation,
        quoteRequestedDate: quoteRequest.createdAt,
        enquiryNumber: quoteRequest.enquiryNumber,
        // Quote
        quoteNumber: quoteProposal.quoteNumber,
        quoteProposalDate: quoteProposal.createdAt,
        paymentTerms: submitQuote?.paymentTerms || null,
        advanceRequiredAmount: submitQuote?.advanceRequiredAmount || null,
        expectedDeliveryDate: submitQuote?.expectedDeliveryDateBySeller || null,
        // Seller
        sellerCompanyName: sellerProfile.companyName,
        sellerAddress: `${sellerProfile.address || ""}${
          sellerProfile.landmark ? `, ${sellerProfile.landmark}` : ""
        }`,
        sellerCityStateCountry: sellerProfile.cityStateCountry,
        sellerGstin: sellerProfile.gstin,
        sellerPanNumber: sellerProfile.pan,
        sellerContactNumber: sellerProfile.contactNo,
        sellerEmailId: sellerProfile.emailId,
        // Edprowise
        edprowiseCompanyName: edprowiseProfile.companyName,
        edprowiseCompanyType: edprowiseProfile.companyType,
        edprowiseGstin: edprowiseProfile.gstin,
        edprowisePan: edprowiseProfile.pan,
        edprowiseTan: edprowiseProfile.tan,
        edprowiseCin: edprowiseProfile.cin,
        edprowiseAddress: `${edprowiseProfile.address || ""}${
          edprowiseProfile.landmark ? `, ${edprowiseProfile.landmark}` : ""
        }`,
        edprowiseCityStateCountry: edprowiseProfile.cityStateCountry,
        edprowisePincode: edprowiseProfile.pincode,
        edprowiseContactNo: edprowiseProfile.contactNo,
        edprowiseAlternateContactNo: edprowiseProfile.alternateContactNo,
        edprowiseEmailId: edprowiseProfile.emailId,
        // Invoice
        invoiceDate: orderDetails?.invoiceDate || null,
        invoiceForSchool: orderDetails?.invoiceForSchool || null,
        invoiceForEdprowise: orderDetails?.invoiceForEdprowise || null,
      },
      formatCost,
      formatDate,
      convertToWords,
    };

    // Generate the PDF
    await GeneratePDFMail(templatePath, dynamicData, outputPath);

    // Verify PDF was created
    if (!fs.existsSync(outputPath)) {
      return {
        hasError: true,
        message: "PDF file was not generated",
        path: outputPath,
      };
    }

    return {
      hasError: false,
      message: "PDF generated successfully",
      pdfPath: outputPath,
    };
  } catch (error) {
    console.error("Error in InvoicePDFRequirements:", error);
    return {
      hasError: true,
      message: "Internal server error while generating PDF.",
    };
  }
}

export default quotePDFRequirementsForEmail;
