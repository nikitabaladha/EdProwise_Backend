import mongoose from 'mongoose';
import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

const getCurrentAcademicYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  return currentMonth >= 3
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export const getAllRegistrationFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
    }
    const targetAcademicYear = academicYear || getCurrentAcademicYear();
    const registrationDataList = await StudentRegistration.find({
      schoolId,
      academicYear: targetAcademicYear,
      paymentMode: { $ne: 'null' } 
    }).lean();
    if (!registrationDataList.length) {
      return res.status(404).json({ message: `No registration data found for academic year ${targetAcademicYear}` });
    }
    const result = {};
    const registrationDetails = [];
    for (const registration of registrationDataList) {
      const studentName = `${registration.firstName || ""} ${registration.lastName || ""}`.trim() || "-";
      const registrationDetail = {
        firstName: registration.firstName || "-",
        lastName: registration.lastName || "-",
        registrationNumber: registration.registrationNumber || "-",
        regFeesDate: registration.paymentDate
          ? new Date(registration.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        regFeesPaymentMode: registration.paymentMode || "-",
        regFeesDue: registration.registrationFee || "0",
        regFeesConcession: registration.concessionAmount || "0",
        regFeesPaid: registration.finalAmount || "0",
        regFeesChequeNumber: registration.chequeNumber || "-",
        regFeesBankName: registration.bankName || "-",
        regFeesTransactionNo: registration.chequeNumber ? registration.chequeNumber : registration.transactionNumber || "-",
        regFeesReceiptNo: registration.receiptNumber || "-",
      };
      registrationDetails.push(registrationDetail);
      const studentData = {
        regNo: registration.registrationNumber || "-",
        studentName,
        regFeesDate: registration.paymentDate
          ? new Date(registration.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        regFeesPaymentMode: registration.paymentMode || "-",
        regFeesDue: registration.registrationFee || "0",
        regFeesConcession: registration.concessionAmount || "0",
        regFeesPaid: registration.finalAmount || "0",
        regFeesChequeNumber: registration.chequeNumber || "-",
        regFeesBankName: registration.bankName || "-",
        regFeesTransactionNo: registration.chequeNumber ? registration.chequeNumber : registration.transactionNumber || "-",
        regFeesReceiptNo: registration.receiptNumber || "-",
      };
      const classId = registration.masterDefineClass || null;
      const sectionId = registration.section || null;
      const yearSpecificData = {
        academicYear: targetAcademicYear,
        classId,
        sectionId,
        className: "-",
        student: studentData,
      };
      if (classId && sectionId) {
        const classData = await ClassAndSection.findOne({
          schoolId,
          academicYear: targetAcademicYear,
          "sections._id": sectionId,
        }).lean();
        if (classData) {
          yearSpecificData.className = classData.className || "-";
        }
      } else if (classId) {
        const classData = await ClassAndSection.findOne({
          schoolId,
          academicYear: targetAcademicYear,
          _id: classId,
        }).lean();
        yearSpecificData.className = classData?.className || "-";
      }
      if (!result[targetAcademicYear]) result[targetAcademicYear] = [];
      result[targetAcademicYear].push(yearSpecificData);
    }
    res.status(200).json({
      data: result,
      registrationDetails,
    });
  } catch (error) {
    console.error("Error fetching registration fees data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getAllRegistrationFees;