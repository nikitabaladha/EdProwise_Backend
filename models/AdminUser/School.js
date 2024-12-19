const mongoose = require("mongoose");

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
        validate: {
            validator: function (v) {
              if (v) {
                const fileExtension = v.split('.').pop().toLowerCase();
                return fileExtension === 'jpg' || fileExtension === 'jpeg'; // Only allows .jpg or .jpeg files
              }
              return true; // No validation if the value is null
            },
            message: "Only JPG files are allowed for profile image!",
          },
    },
    affiliationCertificate: {
        type: String, // Path to the uploaded file (file URL or filename)
        require:true,
        validate: {
            validator: function (v) {
              if (v) {
                const fileExtension = v.split('.').pop().toLowerCase();
                return fileExtension === 'pdf'; // Only allows .pdf files
              }
              return true; // No validation if the value is null
            },
            message: "Only PDF files are allowed for affiliation certificate!",
          },
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

module.exports = School;
