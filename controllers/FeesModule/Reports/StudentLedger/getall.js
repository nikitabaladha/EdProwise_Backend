import mongoose from 'mongoose';
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import Fine from "../../../../models/FeesModule/Fine.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardExamFee from "../../../../models/FeesModule/BoardExamFee.js";
import BoardExamFeePayment from "../../../../models/FeesModule/BoardExamFeePayment.js";
import BoardRegistrationFee from "../../../../models/FeesModule/BoardRegistrationFees.js";
import BoardRegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";
import TCForm from "../../../../models/FeesModule/TCForm.js";
import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";

const getCurrentAcademicYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  return currentMonth >= 3
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
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

    const result = {};
    const admissionDetails = [];

  
    for (const [studentKey, { admissionData, registrationData, academicHistory, admissionNumber, registrationNumber }] of studentMap) {
      const studentDataBase = {
        admissionNo: admissionNumber,
        regNo: registrationNumber,
        studentName: `${registrationData?.firstName || admissionData?.firstName || ""} ${registrationData?.lastName || admissionData?.lastName || ""}`.trim() || "-",
        dateOfBirth: registrationData?.dateOfBirth || admissionData?.dateOfBirth
          ? new Date(registrationData?.dateOfBirth || admissionData?.dateOfBirth).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        age: registrationData?.age || admissionData?.age || "-",
        nationality: registrationData?.nationality || admissionData?.nationality || "-",
        gender: registrationData?.gender || admissionData?.gender || "-",
        bloodGroup: registrationData?.bloodGroup || admissionData?.bloodGroup || "-",
        currentAddress: registrationData?.currentAddress || admissionData?.currentAddress || "-",
        state: registrationData?.state || admissionData?.state || "-",
        pincode: registrationData?.pincode || admissionData?.pincode || "-",
        parentContactNo: registrationData?.fatherContactNo || registrationData?.parentContactNumber || admissionData?.fatherContactNo || admissionData?.parentContactNumber || "-",
        motherTongue: registrationData?.motherTongue || admissionData?.motherTongue || "-",
        previousSchool: registrationData?.previousSchoolName || admissionData?.previousSchoolName || "-",
        previousSchoolBoard: registrationData?.previousSchoolBoard || admissionData?.previousSchoolBoard || "-",
        aadharPassportNo: registrationData?.aadharPassportNumber || admissionData?.aadharPassportNumber || "-",
        category: registrationData?.studentCategory || admissionData?.studentCategory || "-",
        relationTypeWithSibling: registrationData?.relationType || admissionData?.relationType || "-",
        siblingName: registrationData?.siblingName || admissionData?.siblingName || "-",
        parentalStatus: registrationData?.parentalStatus || admissionData?.parentalStatus || "-",
        fatherName: registrationData?.fatherName || admissionData?.fatherName || "-",
        fatherMobileNo: registrationData?.fatherContactNo || admissionData?.fatherContactNo || "-",
        fatherQualification: registrationData?.fatherQualification || admissionData?.fatherQualification || "-",
        motherName: registrationData?.motherName || admissionData?.motherName || "-",
        motherMobileNo: registrationData?.motherContactNo || admissionData?.motherContactNo || "-",
        motherQualification: registrationData?.motherQualification || admissionData?.motherQualification || "-",
        fatherProfession: registrationData?.fatherProfession || admissionData?.fatherProfession || "-",
        motherProfession: registrationData?.motherProfession || admissionData?.motherProfession || "-",
        status: registrationData?.status || admissionData?.status || "-",
      };

      admissionDetails.push({
        firstName: registrationData?.firstName || admissionData?.firstName || "-",
        lastName: registrationData?.lastName || admissionData?.lastName || "-",
        AdmissionNumber: admissionNumber,
        registrationNumber: registrationNumber,
        regFeesDate: registrationData?.paymentDate
          ? new Date(registrationData.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "-",
        regFeesPaymentMode: registrationData?.paymentMode || "-",
        regFeesDue: registrationData?.registrationFee || "0",
        regFeesConcession: registrationData?.concessionAmount || "0",
        regFeesPaid: registrationData?.finalAmount || "0",
        regFeesChequeNumber: registrationData?.chequeNumber || "-",
        regFeesBankName: registrationData?.bankName || "-",
        regFeesTransactionNo: registrationData?.chequeNumber ? registrationData?.chequeNumber : registrationData?.transactionNumber || "-",
        regFeesReceiptNo: registrationData?.receiptNumber || "-",
      });


      const academicYears = [
        ...(academicHistory.length ? [...new Set(academicHistory.map(h => h.academicYear))] : []),
        ...(registrationData?.academicYear && !academicHistory.some(h => h.academicYear === registrationData.academicYear) ? [registrationData.academicYear] : []),
      ].filter((year, index, self) => self.indexOf(year) === index);

      if (!academicYears.length) {
        const defaultYear = getCurrentAcademicYear();
        academicYears.push(defaultYear);
        console.warn(`No academic years found for student: ${studentKey}, using default: ${defaultYear}`);
      }

      for (const academicYear of academicYears) {
        const history = academicHistory.find(h => h.academicYear === academicYear) || {};
        const classId = admissionData?.masterDefineClass || registrationData?.masterDefineClass || history.masterDefineClass || null;
        const sectionId = admissionData?.section || history.section || null;
        const shiftId = admissionData?.masterDefineShift || registrationData?.masterDefineShift || history.masterDefineShift || null;

       
        const studentData = {
          ...studentDataBase,
          admFeesDate: academicYear === academicHistory[0]?.academicYear && admissionData?.paymentDate
            ? new Date(admissionData.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "-",
          admFeesReceiptNo: academicYear === academicHistory[0]?.academicYear ? admissionData?.receiptNumber || "-" : "-",
          admFeesPaymentMode: academicYear === academicHistory[0]?.academicYear ? admissionData?.paymentMode || "-" : "-",
          admFeesTransactionNo: academicYear === academicHistory[0]?.academicYear ? admissionData?.transactionNumber || "-" : "-",
          admFeesDue: academicYear === academicHistory[0]?.academicYear ? admissionData?.admissionFees || "0" : "0",
          admFeesConcession: academicYear === academicHistory[0]?.academicYear ? admissionData?.concessionAmount || "0" : "0",
          admFeesPaid: academicYear === academicHistory[0]?.academicYear ? admissionData?.finalAmount || "0" : "0",
          regFeesDate: academicYear === academicHistory[0]?.academicYear && registrationData?.paymentDate
            ? new Date(registrationData.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "-",
          regFeesPaymentMode: academicYear === academicHistory[0]?.academicYear ? registrationData?.paymentMode || "-" : "-",
          regFeesDue: academicYear === academicHistory[0]?.academicYear ? registrationData?.registrationFee || "0" : "0",
          regFeesConcession: academicYear === academicHistory[0]?.academicYear ? registrationData?.concessionAmount || "0" : "0",
          regFeesPaid: academicYear === academicHistory[0]?.academicYear ? registrationData?.finalAmount || "0" : "0",
          regFeesChequeNumber: academicYear === academicHistory[0]?.academicYear ? registrationData?.chequeNumber || "-" : "-",
          regFeesBankName: academicYear === academicHistory[0]?.academicYear ? registrationData?.bankName || "-" : "-",
          regFeesTransactionNo: academicYear === academicHistory[0]?.academicYear
            ? registrationData?.chequeNumber ? registrationData?.chequeNumber : registrationData?.transactionNumber || "-"
            : "-",
          regFeesReceiptNo: academicYear === academicHistory[0]?.academicYear ? registrationData?.receiptNumber || "-" : "-",
          tcNo: "-",
          tcFeesDate: "-",
          tcFeesReceiptNo: "-",
          tcFeesPaymentMode: "-",
          tcFeesTransactionNo: "-",
          tcFeesDue: "0",
          tcFeesConcession: "0",
          tcFeesPaid: "0",
          boardExamFeesDue: "0",
          boardExamFeesDate: "-",
          boardExamFeesReceiptNo: "-",
          boardExamFeesPaymentMode: "-",
          boardExamFeesTransactionNo: "-",
          boardExamFeesConcession: "0",
          boardExamFeesPaid: "0",
          boardRegFeesDue: "0",
          boardRegFeesDate: "-",
          boardRegFeesReceiptNo: "-",
          boardRegFeesPaymentMode: "-",
          boardRegFeesTransactionNo: "-",
          boardRegFeesConcession: "0",
          boardRegFeesPaid: "0",
        };

        const yearSpecificData = {
          academicYear,
          classId,
          sectionId,
          shiftId,
          className: "-",
          sectionName: "-",
          shiftName: "-",
          feeInstallments: [],
          finePolicy: null,
          concession: null,
          paidInstallments: [],
          totals: {
            totalFeesAmount: academicYear === academicHistory[0]?.academicYear
              ? parseFloat(admissionData?.admissionFees || 0) + parseFloat(registrationData?.registrationFee || 0)
              : 0,
            totalConcession: academicYear === academicHistory[0]?.academicYear
              ? parseFloat(admissionData?.concessionAmount || 0) + parseFloat(registrationData?.concessionAmount || 0)
              : 0,
            totalFine: 0,
            totalFeesPayable: academicYear === academicHistory[0]?.academicYear
              ? parseFloat(admissionData?.finalAmount || 0) + parseFloat(registrationData?.finalAmount || 0)
              : 0,
            totalPaidAmount: academicYear === academicHistory[0]?.academicYear
              ? parseFloat(admissionData?.finalAmount || 0) + parseFloat(registrationData?.finalAmount || 0)
              : 0,
            totalRemainingAmount: 0,
          },
          installmentsPresent: [],
          student: { ...studentData },
        };

        if (classId && sectionId) {
          const classData = await ClassAndSection.findOne({
            schoolId,
            academicYear,
            "sections._id": sectionId,
          }).lean();
          if (classData) {
            yearSpecificData.className = classData.className || "-";
            const sectionInfo = classData.sections.find(s => s._id.toString() === sectionId.toString());
            yearSpecificData.sectionName = sectionInfo?.name || "-";
          }
        } else if (classId) {
          const classData = await ClassAndSection.findOne({
            schoolId,
            academicYear,
            _id: classId,
          }).lean();
          yearSpecificData.className = classData?.className || "-";
          yearSpecificData.sectionName = "-";
        }

        if (shiftId) {
          const shiftData = await MasterDefineShift.findOne({
            _id: shiftId,
            schoolId,
            academicYear,
          }).lean();
          yearSpecificData.shiftName = shiftData?.masterDefineShiftName || "-";
        }

        const tcData = await TCForm.findOne({
          schoolId,
          AdmissionNumber: admissionData?.AdmissionNumber,
          academicYear,
        }).lean();
        if (tcData) {
          yearSpecificData.student.tcNo = tcData.certificateNumber || admissionData?.tcCertificate || "-";
          yearSpecificData.student.tcFeesDate = tcData.paymentDate
            ? new Date(tcData.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "-";
          yearSpecificData.student.tcFeesReceiptNo = tcData.receiptNumber || "-";
          yearSpecificData.student.tcFeesPaymentMode = tcData.paymentMode || "-";
         yearSpecificData.student.tcFeesTransactionNo = tcData.chequeNumber || tcData.transactionNumber || "-";
          yearSpecificData.student.tcFeesDue = tcData.TCfees || "0";
          yearSpecificData.student.tcFeesConcession = tcData.concessionAmount || "0";
          yearSpecificData.student.tcFeesPaid = tcData.finalAmount || "0";
        }

        if (classId && sectionId) {
          const boardExam = await BoardExamFee.findOne({
            schoolId,
            academicYear,
            classId,
            sectionId
          }).lean();
          if (boardExam) {
            yearSpecificData.student.boardExamFeesDue = boardExam.amount || "0";
            const boardExamFeesPayment = await BoardExamFeePayment.findOne({
              schoolId,
              admissionNumber: admissionData?.AdmissionNumber,
              academicYear,
            }).lean();
            if (boardExamFeesPayment) {
              yearSpecificData.student.boardExamFeesDate = boardExamFeesPayment.paymentDate
                ? new Date(boardExamFeesPayment.paymentDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")
                : "-";
              yearSpecificData.student.boardExamFeesReceiptNo = boardExamFeesPayment.receiptNumberBef || "-";
              yearSpecificData.student.boardExamFeesPaymentMode = boardExamFeesPayment.paymentMode || "-";
              yearSpecificData.student.boardExamFeesTransactionNo =
              boardExamFeesPayment.chequeNumber || boardExamFeesPayment.transactionId || "-";
              yearSpecificData.student.boardExamFeesConcession = "0";
              yearSpecificData.student.boardExamFeesPaid =
                boardExamFeesPayment.status === "Paid" ? boardExamFeesPayment.amount || "0" : "0";
            }
          }
        }

  if (classId && admissionData?.AdmissionNumber) {
  const boardReg = await BoardRegistrationFee.findOne({
  schoolId,
  academicYear,
    sectionIds: { $in: [sectionId] },
  }).lean();

  if (boardReg) {
    yearSpecificData.student.boardRegFeesDue = boardReg.amount || "0";
  }


  const boardRegFeesPayment = await BoardRegistrationFeePayment.findOne({
    schoolId,
    admissionNumber: admissionData.AdmissionNumber,
    academicYear,
  }).lean();

  if (boardRegFeesPayment) {
   
    yearSpecificData.student.boardRegFeesDate = boardRegFeesPayment.paymentDate
      ? new Date(boardRegFeesPayment.paymentDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).replace(/\//g, "-")
      : "-";
    yearSpecificData.student.boardRegFeesReceiptNo = boardRegFeesPayment.receiptNumberBrf || "-";
    yearSpecificData.student.boardRegFeesPaymentMode = boardRegFeesPayment.paymentMode || "-";
    yearSpecificData.student.boardRegFeesTransactionNo =
      boardRegFeesPayment.chequeNumber || boardRegFeesPayment.transactionId || "-";
    yearSpecificData.student.boardRegFeesConcession = "0"; 
    yearSpecificData.student.boardRegFeesPaid =
      boardRegFeesPayment.status === "Paid" ? boardRegFeesPayment.amount.toString() || "0" : "0";
  } 
}

        // Fetch fee types
        const feeTypes = await FeesType.find({ schoolId, academicYear }).lean();
        const feeTypeMap = feeTypes.reduce((acc, type) => {
          acc[type._id.toString()] = type.feesTypeName || type.name;
          return acc;
        }, {});

        // Fetch fees structure
        const feesStructures = await FeesStructure.find({
          schoolId,
          classId,
          sectionIds: sectionId ? { $in: [sectionId] } : { $exists: true },
          academicYear,
        }).lean();

        const feeInstallments = [];
        const paidInstallments = [];
        const cumulativePaidMap = {};
        const installmentGroups = {};

        if (feesStructures.length) {
          // Fetch concession and fine data
          const concessionForm = await ConcessionFormModel.findOne({
            schoolId,
            AdmissionNumber: admissionData?.AdmissionNumber,
            academicYear,
          }).lean();
          const fineData = await Fine.findOne({ schoolId, academicYear }).lean();
          const allPaidFeesData = await SchoolFees.find({
            schoolId,
            studentAdmissionNumber: admissionData?.AdmissionNumber,
            academicYear,
          }).lean();

          for (const structure of feesStructures) {
            for (let i = 0; i < structure.installments.length; i++) {
              const inst = structure.installments[i];
              const instNumber = inst.number !== undefined ? inst.number : i + 1;
              let totalBalanceForInstallment = 0;

              for (const fee of inst.fees) {
                const feeAmount = fee.amount || 0;
                let concessionAmount = 0;
                let paidAmount = 0;

                if (concessionForm?.concessionDetails?.length) {
                  const concessionMatch = concessionForm.concessionDetails.find(
                    (c) =>
                      c.installmentName === inst.name &&
                      c.feesType.toString() === fee.feesTypeId.toString()
                  );
                  if (concessionMatch) {
                    concessionAmount = concessionMatch.concessionAmount || 0;
                  }
                }

                allPaidFeesData.forEach((payment) => {
                  const matchingInst = payment?.installments?.find(
                    (instData) => instData.installmentName === inst.name
                  );
                  const matchingFeeItem = matchingInst?.feeItems?.find(
                    (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
                  );
                  if (matchingFeeItem) {
                    paidAmount += matchingFeeItem.paid || 0;
                  }
                });

                totalBalanceForInstallment += feeAmount - concessionAmount - paidAmount;
              }

              for (const fee of inst.fees) {
                const feeAmount = fee.amount || 0;
                let concessionAmount = 0;
                let fineAmount = 0;
                let paidAmount = 0;

                if (concessionForm?.concessionDetails?.length) {
                  const concessionMatch = concessionForm.concessionDetails.find(
                    (c) =>
                      c.installmentName === inst.name &&
                      c.feesType.toString() === fee.feesTypeId.toString()
                  );
                  if (concessionMatch) {
                    concessionAmount = concessionMatch.concessionAmount || 0;
                  }
                }

                const dueDate = new Date(inst.dueDate);
                const today = new Date();
                if (totalBalanceForInstallment > 0 && today > dueDate && fineData) {
                  const { feeType, frequency, value, maxCapFee } = fineData;
                  const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
                  let multiplier = 0;
                  const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                  const monthsLate =
                    today.getMonth() - dueDate.getMonth() +
                    12 * (today.getFullYear() - dueDate.getFullYear());
                  const yearsLate = today.getFullYear() - dueDate.getFullYear();
                  switch (frequency) {
                    case "Daily":
                      multiplier = daysLate;
                      break;
                    case "Monthly":
                      multiplier = monthsLate;
                      break;
                    case "Annually":
                      multiplier = yearsLate;
                      break;
                    case "Fixed":
                      multiplier = 1;
                      break;
                  }
                  fineAmount = base * multiplier;
                  if (maxCapFee) {
                    fineAmount = Math.min(fineAmount, maxCapFee);
                  }
                }

                allPaidFeesData.forEach((payment) => {
                  const matchingInst = payment?.installments?.find(
                    (instData) => instData.installmentName === inst.name
                  );
                  const matchingFeeItem = matchingInst?.feeItems?.find(
                    (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
                  );
                  if (matchingFeeItem) {
                    const individualPaid = matchingFeeItem.paid || 0;
                    paidAmount += individualPaid;
                    const key = `${inst.name}_${fee.feesTypeId}`;
                    cumulativePaidMap[key] = (cumulativePaidMap[key] || 0) + individualPaid;
                    const totalPaidSoFar = cumulativePaidMap[key];
                    paidInstallments.push({
                      feesTypeId: {
                        _id: matchingFeeItem.feeTypeId,
                        name: feeTypeMap[matchingFeeItem.feeTypeId.toString()],
                      },
                      installmentNumber: instNumber,
                      paidAmount: individualPaid,
                      receiptNumber: payment.receiptNumber,
                      paymentDate: payment.paymentDate,
                      collectorName: payment.collectorName,
                      paymentMode: payment.paymentMode,
                      chequeNumber: payment.chequeNumber,
                      bankName: payment.bankName,
                      transactionNumber: payment.transactionNumber,
                      amount: fee.amount || 0,
                      concession: concessionAmount || 0,
                      fineAmount: fineAmount || 0,
                      excessAmount: matchingInst?.excessAmount || 0,
                      paidFine: matchingInst?.fineAmount || 0,
                      payable: (fee.amount || 0) - (concessionAmount || 0),
                      paid: individualPaid,
                      balance: ((fee.amount || 0) - (concessionAmount || 0)) - totalPaidSoFar,
                    });
                  }
                });

                const balanceAmount = feeAmount - concessionAmount - paidAmount;

                yearSpecificData.totals.totalFeesAmount += feeAmount;
                yearSpecificData.totals.totalConcession += concessionAmount;
                yearSpecificData.totals.totalFine += fineAmount;
                yearSpecificData.totals.totalFeesPayable += balanceAmount;
                yearSpecificData.totals.totalPaidAmount += paidAmount;
                yearSpecificData.totals.totalRemainingAmount += balanceAmount;

                feeInstallments.push({
                  feesTypeId: {
                    _id: fee.feesTypeId,
                    name: feeTypeMap[fee.feesTypeId.toString()],
                  },
                  installmentName: inst.name,
                  dueDate: inst.dueDate,
                  amount: feeAmount,
                  concessionAmount,
                  fineAmount,
                  paidAmount,
                  balanceAmount,
                });
              }
            }
          }

          const installmentNameMapping = {};
          feesStructures.forEach((structure) => {
            structure.installments.forEach((inst, index) => {
              installmentNameMapping[index + 1] = inst.name;
              installmentNameMapping[inst.name] = inst.name;
            });
          });

          const paymentMap = new Map();
          paidInstallments.forEach((pi) => {
            if (!pi.feesTypeId?._id) return;

            const installmentName = installmentNameMapping[pi.installmentNumber] || pi.installmentNumber;
            const key = `${installmentName}-${pi.receiptNumber}-${pi.paymentDate}`;

            if (!paymentMap.has(key)) {
              const totalPayable = feeInstallments
                .filter((fi) => fi.installmentName === installmentName)
                .reduce((sum, fi) => sum + (Number(fi.amount) || 0) + (Number(fi.fineAmount) || 0), 0);

              paymentMap.set(key, {
                installmentName,
                receiptNumber: pi.receiptNumber,
                paymentDate: pi.paymentDate,
                paymentMode: pi.paymentMode,
                totalPayable: totalPayable || 0,
                totalPaid: 0,
                totalFinePaid: 0,
                totalExcessPaid: 0,
                transactionNumber: pi.transactionNumber || "",
              });
            }

            const payment = paymentMap.get(key);
            payment.totalPaid += Number(pi.paidAmount || 0);
            payment.totalFinePaid += Number(pi.paidFine || 0);
            payment.totalExcessPaid += Number(pi.excessAmount || 0);
          });

          if (!installmentGroups[academicYear]) {
            installmentGroups[academicYear] = {};
          }

          feeInstallments.forEach((installment) => {
            if (!installment.feesTypeId?._id) return;

            const dueDate = new Date(installment.dueDate);
            const dueMonthStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);
            if (dueMonthStart > new Date()) return;

            const installmentName = installment.installmentName;
            if (!installmentGroups[academicYear][installmentName]) {
              installmentGroups[academicYear][installmentName] = {
                transactions: [],
                balance: 0,
              };
            }

            const group = installmentGroups[academicYear][installmentName];

            if (installment.amount > 0) {
              group.balance += installment.amount;
              group.transactions.push({
                academicYear,
                date: dueDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, "-"),
                particulars: `Fees Due - ${installmentName}`,
                receiptNo: "",
                paymentMode: "",
                due: installment.amount.toFixed(0),
                receipt: "",
                balance: group.balance.toFixed(0),
                paymentDateRaw: dueDate,
                dueDate: dueDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, "-"),
                installment: installmentName,
                tuitionFeesDue: installment.amount.toFixed(0),
                examFeesDue: "0",
                totalFeesDue: installment.amount.toFixed(0),
                concessionType: concessionForm?.concessionType || "",
                tuitionFeesConcession: installment.concessionAmount || "0",
                examFeesConcession: "0",
                totalConcession: installment.concessionAmount || "0",
              });
            }

            if (installment.fineAmount > 0) {
              group.balance += installment.fineAmount;
              group.transactions.push({
                academicYear,
                date: dueDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).replace(/\//g, "-"),
                particulars: "Fine",
                receiptNo: "",
                paymentMode: "",
                due: installment.fineAmount.toFixed(0),
                receipt: "",
                balance: group.balance.toFixed(0),
                paymentDateRaw: dueDate,
                finePaid: installment.fineAmount.toFixed(0),
              });
            }
          });

          paymentMap.forEach((payment) => {
            const installmentName = payment.installmentName;
            if (!installmentGroups[academicYear][installmentName]) {
              installmentGroups[academicYear][installmentName] = {
                transactions: [],
                balance: 0,
              };
            }

            const group = installmentGroups[academicYear][installmentName];
            const paymentDate = new Date(payment.paymentDate);
            const formattedDate = paymentDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-");

            if (payment.totalFinePaid > 0) {
              group.balance += Number(payment.totalFinePaid);
              group.transactions.push({
                academicYear,
                date: formattedDate,
                particulars: "Fine",
                receiptNo: payment.receiptNumber,
                paymentMode: payment.paymentMode,
                due: payment.totalFinePaid.toFixed(0),
                receipt: "",
                balance: group.balance.toFixed(0),
                paymentDateRaw: formattedDate,
                finePaid: payment.totalFinePaid.toFixed(0),
              });
            }

            if (payment.totalExcessPaid > 0) {
              group.balance += Number(payment.totalExcessPaid);
              group.transactions.push({
                academicYear,
                date: formattedDate,
                particulars: "Excess Amount",
                receiptNo: payment.receiptNumber,
                paymentMode: payment.paymentMode,
                due: payment.totalExcessPaid.toFixed(0),
                receipt: "",
                balance: group.balance.toFixed(0),
                paymentDateRaw: paymentDate,
                excessAmtPaid: payment.totalExcessPaid.toFixed(0),
              });
            }

            if (payment.totalPaid > 0 || payment.totalFinePaid > 0 || payment.totalExcessPaid > 0) {
              const totalreceipt = Number(payment.totalPaid) + Number(payment.totalFinePaid) + Number(payment.totalExcessPaid);
              group.balance -= totalreceipt;
              group.transactions.push({
                academicYear,
                date: formattedDate,
                particulars: `Fees Received - ${installmentName}`,
                receiptNo: payment.receiptNumber,
                paymentMode: payment.paymentMode,
                due: "",
                receipt: totalreceipt.toFixed(0),
                balance: group.balance.toFixed(0),
                paymentDateRaw: paymentDate,
                tuitionFeesPaid: payment.totalPaid.toFixed(0),
                examFeesPaid: "0",
                totalFeesPaid: totalreceipt.toFixed(0),
                schoolFeesDate: formattedDate,
                schoolFeesReceiptNo: payment.receiptNumber,
                schoolFeesPaymentMode: payment.paymentMode,
                schoolFeesTransactionNo: payment.transactionNumber,
              });
            }
          });

          yearSpecificData.feeInstallments = feeInstallments;
          yearSpecificData.finePolicy = fineData;
          yearSpecificData.concession = concessionForm;
          yearSpecificData.paidInstallments = paidInstallments;
          yearSpecificData.installmentsPresent = Array.from(new Set(feeInstallments.map((item) => item.installmentName))).sort();
        }

        if (!result[academicYear]) result[academicYear] = [];
        result[academicYear].push(yearSpecificData);
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: "No fee data found for any students in the school" });
    }

    res.status(200).json({
      data: result,
      admissionDetails,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getAllFeesInstallmentsWithConcession;