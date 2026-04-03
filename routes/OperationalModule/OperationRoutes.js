import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import homeworkFileUpload from "../../controllers/UploadFiles/homeworkFileUpload.js";
import studentNoticeUpload from "../../controllers/UploadFiles/studentNoticeUpload.js";
// import { uploadGroupImage } from "../../controllers/UploadFiles/groupImageUpload.js";
import groupImageUpload from "../../controllers/UploadFiles/groupImageUpload.js";
import messageFileUpload from "../../controllers/UploadFiles/messageFileUpload.js";
import {
  getStudentInfo,
  createStudentHealthRecord,
  getClassAndSectionsByYear,
  getStudentHealthRecords,
  updateStudentHealthRecord,
  deleteStudentHealthRecord,

  //   Book
  addBookRecord,
  getBookRecords,
  updateBookRecord,
  deleteBookRecord,

  //   issue
  issueBook,
  getIssuedBooks,
  updateIssueBook,
  updateIssueBookStatus,

  // roll Number
  getStudentRecords,
  saveStudentRollNumbers,
  getStudentRollNumbersBySchoolYear,
  updateStudentsRollNumbers,
  getStudentRollNumbersbyClassAndSection,
  deleteStudentRollNumber,

  // Attendance
  markStudentAttendance,
  getStudentAttendance,
  getStudentAttendanceforSchool,
  updateStudentAttendance,

  // Holiday
  addHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday,

  // Subject
  addSubjects,
  getSubjects,
  getAllClassSubjects,
  updateSubject,
  deleteSubject,
  deleteClassSectionSubjects,
  // className
  getClassSubjectsByClassName,

  // TimePeriod
  getStaffDetails,
  addTimePeriod,
  getTimePeriodForSchool,
  getTimePeriodForClassAndSection,
  getClassTimePeriod,
  updateTimePeriod,
  deleteTimePeriodForClass,
  deleteTimePeriodByChildId,

  // ExamTimeTable
  createExamTimeTable,
  getExamTimeTables,
  updateExamTimeTable,
  deleteExamTimeTable,

  // Homework
  addOrUpdateHomework,
  getHomeworkByDate,
  getHomework,
  updateHomework,
  deleteHomework,

  // Notice
  addNotice,
  getNotices,
  updateNotice,
  deleteNotice,

  // Lesson plan
  addLessonPlan,
  getLessonPlan,
  updateLessonPlan,
  getLessonPlanBySubject,
  deleteLessonPlan,

  // Assign Test
  getStudentInfoByRegistrationNumber,
  createAssignTest,
  getAssignTests,

  // teacherFeedback
  getTeacherFeedbackDetails,
  getStudentDetailsFillTeacherFeedback,

  // Question Set
  createOrUpdateQuestionSet,
  getQuestionSetByClassAndSubject,
  getSchoolQuestionSets,
  getQuestionSet,
  updateQuestionSet,
  deleteQuestionFromSet,
  deleteQuestionSet,
  getSubjectsFromQuestionSets,
  getStudentRegistrationInfoByClassId,
  getStudentsWithAssignStatus,
  getAssignedTests,
  getStudentAssignTests,

  // Enteance Exam Subject
  createEntranceExamSubject,
  getEntranceExamSubjects,
  updateEntranceExamSubject,
  deleteEnteanceExam,
  deleteEntranceExamSubject,

  //  TestLInk
  getTestByLink,
  getAssignedTestDetailsForTest,
  saveAssignTestAnswer,
  submitAssignTestAnswer,

  // Greeting Templates
  createGreetingTemplate,
  getGreetingTemplates,
  deleteGreetingTemplate,

  // Absent template
  createAbsentsmsTemplate,
  getAbsentsmsTemplates,
  deleteAbsentsmsTemplate,

  // Chatbox
  getAllUserDetails,
  createGroupConversation,
  startOneToOneConversation,
  sendMessage,
  getConversations,
  getMessages,
  getChatUserDetail,
  addChatInFavorite,
  getFavoriteChats,
  removeChatFromFavorite,
  checkFavoriteChat,
  deleteChatMessage,
} from "../../controllers/OperationalModule/index.js";

const router = express.Router();

router.get(
  "/get-student-details",
  // roleBasedMiddleware("School"),
  getStudentInfo
);

router.post("/create-student-health-record", createStudentHealthRecord);
router.get(
  "/get-class-and-section-by-year/:schoolId/:academicYear",
  roleBasedMiddleware("Admin", "School"),
  getClassAndSectionsByYear
);

router.get(
  "/get-student-health-records/:schoolId/:academicYear",
  getStudentHealthRecords
);

router.put(
  "/update-student-health-record/:id/:healthDetailId",
  updateStudentHealthRecord
);

router.delete("/delete-student-health-record/:id", deleteStudentHealthRecord);

// Book
router.post("/add-book-record", addBookRecord);
router.get("/book-records/:schoolId", getBookRecords);
router.put("/update-book-record/:recordId/:bookId", updateBookRecord);
router.delete("/delete-book/:recordId/:bookId", deleteBookRecord);

// issue
router.post("/issue-book", issueBook);
router.get("/get-issue-book-record/:schoolId", getIssuedBooks);
router.put("/update-issue-book", updateIssueBook);
router.put("/update-issue-book-status/:id", updateIssueBookStatus);

// roll Number
router.get("/get-student-records/:schoolId/:academicYear", getStudentRecords);
router.post("/save-roll-numbers", saveStudentRollNumbers);
router.get(
  "/student-roll-numbers/by-school",
  getStudentRollNumbersBySchoolYear
);
router.get("/student-roll-numbers", getStudentRollNumbersbyClassAndSection);
router.put("/update-student-roll-numbers/:id", updateStudentsRollNumbers);
router.delete("/delete-student-roll-number/:id", deleteStudentRollNumber);

// Attendance
router.post("/mark-students-attendance", markStudentAttendance);
router.get("/get-student-attendance-class-section", getStudentAttendance);
router.get("/get-student-attendance-school", getStudentAttendanceforSchool);
router.put("/update-student-attendance", updateStudentAttendance);

// Holiday
router.get(
  "/get-school-holidays-operational/:schoolId/:academicYear",
  getHolidays
);
router.post("/add-school-holidays-operational", addHoliday);
router.put("/update-school-holidays-operational", updateHoliday);
router.delete(
  "/delete-school-holidays-operational/:parentId/:holidayId",
  deleteHoliday
);

// Subject
router.post("/add-class-subjects", addSubjects);
router.get("/get-class-subjects", getSubjects);
router.get("/get-all-class-subjects", getAllClassSubjects);
router.put("/update-or-add-subject/:parentId/:subjectId?", updateSubject);
router.delete("/delete-class-subjects/:parentId/:subjectId", deleteSubject);
router.delete(
  "/delete-class-section-subjects/:parentId",
  deleteClassSectionSubjects
);

// className
router.get("/get-class-subjects-by-classid", getClassSubjectsByClassName);

// TimePeriod
router.get("/get-employees/:schoolId", getStaffDetails);
router.post("/add-time-period", addTimePeriod);

router.get(
  "/get-time-period/:schoolId/:academicYear/:className/:sectionName",
  getTimePeriodForClassAndSection
);

router.get(
  "/get-time-period-by-class/:schoolId/:academicYear/:className/:sectionName",
  getClassTimePeriod
);

router.get("/get-time-period/:schoolId/:academicYear", getTimePeriodForSchool);

router.put("/update-time-period/:parentId", updateTimePeriod);

router.delete("/delete-time-period/:parentId", deleteTimePeriodForClass);

router.delete(
  "/delete-time-period/:parentId/:detailId",
  deleteTimePeriodByChildId
);

// ExamTimeTable
router.post("/add-exam-timetable", createExamTimeTable);
router.get("/get-exam-timetables", getExamTimeTables);
router.put("/update-exam-timetable/:id", updateExamTimeTable);
router.delete("/delete-exam-timetable/:id", deleteExamTimeTable);

// Homework
router.post("/add-homework", homeworkFileUpload, addOrUpdateHomework);
router.get("/get-homework-by-date", getHomeworkByDate);
router.get("/get-homework", getHomework);
router.put("/update-homework/:id", homeworkFileUpload, updateHomework);
router.delete("/delete-homework/:id", deleteHomework);

// Notics
router.post("/add-notice", studentNoticeUpload, addNotice);
router.get("/get-notices", getNotices);
router.put("/update-notice/:id", studentNoticeUpload, updateNotice);
router.delete("/delete-student-notice/:id", deleteNotice);

// Lesson Plan
router.post("/add-lesson-plan", addLessonPlan);
router.get("/get-lesson-plan", getLessonPlan);
router.put("/update-lesson-plans/:id", updateLessonPlan);
router.get("/get-lesson-plan-by-subject", getLessonPlanBySubject);
router.delete("/delete-lesson-plan/:id", deleteLessonPlan);

// Assign Test
router.get(
  "/get-student-info-by-registration",
  getStudentInfoByRegistrationNumber
);
router.post("/post-assign-test", createAssignTest);
router.get("/get-assign-tests", getAssignTests);

// TeacherFeedback Form
router.get("/teacher-feedback-summary", getTeacherFeedbackDetails);
router.get("/teacher-feedback-students", getStudentDetailsFillTeacherFeedback);

// Question set
router.post("/create-or-update-question-set", createOrUpdateQuestionSet);
router.get(
  "/get-question-set-by-class-subjectid",
  getQuestionSetByClassAndSubject
);
router.get("/get-question-all-set", getSchoolQuestionSets);
router.get("/get-question-set", getQuestionSet);
router.put("/update-question-set/:id", updateQuestionSet);
router.delete(
  "/delete-question/:questionSetId/:questionId",
  deleteQuestionFromSet
);
router.delete("/delete-question-set/:questionSetId", deleteQuestionSet);
router.get("/get-question-set-subjects", getSubjectsFromQuestionSets);
router.get(
  "/get-all-student-registraton-info-classid",
  getStudentRegistrationInfoByClassId
);
router.get("/get-students-with-assign-status", getStudentsWithAssignStatus);
router.get("/get-students-assign-test", getAssignedTests);
router.get("/get-student-assign-tests-details", getStudentAssignTests);

//  Entrance Subject
router.post("/entrance-exam-subjects", createEntranceExamSubject);
router.get("/get-entrance-exam-subjects", getEntranceExamSubjects);
router.put(
  "/put-entrance-exam-subjects/:parentId/:subjectId?",
  updateEntranceExamSubject
);
router.delete("/delete-entrance-exam-subjects/:id", deleteEnteanceExam);
router.delete(
  "/entrance-exam-subjects/:parentId/:subjectId",
  deleteEntranceExamSubject
);

// Test Link
router.get("/assign-test/by-link/:testLink", getTestByLink);
router.get("/get-assign-test-details-for-test", getAssignedTestDetailsForTest);
router.put("/save-answer", saveAssignTestAnswer);
router.put("/submit-test", submitAssignTestAnswer);

// Greeting Sms
router.post("/create-greeting-template", createGreetingTemplate);
router.get("/get-greeting-template", getGreetingTemplates);
router.delete("/delete-greeting-template/:id", deleteGreetingTemplate);

// Absent Sms
router.post("/create-absentsms-template", createAbsentsmsTemplate);
router.get("/get-absentsms-template", getAbsentsmsTemplates);
router.delete("/delete-absentsms-template/:id", deleteAbsentsmsTemplate);

//  Chatbox
router.get("/get-schools-all-user-details/:schoolId", getAllUserDetails);
router.post("/create-groups", groupImageUpload, createGroupConversation);
router.post("/conversations", startOneToOneConversation);
router.post("/send-message", messageFileUpload, sendMessage);
// router.get("/get-messages", getMessages);
router.get("/conversations/:userId", getConversations);
router.get("/get-messages/:conversationId", getMessages);
router.get("/get-user-details", getChatUserDetail);
router.post("/add-favorite-chats", addChatInFavorite);
router.get("/get-favorite-chats/:userId", getFavoriteChats);
router.get("/check-favorite-chats", checkFavoriteChat);
router.delete("/remove-chat-from-favorite/:favoriteId", removeChatFromFavorite);
router.delete("/delete-chat-message/:messageId", deleteChatMessage);
// deleteChatMessage
export default router;
