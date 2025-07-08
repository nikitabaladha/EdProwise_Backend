
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import Fine from "../../../../models/FeesModule/Fine.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import BoardExamFee from "../../../../models/FeesModule/BoardExamFee.js";
import BoardExamFeePayment from "../../../../models/FeesModule/BoardExamFeePayment.js";
import BoardRegistrationFee from "../../../../models/FeesModule/BoardRegistrationFees.js";
import BoardRegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";
import TCForm from "../../../../models/FeesModule/TCForm.js";
import MasterDefineShift from "../../../../models/FeesModule/MasterDefineShift.js";

export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  try {
    const { schoolId, admissionNumber } = req.query;
    if (!schoolId || !admissionNumber) {
      return res.status(400).json({
        message: "schoolId and admissionNumber are required",
      });
    }

    const admissionData = await AdmissionForm.findOne({
      AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
      schoolId,
    }).lean();
    if (!admissionData) {
      return res.status(404).json({ message: "Admission data not found" });
    }

    const academicHistory = admissionData.academicHistory || [];
    if (!academicHistory.length) {
      return res.status(404).json({ message: "No academic history found for the student" });
    }

    const result = [];

    for (const history of academicHistory) {
      const { academicYear, masterDefineClass, section, masterDefineShift } = history;

      // Initialize studentData for this academic year
      const studentData = {
        admissionNo: admissionData.AdmissionNumber,
        studentName: `${admissionData.firstName || ""} ${admissionData.lastName || ""}`.trim(),
        regNo: admissionData.registrationNumber,
        dateOfBirth: admissionData.dateOfBirth,
        age: admissionData.age,
        nationality: admissionData.nationality,
        gender: admissionData.gender,
        bloodGroup: admissionData.bloodGroup,
        currentAddress: admissionData.currentAddress,
        state: admissionData.state,
        pincode: admissionData.pincode,
        parentContactNo: admissionData.fatherContactNo,
        motherTongue: admissionData.motherTongue,
        previousSchool: admissionData.previousSchoolName,
        previousSchoolBoard: admissionData.previousSchoolBoard,
        aadharPassportNo: admissionData.aadharPassportNumber,
        category: admissionData.studentCategory,
        relationTypeWithSibling: admissionData.relationType,
        siblingName: admissionData.siblingName,
        parentalStatus: admissionData.parentalStatus,
        fatherName: admissionData.fatherName,
        fatherMobileNo: admissionData.fatherContactNo,
        fatherQualification: admissionData.fatherQualification,
        motherName: admissionData.motherName,
        motherMobileNo: admissionData.motherContactNo,
        motherQualification: admissionData.motherQualification,
        fatherProfession: admissionData.fatherProfession,
        motherProfession: admissionData.motherProfession,
        status: admissionData.status,
        regFeesDate: admissionData.paymentDate,
        regFeesReceiptNo: admissionData.receiptNumber,
        regFeesPaymentMode: admissionData.paymentMode,
        regFeesTransactionNo: admissionData.transactionNumber,
        regFeesDue: admissionData.admissionFees,
        regFeesConcession: admissionData.concessionAmount,
        regFeesPaid: admissionData.finalAmount,
        admFeesDate: admissionData.paymentDate,
        admFeesReceiptNo: admissionData.receiptNumber,
        admFeesPaymentMode: admissionData.paymentMode,
        admFeesTransactionNo: admissionData.transactionNumber,
        admFeesDue: admissionData.admissionFees,
        admFeesConcession: admissionData.concessionAmount,
        admFeesPaid: admissionData.finalAmount,
        tcNo: null,
        tcFeesDate: null,
        tcFeesReceiptNo: null,
        tcFeesPaymentMode: null,
        tcFeesTransactionNo: null,
        tcFeesDue: 0,
        tcFeesConcession: 0,
        tcFeesPaid: 0,
        boardExamFeesDate: null,
        boardExamFeesReceiptNo: null,
        boardExamFeesPaymentMode: null,
        boardExamFeesTransactionNo: null,
        boardExamFeesDue: 0,
        boardExamFeesConcession: 0,
        boardExamFeesPaid: 0,
        boardRegFeesDate: null,
        boardRegFeesReceiptNo: null,
        boardRegFeesPaymentMode: null,
        boardRegFeesTransactionNo: null,
        boardRegFeesDue: 0,
        boardRegFeesConcession: 0,
        boardRegFeesPaid: 0,
      };


      const tcData = await TCForm.findOne({
        schoolId,
        AdmissionNumber: admissionData.AdmissionNumber,
        academicYear,
      }).lean();
      if (tcData) {
        studentData.tcNo = tcData.certificateNumber || admissionData.tcCertificate;
        studentData.tcFeesDate = tcData.paymentDate;
        studentData.tcFeesReceiptNo = tcData.receiptNumber;
        studentData.tcFeesPaymentMode = tcData.paymentMode;
        studentData.tcFeesTransactionNo = tcData.transactionNumber;
        studentData.tcFeesDue = tcData.TCfees || 0;
        studentData.tcFeesConcession = tcData.concessionAmount || 0;
        studentData.tcFeesPaid = tcData.finalAmount || 0;
      }

      const boardExam = await BoardExamFee.findOne({
        schoolId,
        academicYear,
        classId: history.masterDefineClass,
        sectionIds: { $in: [history.section] },
      }).lean();

      if (boardExam) {
        studentData.boardExamFeesDue = boardExam.amount || 0;
        const boardExamFeesPayment = await BoardExamFeePayment.findOne({
          schoolId,
          admissionNumber: admissionData.AdmissionNumber,
          academicYear,
        }).lean();
        if (boardExamFeesPayment) {
          studentData.boardExamFeesDue = boardExamFeesPayment.amount || 0;
        }
      }

   const boardExamFees = await BoardExamFeePayment.findOne({
  schoolId,
  admissionNumber: admissionData.AdmissionNumber,
  academicYear,
}).lean();

if (boardExamFees) {
  studentData.boardExamFeesDate = boardExamFees.paymentDate;
  studentData.boardExamFeesReceiptNo = boardExamFees.receiptNumberBef;
  studentData.boardExamFeesPaymentMode = boardExamFees.paymentMode;
  studentData.boardExamFeesTransactionNo = boardExamFees.chequeNumber || boardExamFees.transactionId;
  studentData.boardExamFeesConcession = 0;
  studentData.boardExamFeesPaid = boardExamFees.status === "Paid" ? boardExamFees.amount : 0;
}

      const boardReg = await BoardRegistrationFee.findOne({
        schoolId,
        academicYear,
        classId: history.masterDefineClass,
        sectionIds: { $in: [history.section] },
      }).lean();

      if (boardReg) {
        studentData.boardRegFeesDue = boardReg.amount || 0;
        const boardRegFeesPayment = await BoardRegistrationFeePayment.findOne({
          schoolId,
          admissionNumber: admissionData.AdmissionNumber,
          academicYear,
        }).lean();
        if (boardRegFeesPayment) {
          studentData.boardRegFeesDue = boardRegFeesPayment.amount || 0;
        }
      }
      const boardRegFees = await BoardRegistrationFeePayment.findOne({
        schoolId,
        admissionNumber: admissionData.AdmissionNumber,
        academicYear,
      }).lean();
      if (boardRegFees) {
        studentData.boardRegFeesDate = boardRegFees.paymentDate;
        studentData.boardRegFeesReceiptNo = boardRegFees.receiptNumberBrf;
        studentData.boardRegFeesPaymentMode = boardRegFees.paymentMode;
        studentData.boardRegFeesTransactionNo = boardRegFees.chequeNumber || boardRegFees.transactionId;
         studentData.boardRegFeesConcession = 0;
        studentData.boardRegFeesConcession = 0;
        studentData.boardRegFeesPaid = boardRegFees.status === "Paid" ? boardRegFees.amount : 0;
      }

      const classData = await ClassAndSection.findOne({
        schoolId,
        academicYear,
        "sections._id": section,
      }).lean();
      const classInfo = classData ? { className: classData.className } : { className: "N/A" };
      const sectionInfo = classData?.sections?.find((s) => s._id.toString() === section.toString()) || {
        name: "N/A",
      };

      const shiftData = await MasterDefineShift.findOne({
        _id: masterDefineShift,
        schoolId,
        academicYear,
      }).lean();
      const shiftInfo = shiftData ? { shiftName: shiftData.masterDefineShiftName } : { shiftName: "N/A" };

      studentData.class = classInfo.className;
      studentData.section = sectionInfo.name;
      studentData.shift = shiftInfo.shiftName;

      const feeTypes = await FeesType.find({ schoolId, academicYear }).lean();
      const feeTypeMap = feeTypes.reduce((acc, type) => {
        acc[type._id.toString()] = type.feesTypeName || type.name;
        return acc;
      }, {});

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear,
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        schoolId,
        AdmissionNumber: admissionData.AdmissionNumber,
        academicYear,
      }).lean();
      const fineData = await Fine.findOne({ schoolId, academicYear }).lean();
      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionData.AdmissionNumber,
        academicYear,
      }).lean();

      let totalFeesAmount = 0;
      let totalConcession = 0;
      let totalFine = 0;
      let totalFeesPayable = 0;
      let totalPaidAmount = 0;
      let totalRemainingAmount = 0;
      const feeInstallments = [];
      const paidInstallments = [];
      let hasUnpaidFees = false;
      const cumulativePaidMap = {};
      const installmentGroups = {};

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
            if (balanceAmount > 0) {
              hasUnpaidFees = true;
            }

            totalFeesAmount += feeAmount;
            totalConcession += concessionAmount;
            totalFine += fineAmount;
            totalFeesPayable += balanceAmount;
            totalPaidAmount += paidAmount;
            totalRemainingAmount += balanceAmount;

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
            debit: installment.amount.toFixed(0),
            credit: "",
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
            tuitionFeesConcession: installment.concessionAmount.toFixed(0),
            examFeesConcession: "0",
            totalConcession: installment.concessionAmount.toFixed(0),
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
            debit: installment.fineAmount.toFixed(0),
            credit: "",
            balance: group.balance.toFixed(0),
            paymentDateRaw: dueDate,
            finePaid: installment.fineAmount.toFixed(0),
          });
        }
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
          });
        }

        const payment = paymentMap.get(key);
        payment.totalPaid += Number(pi.paidAmount || 0);
        payment.totalFinePaid += Number(pi.paidFine || 0);
        payment.totalExcessPaid += Number(pi.excessAmount || 0);
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
            debit: payment.totalFinePaid.toFixed(0),
            credit: "",
            balance: group.balance.toFixed(0),
            paymentDateRaw: paymentDate,
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
            debit: payment.totalExcessPaid.toFixed(0),
            credit: "",
            balance: group.balance.toFixed(0),
            paymentDateRaw: paymentDate,
            excessAmtPaid: payment.totalExcessPaid.toFixed(0),
          });
        }

        if (payment.totalPaid > 0 || payment.totalFinePaid > 0 || payment.totalExcessPaid > 0) {
          const totalCredit = Number(payment.totalPaid) + Number(payment.totalFinePaid) + Number(payment.totalExcessPaid);
          group.balance -= totalCredit;
          group.transactions.push({
            academicYear,
            date: formattedDate,
            particulars: `Fees Received - ${installmentName}`,
            receiptNo: payment.receiptNumber,
            paymentMode: payment.paymentMode,
            debit: "",
            credit: totalCredit.toFixed(0),
            balance: group.balance.toFixed(0),
            paymentDateRaw: paymentDate,
            tuitionFeesPaid: payment.totalPaid.toFixed(0),
            examFeesPaid: "0",
            totalFeesPaid: totalCredit.toFixed(0),
            schoolFeesDate: formattedDate,
            schoolFeesReceiptNo: payment.receiptNumber,
            schoolFeesPaymentMode: payment.paymentMode,
            schoolFeesTransactionNo: payment.transactionNumber,
          });
        }
      });

      Object.keys(installmentGroups[academicYear])
        .sort((a, b) => {
          const dueDateA = feeInstallments.find((fi) => fi.installmentName === a)?.dueDate;
          const dueDateB = feeInstallments.find((fi) => fi.installmentName === b)?.dueDate;
          return new Date(dueDateA || 0) - new Date(dueDateB || 0);
        })
        .forEach((installmentName) => {
          const group = installmentGroups[academicYear][installmentName];
        });

      result.push({
        academicYear,
        classId: masterDefineClass,
        sectionId: section,
        className: classInfo.className,
        sectionName: sectionInfo.name,
        shiftName: shiftInfo.shiftName,
        feeInstallments,
        finePolicy: fineData || null,
        concession: concessionForm || null,
        paidInstallments,
        totals: {
          totalFeesAmount,
          totalConcession,
          totalFine,
          totalFeesPayable,
          totalPaidAmount,
          totalRemainingAmount,
        },
        installmentsPresent: Array.from(new Set(feeInstallments.map((item) => item.installmentName))).sort(),
        student: studentData,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No fee data found for any academic year" });
    }

    res.status(200).json({
      data: result,
      admissionDetails: {
        firstName: admissionData?.firstName,
        lastName: admissionData?.lastName,
        AdmissionNumber: admissionData?.AdmissionNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllFeesInstallmentsWithConcession;
