// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const teacherFeedbackSchema = new Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     academicYear: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     staffId: {
//       type: String,
//       required: true,
//     },

//     subjectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "ClassSubject",
//       required: true,
//     },

//     designation: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     className: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     sectionName: {
//       type: String,
//       required: true,
//     },

//     admissionNumber: {
//       type: String,
//       required: true,
//     },
//     rollNumber: {
//       type: String,
//       required: true,
//     },
//     overallRating: {
//       type: Number,
//       min: 1,
//       max: 5,
//       required: true,
//     },

//     teachingStyle: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     teachingExplanation: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     classActivity: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     engagementWithStudents: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     lessonPlanning: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     behaviourSkills: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     discipline: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     communicationSkills: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     goodListener: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     arrivalOnTime: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     guidanceAndMotivational: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor"],
//       required: true,
//     },

//     inspiration: {
//       type: String,
//       enum: ["Excellent", "Good", "Average", "Poor",],
//       required: true,
//     },

//     remarks: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     status: {
//       type: String,
//       enum: ["Pending", "Submit"],
//       default: "Pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("TeacherFeedback", teacherFeedbackSchema);

import mongoose from "mongoose";

const { Schema } = mongoose;

const teacherFeedbackSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      index: true,
    },
    staffId: {
      type: String,
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSubject",
      required: true,
    },

    
    className: {
      type: String,
      required: true,
      trim: true,
    },

    sectionName: {
      type: String,
      required: true,
    },

    admissionNumber: {
      type: String,
      required: true,
    },

    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    teachingStyle: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    teachingExplanation: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    classActivity: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    engagementWithStudents: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    lessonPlanning: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    behaviourSkills: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    discipline: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    communicationSkills: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    goodListener: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    arrivalOnTime: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    guidanceAndMotivational: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    inspiration: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Submit"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("TeacherFeedback", teacherFeedbackSchema);
