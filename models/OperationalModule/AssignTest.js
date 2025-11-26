// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const ansDetailSchema = new Schema({
//   questionId: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   answerOption: {
//     type: String,
//     unique: true,
//   },

 
// });
// const testDetailSchema = new Schema({
//   subjectId: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   questionSetId: {
//     type: String,
//     unique: true,
//   },

//   ansDetails: {
//     type: [ansDetailSchema],
//     required: true,
//   },
//   assignTest: {
//     type: String,
//     enum: ["Yes", "No"],
//     default: "Yes",
//   },

//   result: {
//     type: String,
//     enum: ["Awaited", "Pass", "Fail"],
//     default: "Awaited",
//   },

//   receiveMarks: {
//     type: String,
//     required: true,
//   },

//   testLink: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// });
// const AssignTestSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     academicYear: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     registrationNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     classId: {
//       type: String,
//       trim: true,
//     },

//     registrationDate: {
//       type: Date,
//     },

//     testDetails: {
//       type: [testDetailSchema],
//       required: true,
//     },
    
//   },
//   { timestamps: true }
// );

// export default mongoose.model("AssignTest", AssignTestSchema);

// '''''MOdel with update in one things in all for per student''
// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const ansDetailSchema = new Schema({
//   questionId: {
//     type: Schema.Types.ObjectId, 
//     ref: "QuestionSet",
//     required: true,
//   },
//   answerOption: {
//     type: String,
//     required: true, 
//     trim: true,
//   },
// });

// const testDetailSchema = new Schema({
//   subjectId: {
//     type: Schema.Types.ObjectId,
//     ref: "ClassSubject",
//     required: true,
//   },
//   questionSetObjId: {
//     type: Schema.Types.ObjectId,
//     ref: "QuestionSet",
//     required: true,
//   },
//   questionSetId: {
//     type: String,
//     required: true,
//   },
//   ansDetails: {
//     type: [ansDetailSchema],
    
//   },
//   assignTest: {
//     type: String,
//     enum: ["Yes", "No"],
//     default: "Yes",
//   },
//   result: {
//     type: String,
//     enum: ["Awaited", "Pass", "Fail"],
//     default: "Awaited",
//   },
//   receiveMarks: {
//     type: Number,
//     required: true,
//   },
//   testLink: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// });

// const AssignTestSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     academicYear: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     registrationNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     classId: {
//       type: Schema.Types.ObjectId,
//       ref: "ClassAndSection",
//       required: true,
//     },
//     registrationDate: {
//       type: Date,
//       default: Date.now,
//     },
//     testDetails: {
//       type: [testDetailSchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// AssignTestSchema.index(
//   {
//     schoolId: 1,
//     academicYear: 1,
//     registrationNumber: 1,
//     classId: 1,
//     "testDetails.subjectId": 1,
//     "testDetails.questionSetId": 1,
//   },
//   { unique: true }
// ); 
// export default mongoose.model("AssignTest", AssignTestSchema);

// import mongoose from "mongoose";
// const { Schema } = mongoose;

// const ansDetailSchema = new Schema({
//   questionName: {
//     type: String,
//     required: true,
//   },
//   selectAnswerOption: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   correctAnswerOption: {
//     type: String,
//     required: true,
//     trim: true,
//   },
 
//   options: {
//     // type: [optionSchema],
//     validate: [arrayLimit, "A question must have exactly 4 options"],
//   },
//   correctAnswer: {
//     type: String,
//     enum: ["A", "B", "C", "D"],
//     required: true,
//   },
//   marks: { type: Number, required: true },
// });

// const testDetailSchema = new Schema({
//   subjectId: {
//     type: Schema.Types.ObjectId,
//     ref: "ClassSubject",
//     required: true,
//   },
//   questionSetObjId: {
//     type: Schema.Types.ObjectId,
//     ref: "QuestionSet",
//     required: true,
//   },
//   questionSetId: {
//     type: String,
//     required: true,
//   },
//   ansDetails: {
//     type: [ansDetailSchema],
    
//   },
//   assignTest: {
//     type: String,
//     enum: ["Yes", "No"],
//     default: "Yes",
//   },
//   result: {
//     type: String,
//     enum: ["Awaited", "Pass", "Fail"],
//     default: "Awaited",
//   },
//   receiveMarks: {
//     type: Number,
//     required: true,
//   },
//   testLink: {
//     type: String,
//     required: true,
//     trim: true,
//   },
// });

// const AssignTestSchema = new mongoose.Schema(
//   {
//     schoolId: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     academicYear: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     registrationNumber: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     classId: {
//       type: Schema.Types.ObjectId,
//       ref: "ClassAndSection",
//       required: true,
//     },
//     registrationDate: {
//       type: Date,
//       default: Date.now,
//     },
//     testDetails: {
//       type: [testDetailSchema],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// AssignTestSchema.index(
//   {
//     schoolId: 1,
//     academicYear: 1,
//     registrationNumber: 1,
//     classId: 1,
//     "testDetails.subjectId": 1,
//     "testDetails.questionSetId": 1,
//   },
//   { unique: true }
// ); 
// export default mongoose.model("AssignTest", AssignTestSchema);

import mongoose from "mongoose";

const { Schema } = mongoose;

const optionSchema = new Schema({
  optionLabel: { type: String, required: true },
  optionText: { type: String, required: true },
});

function arrayLimit(val) {
  return val.length === 4;
}

const ansDetailSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: "QuestionSet.questions",
    required: true,
  },

  questionText: {
    type: String,
    required: true,
    trim: true,
  },

  options: {
    type: [optionSchema],
    required: true,
    validate: [arrayLimit, "A question must have exactly 4 options"],
  },

  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },

  studentAnswer: {
    type: String,
    enum: ["A", "B", "C", "D", null],
    default: null,
  },

  marks: {
    type: Number,
    required: true,
  },
});

const testDetailSchema = new Schema({
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "ClassSubject",
    required: true,
  },

  questionSetObjId: {
    type: Schema.Types.ObjectId,

    ref: "QuestionSet",

    required: true,
  },

  questionSetId: {
    type: String,

    required: true,
  },

  totalMarks: {
    type: Number,

    required: true,
  },

  passingMarks: {
    type: Number,
    required: true,
  },

  ansDetails: {
    type: [ansDetailSchema],
    required: true,
  },

  assignTest: {
    type: String,
    enum: ["Yes", "No"],
    default: "Yes",
  },

  result: {
    type: String,
    enum: ["Awaited", "Pass", "Fail"],
    default: "Awaited",
  },

  receiveMarks: {
    type: Number,
    default: 0,
  },

  testLink: {
    type: String,
    required: true,
    trim: true,
  },
  assignTestDate: {
    type: Date,
    default: Date.now,
  },

  testDuration: { type: String, required: true },
});

const AssignTestSchema = new Schema(
  {
    schoolId: {
      type: String,

      required: true,

      trim: true,
    },

    academicYear: {
      type: String,

      required: true,

      trim: true,
    },

    registrationNumber: {
      type: String,

      required: true,

      trim: true,
    },

    classId: {
      type: Schema.Types.ObjectId,

      ref: "ClassAndSection",

      required: true,
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },

    testDetails: {
      type: [testDetailSchema],
      default: [],
    },
  },

  { timestamps: true }
);

AssignTestSchema.index(
  {
   schoolId: 1,
   academicYear: 1,
   registrationNumber: 1,
   classId: 1,
   "testDetails.subjectId": 1,
   "testDetails.questionSetId": 1,
  },

  { unique: true }
);

export default mongoose.model("AssignTest", AssignTestSchema);

 