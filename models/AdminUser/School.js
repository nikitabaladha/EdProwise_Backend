import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
    },
    schoolMobileNo: {
      type: String,
      required: true,
    },
    schoolEmail: {
      type: String,
      required: true,
      unique: true,
    },
    schoolAddress: {
      type: String,
      required: true,
    },
    schoolLocation: {
      type: String,
      required: true,
    },
    profileImage: {
        type: String, // Path to the uploaded image (file URL or filename)
        require:true,
    },
    affiliationCertificate: {
        type: String, // Path to the uploaded file (file URL or filename)
        require:true,
    },
    affiliationUpto: {
        type: String,
        required: true,
        enum: [
          "Pre-Primary",
          "Primary (Upto Class 5)",
          "Secondary (Upto Class 10)",
          "Higher Secondary (Upto Class 12)",
          "College",
          "University",
        ],
    },
    panNo: {
      type: String,
      trim: true,
      require:true, 
    },
    panFile:{
      type:String,
      require:true,
    }
  },
  {
    timestamps: true,
  }
);

const School = mongoose.model("School", SchoolSchema);

export default School;
