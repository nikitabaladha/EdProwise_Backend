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

export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId) {
      return res.status(400).json({
        message: "schoolId is required",
      });
    }

    const admissionDataList = await AdmissionForm.find({ schoolId }).lean();
    if (!admissionDataList || admissionDataList.length === 0) {
      return res.status(404).json({ message: "No admission data found for the school" });
    }

    const result = [];
    const processedStudents = new Set();
    for (const admissionData of admissionDataList) {
      const admissionNumber = admissionData.AdmissionNumber;
      if (processedStudents.has(admissionNumber)) continue; 
      processedStudents.add(admissionNumber);

      const academicHistory = admissionData.academicHistory || [];
      if (!academicHistory.length) continue;

      const selectedHistory = academicYear
        ? academicHistory.find((h) => h.academicYear === academicYear)
        : academicHistory.sort((a, b) => b.academicYear.localeCompare(a.academicYear))[0];

      if (!selectedHistory) continue;

      const { academicYear: selectedAcademicYear, masterDefineClass, section, masterDefineShift } = selectedHistory;

      const registrationData = await StudentRegistration.findOne({
        schoolId,
        registrationNumber: admissionData.registrationNumber,
      }).lean();

      
      console.log(`Registration data for student with registrationNumber ${admissionData.registrationNumber}:`, registrationData);

      const studentData = {
        admissionNo: admissionData.AdmissionNumber || "N/A",
        studentName: `${admissionData.firstName || ""} ${admissionData.lastName || ""}`.trim() || "N/A",
        regNo: admissionData.registrationNumber || "N/A",
        dateOfBirth: admissionData.dateOfBirth
          ? new Date(admissionData.dateOfBirth).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "N/A",
        age: admissionData.age || "N/A",
        nationality: admissionData.nationality || "N/A",
        gender: admissionData.gender || "N/A",
        bloodGroup: admissionData.bloodGroup || "N/A",
        currentAddress: admissionData.currentAddress || "N/A",
        state: admissionData.state || "N/A",
        pincode: admissionData.pincode || "N/A",
        parentContactNo: admissionData.fatherContactNo || admissionData.parentContactNumber || "N/A",
        motherTongue: admissionData.motherTongue || "N/A",
        previousSchool: admissionData.previousSchoolName || "N/A",
        previousSchoolBoard: admissionData.previousSchoolBoard || "N/A",
        aadharPassportNo: admissionData.aadharPassportNumber || "N/A",
        category: admissionData.studentCategory || "N/A",
        relationTypeWithSibling: admissionData.relationType || "N/A",
        siblingName: admissionData.siblingName || "N/A",
        parentalStatus: admissionData.parentalStatus || "N/A",
        fatherName: admissionData.fatherName || "N/A",
        fatherMobileNo: admissionData.fatherContactNo || "N/A",
        fatherQualification: admissionData.fatherQualification || "N/A",
        motherName: admissionData.motherName || "N/A",
        motherMobileNo: admissionData.motherContactNo || "N/A",
        motherQualification: admissionData.motherQualification || "N/A",
        fatherProfession: admissionData.fatherProfession || "N/A",
        motherProfession: admissionData.motherProfession || "N/A",
        status: admissionData.status || "N/A",
        admFeesDate: admissionData.paymentDate
          ? new Date(admissionData.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "N/A",
        admFeesReceiptNo: admissionData.receiptNumber || "N/A",
        admFeesPaymentMode: admissionData.paymentMode || "N/A",
        admFeesTransactionNo: admissionData.transactionNumber || "N/A",
        admFeesDue: admissionData.admissionFees || "0",
        admFeesConcession: admissionData.concessionAmount || "0",
        admFeesPaid: admissionData.finalAmount || "0",
        regFeesDate:registrationData?.registrationDate 
           ? new Date(registrationData?.registrationDate ).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "N/A",
        regFeesPaymentMode:registrationData?.paymentMode || "N/A",
        regFeesDue: registrationData?.registrationFee || "0",
        regFeesConcession: registrationData?.concessionAmount || "0",
        regFeesPaid: registrationData?.finalAmount || "0",
        regFeesChequeNumber: registrationData?.chequeNumber || "N/A",
        regFeesBankName: registrationData?.bankName || "N/A",
        regFeesTransactionNo: registrationData?.transactionNumber || "N/A",
        regFeesReceiptNo: registrationData?.receiptNumber || "N/A",
        tcNo: null,
        tcFeesDate: null,
        tcFeesReceiptNo: null,
        tcFeesPaymentMode: null,
        tcFeesTransactionNo: null,
        tcFeesDue: "0",
        tcFeesConcession: "0",
        tcFeesPaid: "0",
        boardExamFeesDate: null,
        boardExamFeesReceiptNo: null,
        boardExamFeesPaymentMode: null,
        boardExamFeesTransactionNo: null,
        boardExamFeesDue: "0",
        boardExamFeesConcession: "0",
        boardExamFeesPaid: "0",
        boardRegFeesDate: null,
        boardRegFeesReceiptNo: null,
        boardRegFeesPaymentMode: null,
        boardRegFeesTransactionNo: null,
        boardRegFeesDue: "0",
        boardRegFeesConcession: "0",
        boardRegFeesPaid: "0",
      };

      const tcData = await TCForm.findOne({
        schoolId,
        AdmissionNumber: admissionData.AdmissionNumber,
        academicYear: selectedAcademicYear,
      }).lean();
      if (tcData) {
        studentData.tcNo = tcData.certificateNumber || admissionData.tcCertificate || "N/A";
        studentData.tcFeesDate = tcData.paymentDate
          ? new Date(tcData.paymentDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, "-")
          : "N/A";
        studentData.tcFeesReceiptNo = tcData.receiptNumber || "N/A";
        studentData.tcFeesPaymentMode = tcData.paymentMode || "N/A";
        studentData.tcFeesTransactionNo = tcData.transactionNumber || "N/A";
        studentData.tcFeesDue = tcData.TCfees || "0";
        studentData.tcFeesConcession = tcData.concessionAmount || "0";
        studentData.tcFeesPaid = tcData.finalAmount || "0";
      }

      const boardExam = await BoardExamFee.findOne({
        schoolId,
        academicYear: selectedAcademicYear,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
      }).lean();
      if (boardExam) {
        studentData.boardExamFeesDue = boardExam.amount || "0";
        const boardExamFeesPayment = await BoardExamFeePayment.findOne({
          schoolId,
          admissionNumber: admissionData.AdmissionNumber,
          academicYear: selectedAcademicYear,
        }).lean();
        if (boardExamFeesPayment) {
          studentData.boardExamFeesDate = boardExamFeesPayment.paymentDate
            ? new Date(boardExamFeesPayment.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "N/A";
          studentData.boardExamFeesReceiptNo = boardExamFeesPayment.receiptNumberBef || "N/A";
          studentData.boardExamFeesPaymentMode = boardExamFeesPayment.paymentMode || "N/A";
          studentData.boardExamFeesTransactionNo =
            boardExamFeesPayment.chequeNumber || boardExamFeesPayment.transactionId || "N/A";
          studentData.boardExamFeesConcession = "0";
          studentData.boardExamFeesPaid =
            boardExamFeesPayment.status === "Paid" ? boardExamFeesPayment.amount || "0" : "0";
          studentData.boardExamFeesDue = boardExamFeesPayment.amount || "0";
        }
      }

      const boardReg = await BoardRegistrationFee.findOne({
        schoolId,
        academicYear: selectedAcademicYear,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
      }).lean();
      if (boardReg) {
        studentData.boardRegFeesDue = boardReg.amount || "0";
        const boardRegFeesPayment = await BoardRegistrationFeePayment.findOne({
          schoolId,
          admissionNumber: admissionData.AdmissionNumber,
          academicYear: selectedAcademicYear,
        }).lean();
        if (boardRegFeesPayment) {
          studentData.boardRegFeesDate = boardRegFeesPayment.paymentDate
            ? new Date(boardRegFeesPayment.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "N/A";
          studentData.boardRegFeesReceiptNo = boardRegFeesPayment.receiptNumberBrf || "N/A";
          studentData.boardRegFeesPaymentMode = boardRegFeesPayment.paymentMode || "N/A";
          studentData.boardRegFeesTransactionNo =
            boardRegFeesPayment.chequeNumber || boardRegFeesPayment.transactionId || "N/A";
          studentData.boardRegFeesConcession = "0";
          studentData.boardRegFeesPaid =
            boardRegFeesPayment.status === "Paid" ? boardRegFeesPayment.amount || "0" : "0";
          studentData.boardRegFeesDue = boardRegFeesPayment.amount || "0";
        }
      }

      const classData = await ClassAndSection.findOne({
        schoolId,
        academicYear: selectedAcademicYear,
        "sections._id": section,
      }).lean();
      const classInfo = classData ? { className: classData.className } : { className: "N/A" };
      const sectionInfo = classData?.sections?.find((s) => s._id.toString() === section.toString()) || {
        name: "N/A",
      };

      const shiftData = await MasterDefineShift.findOne({
        _id: masterDefineShift,
        schoolId,
        academicYear: selectedAcademicYear,
      }).lean();
      const shiftInfo = shiftData ? { shiftName: shiftData.masterDefineShiftName } : { shiftName: "N/A" };

      studentData.class = classInfo.className;
      studentData.section = sectionInfo.name;
      studentData.shift = shiftInfo.shiftName;

      const feeTypes = await FeesType.find({ schoolId, academicYear: selectedAcademicYear }).lean();
      const feeTypeMap = feeTypes.reduce((acc, type) => {
        acc[type._id.toString()] = type.feesTypeName || type.name;
        return acc;
      }, {});

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear: selectedAcademicYear,
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        schoolId,
        AdmissionNumber: admissionData.AdmissionNumber,
        academicYear: selectedAcademicYear,
      }).lean();
      const fineData = await Fine.findOne({ schoolId, academicYear: selectedAcademicYear }).lean();
      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionData.AdmissionNumber,
        academicYear: selectedAcademicYear,
      }).lean();

      let totalFeesAmount = parseFloat(registrationData?.registrationFee || 0);
      let totalConcession = parseFloat(registrationData?.concessionAmount || 0);
      let totalFine = 0;
      let totalFeesPayable = parseFloat(registrationData?.finalAmount || 0);
      let totalPaidAmount = parseFloat(registrationData?.finalAmount || 0);
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

      if (!installmentGroups[selectedAcademicYear]) {
        installmentGroups[selectedAcademicYear] = {};
      }

      feeInstallments.forEach((installment) => {
        if (!installment.feesTypeId?._id) return;

        const dueDate = new Date(installment.dueDate);
        const dueMonthStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);
        if (dueMonthStart > new Date()) return;

        const installmentName = installment.installmentName;
        if (!installmentGroups[selectedAcademicYear][installmentName]) {
          installmentGroups[selectedAcademicYear][installmentName] = {
            transactions: [],
            balance: 0,
          };
        }

        const group = installmentGroups[selectedAcademicYear][installmentName];

        if (installment.amount > 0) {
          group.balance += installment.amount;
          group.transactions.push({
            academicYear: selectedAcademicYear,
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
            academicYear: selectedAcademicYear,
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
        if (!installmentGroups[selectedAcademicYear][installmentName]) {
          installmentGroups[selectedAcademicYear][installmentName] = {
            transactions: [],
            balance: 0,
          };
        }

        const group = installmentGroups[selectedAcademicYear][installmentName];
        const paymentDate = new Date(payment.paymentDate);
        const formattedDate = paymentDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).replace(/\//g, "-");

        if (payment.totalFinePaid > 0) {
          group.balance += Number(payment.totalFinePaid);
          group.transactions.push({
            academicYear: selectedAcademicYear,
            date: formattedDate,
            particulars: "Fine",
            receiptNo: payment.receiptNumber,
            paymentMode: payment.paymentMode,
            debit: payment.totalFinePaid.toFixed(0),
            credit: "",
            balance: group.balance.toFixed(0),
            paymentDateRaw: formattedDate,
            finePaid: payment.totalFinePaid.toFixed(0),
          });
        }

        if (payment.totalExcessPaid > 0) {
          group.balance += Number(payment.totalExcessPaid);
          group.transactions.push({
            academicYear: selectedAcademicYear,
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
            academicYear: selectedAcademicYear,
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

      Object.keys(installmentGroups[selectedAcademicYear])
        .sort((a, b) => {
          const dueDateA = feeInstallments.find((fi) => fi.installmentName === a)?.dueDate;
          const dueDateB = feeInstallments.find((fi) => fi.installmentName === b)?.dueDate;
          return new Date(dueDateA || dueDateB || 0) - new Date(dueDateB || dueDateA || 0);
        })
        .forEach((installmentName) => {
          const group = installmentGroups[selectedAcademicYear][installmentName];
          group.transactions.sort((a, b) => {
            const typeOrder = {
              "Fees Due": 1,
              "Fine": 2,
              "Excess Amount": 3,
              "Fees Received": 4,
            };
            const typeA = a.particulars.includes("Fees Due")
              ? "Fees Due"
              : a.particulars.includes("Fine")
              ? "Fine"
              : a.particulars.includes("Excess Amount")
              ? "Excess Amount"
              : "Fees Received";
            const typeB = b.particulars.includes("Fees Due")
              ? "Fees Due"
              : b.particulars.includes("Fine")
              ? "Fine"
              : b.particulars.includes("Excess Amount")
              ? "Excess Amount"
              : "Fees Received";
            if (typeA !== typeB) return typeOrder[typeA] - typeOrder[typeB];
            return (a.paymentDateRaw || new Date()) - (b.paymentDateRaw || new Date());
          });
        });

      result.push({
        academicYear: selectedAcademicYear,
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
      return res.status(404).json({ message: "No fee data found for any students in the school" });
    }

    res.status(200).json({
      data: result,
      admissionDetails: admissionDataList.map((admission) => ({
        firstName: admission.firstName,
        lastName: admission.lastName,
        AdmissionNumber: admission.AdmissionNumber,
      })),
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllFeesInstallmentsWithConcession;