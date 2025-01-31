import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyType: {
      type: String,
      enum: [
        "Public Limited",
        "Private Limited",
        "Partnership",
        "Sole Proprietor",
        "HUF",
      ],
      required: true,
    },
    gstin: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
    },
    tan: {
      type: String,
      required: false,
    },
    cin: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: true,
    },
    cityStateCountry: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    alternateContactNo: {
      type: String,
      required: false,
    },
    emailId: {
      type: String,
      required: true,
    },
    sellerProfile: {
      type: String,
      required: false,
    },
    accountNo: {
      type: String,
      required: true,
    },
    ifsc: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },

    noOfEmployees: {
      type: String,
      enum: [
        "1 to 10 Employees",
        "11 to 25 Employees",
        "25 to 50 Employees",
        "50 to 100 Employees",
        "More than 100 Employees",
      ],
      required: true,
    },
    ceoName: {
      type: String,
      required: false,
    },
    turnover: {
      type: Number,
      required: false,
    },
    dealingProducts: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        subCategoryIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SellerProfile", SellerProfileSchema);
