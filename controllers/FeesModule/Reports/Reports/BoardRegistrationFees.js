
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardRegistrationFee from "../../../../models/FeesModule/BoardRegistrationFees.js";
import BoardRegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";

const getCurrentAcademicYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  return currentMonth >= 3
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export const getBoardRegistrationFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: "schoolId and academicYear are required" });
    }

    
    const admissionDataList = await AdmissionForm.find({ schoolId }).lean();
    const registrationDataList = await StudentRegistration.find({ schoolId }).lean();

    const studentMap = new Map();

    const getStudentKey = (data) => {
      const firstName = data.firstName?.toLowerCase().trim();
      const lastName = data.lastName?.toLowerCase().trim();
      const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : '';
      return `${firstName}_${lastName}_${dateOfBirth}`;
    };


    for (const admission of admissionDataList) {
      const key = getStudentKey(admission);
      const existing = studentMap.get(key) || {};
      studentMap.set(key, {
        ...existing,
        admissionData: admission,
        academicHistory: admission.academicHistory || existing.academicHistory || [],
        admissionNumber: admission.AdmissionNumber || existing.admissionNumber || "-",
        registrationNumber: admission.registrationNumber || existing.registrationNumber || "-",
      });
    }

   
    for (const registration of registrationDataList) {
      const key = getStudentKey(registration);
      const existing = studentMap.get(key) || {};
      studentMap.set(key, {
        ...existing,
        registrationData: registration,
        academicHistory: existing.academicHistory || (registration.academicYear ? [{ academicYear: registration.academicYear, masterDefineClass: registration.masterDefineClass, section: registration.section, masterDefineShift: registration.masterDefineShift }] : []),
        admissionNumber: existing.admissionNumber || "-",
        registrationNumber: registration.registrationNumber || existing.registrationNumber || "-",
      });
    }

    if (studentMap.size === 0) {
      return res.status(404).json({ message: "No student data found for the school" });
    }

    const result = { [academicYear]: [] };

    for (const [studentKey, { admissionData, academicHistory, admissionNumber, registrationNumber }] of studentMap) {
      const history = academicHistory.find(h => h.academicYear === academicYear) || {};
      const classId = admissionData?.masterDefineClass || history.masterDefineClass || null;
      const sectionId = admissionData?.section || history.section || null;

      if (!classId || !sectionId) continue; 


      const boardReg = await BoardRegistrationFee.findOne({
        schoolId,
        academicYear,
        sectionIds: { $in: [sectionId] },
      }).lean();

      if (!boardReg || !boardReg.amount || boardReg.amount === "0") continue; 

   
      const boardRegFeesPayment = await BoardRegistrationFeePayment.findOne({
        schoolId,
        admissionNumber,
        academicYear,
      }).lean();


      const feesDue = parseFloat(boardReg.amount || "0");
      if (feesDue === 0) continue;

      const studentData = {
        admissionNo: admissionNumber,
        regNo: registrationNumber,
        studentName: `${admissionData?.firstName || "-"} ${admissionData?.lastName || "-"}`.trim() || "-",
        boardRegFeesDue: feesDue.toString(),
        boardRegFeesDate: boardRegFeesPayment?.paymentDate
          ? new Date(boardRegFeesPayment.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        boardRegFeesReceiptNo: boardRegFeesPayment?.receiptNumberBrf || "-",
        boardRegFeesPaymentMode: boardRegFeesPayment?.paymentMode || "-",
        boardRegFeesTransactionNo: boardRegFeesPayment?.chequeNumber || boardRegFeesPayment?.transactionId || "-",
        boardRegFeesConcession: boardRegFeesPayment?.concessionAmount || "0",
        boardRegFeesPaid: boardRegFeesPayment?.status === "Paid" ? boardRegFeesPayment.amount.toString() || "0" : "0",
      };

      
      let className = "-";
      let sectionName = "-";
      const classData = await ClassAndSection.findOne({
        schoolId,
        academicYear,
        "sections._id": sectionId,
      }).lean();
      if (classData) {
        className = classData.className || "-";
        const sectionInfo = classData.sections.find(s => s._id.toString() === sectionId.toString());
        sectionName = sectionInfo?.name || "-";
      }

      result[academicYear].push({
        academicYear,
        className,
        sectionName,
        student: studentData,
      });
    }

    if (result[academicYear].length === 0) {
      return res.status(404).json({ message: "No board registration fee data found for the specified academic year" });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error fetching board registration fees:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getBoardRegistrationFees;