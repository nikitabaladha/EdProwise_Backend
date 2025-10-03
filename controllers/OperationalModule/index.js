import getStudentInfo from "./StudentHealth/getStudentInfo.js";
import createStudentHealthRecord from "./StudentHealth/createStudentHealthRecord.js";
import getClassAndSectionsByYear from "./StudentHealth/getClassAndSectionsByYear.js";
import getStudentHealthRecords from "./StudentHealth/getStudentHealthRecords.js";
import updateStudentHealthRecord from "./StudentHealth/updateStudentHealthRecord.js";
import deleteStudentHealthRecord from "./StudentHealth/deleteStudentHealthRecord.js";

// Book
import addBookRecord from "./BookRecord/addBookRecord.js";
import getBookRecords from "./BookRecord/getBookRecords.js";
import updateBookRecord from "./BookRecord/updateBookRecord.js";
import deleteBookRecord from "./BookRecord/deleteBookRecord.js";

// issue book
import issueBook from "./IssueBook/issueBook.js";
import getIssuedBooks from "./IssueBook/getIssuedBooks.js";
import updateIssueBook from "./IssueBook/updateIssueBook.js";
import updateIssueBookStatus from "./IssueBook/updateIssueBookStatus.js";

// Roll number
import getStudentRecords from "./DefineRollNumber/getStudentRecords.js";
import saveStudentRollNumbers from "./DefineRollNumber/saveStudentRollNumbers.js";
import getStudentRollNumbersBySchoolYear from "./DefineRollNumber/getStudentRollNumbersBySchoolYear.js";
import updateStudentsRollNumbers from "./DefineRollNumber/updateStudentsRollNumbers.js";
import getStudentRollNumbersbyClassAndSection from "./DefineRollNumber/getStudentRollNumbersbyClassAndSection.js";
import deleteStudentRollNumber from "./DefineRollNumber/deleteStudentRollNumber.js";

// Attendance
import markStudentAttendance from "./StudentAttendance/MarkStudentAttendance.js";
import getStudentAttendance from "./StudentAttendance/getStudentAttendance.js";
import getStudentAttendanceforSchool from "./StudentAttendance/getStudentAttendanceforSchool.js";
import updateStudentAttendance from "./StudentAttendance/updateStudentAttendance.js";

// Holidays
import addHoliday from "./SchoolHolidays/addHoliday.js";
import getHolidays from "./SchoolHolidays/getHolidays.js";
import updateHoliday from "./SchoolHolidays/updateHoliday.js";
import deleteHoliday from "./SchoolHolidays/deleteHoliday.js";

// Subject
import addSubjects from "./DefineSubjects/addSubjects.js";
import getSubjects from "./DefineSubjects/getSubjects.js";
import updateSubject from "./DefineSubjects/updateSubject.js";
import deleteSubject from "./DefineSubjects/deleteSubject.js";
import deleteClassSectionSubjects from "./DefineSubjects/deleteClassSectionSubjects.js";
import getAllClassSubjects from "./DefineSubjects/getAllClassSubjects.js";

// TimePeriod
import getStaffDetails from "./ClassesTimeTable/getStaffDetails.js";
import addTimePeriod from "./ClassesTimeTable/addTimePeriod.js";
import getTimePeriodForSchool from "./ClassesTimeTable/getTimePeriodForSchool.js";
import getTimePeriodForClassAndSection from "./ClassesTimeTable/getTimePeriodForClassAndSection.js";
import getClassTimePeriod from "./ClassesTimeTable/getClassTimePeriod.js";
import updateTimePeriod from "./ClassesTimeTable/updateTimePeriod.js";
import deleteTimePeriodForClass from "./ClassesTimeTable/deleteTimePeriodForClass.js";
import deleteTimePeriodByChildId from "./ClassesTimeTable/deleteTimePeriodByChildId.js";

// ExamTimeTable
import createExamTimeTable from "./ExamTimeTable/createExamTimeTable.js";
import getExamTimeTables from "./ExamTimeTable/getExamTimeTables.js";
import updateExamTimeTable from "./ExamTimeTable/updateExamTimeTable.js";
import deleteExamTimeTable from "./ExamTimeTable/deleteExamTimeTable.js";

// homeWork
import addOrUpdateHomework from "./StudentHomework/addOrUpdateHomework.js";
import getHomeworkByDate from "./StudentHomework/getHomeworkByDate.js";
import getHomework from "./StudentHomework/getHomework.js";
import updateHomework from "./StudentHomework/updateHomework.js";
import deleteHomework from "./StudentHomework/deleteHomework.js";

// Notices
import addNotice from "./StudentNotice/addNotice.js";
import getNotices from "./StudentNotice/getNotices.js";
import updateNotice from "./StudentNotice/updateNotice.js";
import deleteNotice from "./StudentNotice/deleteNotice.js";

// LessonPlan
import addLessonPlan from "./LessonPlan/addLessonPlan.js";
import getLessonPlan from "./LessonPlan/getLessonPlan.js";
import updateLessonPlan from "./LessonPlan/updateLessonPlan.js";
import getLessonPlanBySubject from "./LessonPlan/getLessonPlanBySubject.js";
import deleteLessonPlan from "./LessonPlan/deleteLessonPlan.js";

// Assign Test
import getStudentInfoByRegistrationNumber from "./AssignTest/getStudentInfoByRegistrationNumber.js";
import createAssignTest from "./AssignTest/createAssignTest.js";
import getAssignTests from "./AssignTest/getAssignTests.js";
// BY class
import getClassSubjectsByClassName from "./AssignTest/getClassSubjectsByClassName.js";

// TeacherFeedback
import getTeacherFeedbackDetails from "./TeacherFeedbackDeatils/getTeacherFeedbackDetails.js";
import getStudentDetailsFillTeacherFeedback from "./TeacherFeedbackDeatils/getStudentDetailsFillTeacherFeedback.js";

// .Question Set
import createOrUpdateQuestionSet from "./QuestionSet/createOrUpdateQuestionSet.js";
import getQuestionSetByClassAndSubject from "./QuestionSet/getQuestionSetByClassAndSubject.js";
import getSchoolQuestionSets from "./QuestionSet/getSchoolQuestionSets.js";
import getQuestionSet from "./QuestionSet/getQuestionSet.js";
import updateQuestionSet from "./QuestionSet/updateQuestionSet.js";
import deleteQuestionFromSet from "./QuestionSet/deleteQuestionFromSet.js";
import deleteQuestionSet from "./QuestionSet/deleteQuestionSet.js";
import getSubjectsFromQuestionSets from "./QuestionSet/getSubjectsFromQuestionSets.js";
import getStudentRegistrationInfoByClassId from "./AssignTest/getStudentRegistrationInfoByClassId.js";
import getStudentsWithAssignStatus from "./AssignTest/getStudentsWithAssignStatus.js";
import getAssignedTests from "./AssignTest/getAssignedTests.js";
import getStudentAssignTests from "./AssignTest/getStudentAssignTests.js";

// Define Entrance Subject
import createEntranceExamSubject from "./EntranceExamSubject/createEntranceExamSubject.js";
import getEntranceExamSubjects from "./EntranceExamSubject/getEntranceExamSubjectsByClass.js";
import updateEntranceExamSubject from "./EntranceExamSubject/updateEntranceExamSubject.js";
import deleteEnteanceExam from "./EntranceExamSubject/deleteEnteanceExam.js";
import deleteEntranceExamSubject from "./EntranceExamSubject/deleteEntranceExamSubject.js";

// Test Link
import getTestByLink from "./AssignTest/getTestByLink.js";
import getAssignedTestDetailsForTest from "./AssignTest/getAssignedTestDetailsForTest.js";
import saveAssignTestAnswer from "./AssignTest/saveAssignTestAnswer.js";
import submitAssignTestAnswer from "./AssignTest/submitAssignTestAnswer.js";

// GreetingSms Templates
import createGreetingTemplate from "./GreetingTemplate/createGreetingTemplate.js";
import getGreetingTemplates from "./GreetingTemplate/getGreetingTemplates.js";
import deleteGreetingTemplate from "./GreetingTemplate/deleteGreetingTemplate.js";

// Absentsms
import createAbsentsmsTemplate from "./AbsentsmsTemplate/createAbsentsmsTemplate.js";
import getAbsentsmsTemplates from "./AbsentsmsTemplate/getAbsentsmsTemplates.js";
import deleteAbsentsmsTemplate from "./AbsentsmsTemplate/deleteAbsentsmsTemplate.js";

// ChatBox
import getAllUserDetails from "./ChatBox/getAllUserDeails.js";
import createGroupConversation from "./ChatBox/createGroupConversation.js";
import startOneToOneConversation from "./ChatBox/startOneToOneConversation.js";
import sendMessage from "./ChatBox/sendMessage.js";
import getMessages from "./ChatBox/getMessages.js";
import getConversations from "./ChatBox/getConversation.js";
import getChatUserDetail from "./ChatBox/getChatUserDetail.js";
import addChatInFavorite from "./ChatBox/addChatInFavorite.js";
import getFavoriteChats from "./ChatBox/getFavoriteChats.js";
import removeChatFromFavorite from "./ChatBox/removeChatFromFavorite.js";
import checkFavoriteChat from "./ChatBox/checkFavoriteChat.js";
import deleteChatMessage from "./ChatBox/deleteMessage.js";
export {
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
  // class Id
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

  // Notices
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

  // AssignTest
  getStudentInfoByRegistrationNumber,
  createAssignTest,
  getAssignTests,

  // teacherfeedback
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

  // Entrance Exam Subject
  createEntranceExamSubject,
  getEntranceExamSubjects,
  updateEntranceExamSubject,
  deleteEnteanceExam,
  deleteEntranceExamSubject,

  // TestLInk
  getTestByLink,
  getAssignedTestDetailsForTest,
  saveAssignTestAnswer,
  submitAssignTestAnswer,

  // Greeting Templates
  createGreetingTemplate,
  getGreetingTemplates,
  deleteGreetingTemplate,

  // Absent
  createAbsentsmsTemplate,
  getAbsentsmsTemplates,
  deleteAbsentsmsTemplate,

  // ChatBox
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
};
 