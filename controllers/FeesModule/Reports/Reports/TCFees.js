import TCForm from '../../../../models/FeesModule/TCForm.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import MasterDefineShift from '../../../../models/FeesModule/MasterDefineShift.js';

const getCurrentAcademicYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  return currentMonth >= 3
    ? `${currentYear}-${currentYear + 1}`
    : `${currentYear - 1}-${currentYear}`;
};

export const getAllTCFees = async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) {
      return res.status(400).json({ message: 'schoolId is required' });
    }

    const tcDataList = await TCForm.find({ schoolId }).lean();
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
      studentMap.set(key, {
        admissionData: admission,
        academicHistory: admission.academicHistory || [],
        admissionNumber: admission.AdmissionNumber || '-',
        registrationNumber: admission.registrationNumber || '-',
      });
    }

    for (const registration of registrationDataList) {
      const key = getStudentKey(registration);
      const existing = studentMap.get(key) || {};
      studentMap.set(key, {
        ...existing,
        registrationData: registration,
        academicHistory: existing.academicHistory || (registration.academicYear ? [{ academicYear: registration.academicYear, masterDefineClass: registration.masterDefineClass, section: registration.section, masterDefineShift: registration.masterDefineShift }] : []),
        admissionNumber: existing.admissionNumber || '-',
        registrationNumber: registration.registrationNumber || '-',
      });
    }

    for (const tc of tcDataList) {
      const admissionNumber = tc.AdmissionNumber || '-';
      const studentKey = Array.from(studentMap.entries()).find(([_, data]) => data.admissionNumber === admissionNumber)?.[0];
      if (studentKey) {
        const existing = studentMap.get(studentKey) || {};
        studentMap.set(studentKey, {
          ...existing,
          tcData: tc,
          admissionNumber: admissionNumber,
        });
      } else {
        studentMap.set(`tc_${admissionNumber}`, {
          tcData: tc,
          admissionNumber: admissionNumber,
          registrationNumber: '-',
          academicHistory: tc.academicYear ? [{ academicYear: tc.academicYear }] : [],
        });
      }
    }

    if (studentMap.size === 0) {
      return res.status(404).json({ message: 'No student or TC data found for the school' });
    }

    const result = {};
    const tcDetails = [];

    for (const [studentKey, { admissionData, registrationData, tcData, academicHistory, admissionNumber, registrationNumber }] of studentMap) {
      if (!tcData) continue;

      const studentName = `${registrationData?.firstName || admissionData?.firstName || ''} ${registrationData?.lastName || admissionData?.lastName || ''}`.trim() || '-';

      tcDetails.push({
        firstName: registrationData?.firstName || admissionData?.firstName || '-',
        lastName: registrationData?.lastName || admissionData?.lastName || '-',
        AdmissionNumber: admissionNumber,
        registrationNumber: registrationNumber,
        academicYear: tcData?.academicYear || getCurrentAcademicYear(),
        tcFeesDate: tcData?.paymentDate
          ? new Date(tcData.paymentDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\//g, '-')
          : '-',
        tcFeesPaymentMode: tcData?.paymentMode || '-',
        tcFeesDue: tcData?.TCfees || '0',
        tcFeesConcession: tcData?.concessionAmount || '0',
        tcFeesPaid: tcData?.finalAmount || '0',
        tcFeesTransactionNo: tcData?.chequeNumber || tcData?.transactionNumber || '-',
        tcFeesReceiptNo: tcData?.receiptNumber || '-',
        tcNo: tcData?.certificateNumber || '-',
      });

      const academicYears = [
        ...(academicHistory.length ? [...new Set(academicHistory.map(h => h.academicYear))] : []),
        ...(registrationData?.academicYear && !academicHistory.some(h => h.academicYear === registrationData.academicYear) ? [registrationData.academicYear] : []),
        ...(tcData?.academicYear && !academicHistory.some(h => h.academicYear === tcData.academicYear) ? [tcData.academicYear] : []),
      ].filter((year, index, self) => self.indexOf(year) === index);

      if (!academicYears.length) {
        const defaultYear = getCurrentAcademicYear();
        academicYears.push(defaultYear);
      }

      for (const academicYear of academicYears) {
        const history = academicHistory.find(h => h.academicYear === academicYear) || {};
        const classId = admissionData?.masterDefineClass || registrationData?.masterDefineClass || history.masterDefineClass || null;
        const sectionId = admissionData?.section || history.section || null;
        const shiftId = admissionData?.masterDefineShift || registrationData?.masterDefineShift || history.masterDefineShift || null;

        const studentData = {
          admissionNo: admissionNumber,
          regNo: registrationNumber,
          studentName,
          tcNo: academicYear === tcData?.academicYear ? tcData?.certificateNumber || '-' : '-',
          tcFeesDate: academicYear === tcData?.academicYear && tcData?.paymentDate
            ? new Date(tcData.paymentDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).replace(/\//g, '-')
            : '-',
          tcFeesPaymentMode: academicYear === tcData?.academicYear ? tcData?.paymentMode || '-' : '-',
          tcFeesDue: academicYear === tcData?.academicYear ? tcData?.TCfees || '0' : '0',
          tcFeesConcession: academicYear === tcData?.academicYear ? tcData?.concessionAmount || '0' : '0',
          tcFeesPaid: academicYear === tcData?.academicYear ? tcData?.finalAmount || '0' : '0',
          tcFeesTransactionNo: academicYear === tcData?.academicYear ? (tcData?.chequeNumber || tcData?.transactionNumber || '-') : '-',
          tcFeesReceiptNo: academicYear === tcData?.academicYear ? tcData?.receiptNumber || '-' : '-',
        };

        const yearSpecificData = {
          academicYear,
          classId,
          sectionId,
          shiftId,
          className: '-',
          sectionName: '-',
          shiftName: '-',
          student: studentData,
        };

        if (classId && sectionId) {
          const classData = await ClassAndSection.findOne({
            schoolId,
            academicYear,
            'sections._id': sectionId,
          }).lean();
          if (classData) {
            yearSpecificData.className = classData.className || '-';
            const sectionInfo = classData.sections.find(s => s._id.toString() === sectionId.toString());
            yearSpecificData.sectionName = sectionInfo?.name || '-';
          }
        } else if (classId) {
          const classData = await ClassAndSection.findOne({
            schoolId,
            academicYear,
            _id: classId,
          }).lean();
          yearSpecificData.className = classData?.className || '-';
        }

        if (shiftId) {
          const shiftData = await MasterDefineShift.findOne({
            _id: shiftId,
            schoolId,
            academicYear,
          }).lean();
          yearSpecificData.shiftName = shiftData?.masterDefineShiftName || '-';
        }

        if (!result[academicYear]) result[academicYear] = [];
        result[academicYear].push(yearSpecificData);
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: 'No TC fee data found for any students in the school' });
    }

    res.status(200).json({
      data: result,
      tcDetails,
    });
  } catch (error) {
    console.error('Error fetching TC fees data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default getAllTCFees;