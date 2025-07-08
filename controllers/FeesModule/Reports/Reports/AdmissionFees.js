import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

export const getAllAdmissionFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: "schoolId and academicYear are required" });
    }


    // const admissionDataList = await AdmissionForm.find({ schoolId, academicYear }).lean();
    // if (!admissionDataList.length) {
    //   return res.status(404).json({ message: "No admission data found for the specified academic year" });
    // }

     const admissionDataList = await AdmissionForm.find({ 
      schoolId, 
      academicYear,
      paymentMode: { $ne: 'null' } 
    }).lean();
    if (!admissionDataList.length) {
      return res.status(404).json({ message: "No admission data found for the specified academic year" });
    }

  
    const classDataList = await ClassAndSection.find({ schoolId, academicYear }).lean();


    const classMap = new Map(classDataList.map(cls => [cls._id.toString(), cls.className]));
    const sectionMap = new Map();
    classDataList.forEach(cls => {
      cls.sections.forEach(sec => {
        sectionMap.set(sec._id.toString(), { className: cls.className, sectionName: sec.name });
      });
    });

    const admissionDetails = admissionDataList.map(admission => {
      const historyEntry = admission.academicHistory.find(
        entry => entry.academicYear === academicYear
      );

      const classId = historyEntry?.masterDefineClass?.toString();
      const sectionId = historyEntry?.section?.toString();

      let className = "-";
      let sectionName = "-";

      if (sectionId && sectionMap.has(sectionId)) {
        const sectionInfo = sectionMap.get(sectionId);
        className = sectionInfo.className || "-";
        sectionName = sectionInfo.sectionName || "-";
      } else if (classId && classMap.has(classId)) {
        className = classMap.get(classId) || "-";
      }

      return {
        academicYear,
        className,
        sectionName,
        student: {
          admissionNo: admission.AdmissionNumber || "-",
          studentName: `${admission.firstName} ${admission.lastName}`.trim() || "-",
          admFeesDate: admission.paymentDate
            ? new Date(admission.paymentDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).replace(/\//g, "-")
            : "-",
          admFeesPaymentMode: admission.paymentMode || "-",
          admFeesDue: admission.admissionFees?.toString() || "0",
          admFeesConcession: admission.concessionAmount?.toString() || "0",
          admFeesPaid: admission.finalAmount?.toString() || "0",
          admFeesTransactionNo: admission.transactionNumber || "-",
          admFeesReceiptNo: admission.receiptNumber || "-",
        },
      };
    });

    res.status(200).json({
      data: admissionDetails,
    });
  } catch (error) {
    console.error("Error fetching admission fees data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getAllAdmissionFees;