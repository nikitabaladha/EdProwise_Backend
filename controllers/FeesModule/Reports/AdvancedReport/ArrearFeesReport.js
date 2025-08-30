import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

export const ArrearFeesReport = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();
    const paymentAcademicYear = academicYear.trim();

    const [startYear, endYear] = paymentAcademicYear.split('-');
    if (!startYear || !endYear || isNaN(startYear) || isNaN(endYear)) {
      return res.status(400).json({
        message: 'Invalid academic year format. Use YYYY-YYYY',
      });
    }

    const currentFeesManagementYear = await FeesManagementYear.findOne({
      schoolId: schoolIdString,
      academicYear: paymentAcademicYear,
    }).lean();

    const reportStartDate = currentFeesManagementYear?.startDate
      ? new Date(currentFeesManagementYear.startDate)
      : new Date(`${startYear}-03-31T18:30:00.000Z`);
    const reportEndDate = currentFeesManagementYear?.endDate
      ? new Date(currentFeesManagementYear.endDate)
      : new Date(`${endYear}-03-30T18:30:00.000Z`);

    const allFeesManagementYears = await FeesManagementYear.find({
      schoolId: schoolIdString,
      academicYear: { $lte: paymentAcademicYear },
    }).lean();

    const academicYearEndDateMap = allFeesManagementYears.reduce((acc, year) => {
      acc[year.academicYear] = year.endDate ? new Date(year.endDate) : new Date(`${year.academicYear.split('-')[1]}-03-30T18:30:00.000Z`);
      return acc;
    }, {});

    const feesStructures = await FeesStructure.find({
      schoolId: schoolIdString,
      academicYear: { $lte: paymentAcademicYear },
    }).lean();
    const academicYears = [...new Set(feesStructures.map((fs) => fs.academicYear))].sort();

    const feesTypes = await FeesType.find({
      schoolId: schoolIdString,
      academicYear: { $in: academicYears },
      feesTypeName: { $nin: ['Admission Fee', 'Registration Fees', 'TC Fees'] },
    }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    const uniqueFeeTypes = [...new Set(feesTypes.map((type) => type.feesTypeName))].sort();

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classMap = classResponse.reduce((acc, cls) => {
      acc[cls._id.toString()] = cls.className;
      return acc;
    }, {});
    const sectionMap = classResponse.reduce((acc, cls) => {
      cls.sections.forEach((sec) => {
        acc[sec._id.toString()] = sec.name;
      });
      return acc;
    }, {});

    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [...new Set(classResponse.flatMap((cls) =>
      cls.sections.map((sec) => sec.name)
    ).filter(Boolean))].map((sec) => ({
      value: sec,
      label: sec,
    }));

    const installmentOptions = [
      ...new Set(feesStructures.flatMap((fs) => fs.installments.map((inst) => inst.name))),
    ].map((inst) => ({
      value: inst,
      label: inst,
    }));

    const schoolFeesAggregation = await SchoolFees.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear: { $lte: paymentAcademicYear },
          paymentDate: { $gte: reportStartDate, $lte: reportEndDate },
          studentAdmissionNumber: { $ne: null, $ne: '' },
          status: 'Paid',
          installments: { $exists: true, $ne: [] },
        },
      },
      {
        $addFields: {
          isArrear: {
            $cond: {
              if: {
                $gt: [
                  '$paymentDate',
                  {
                    $let: {
                      vars: { endDate: { $arrayElemAt: [Object.values(academicYearEndDateMap), { $indexOfArray: [Object.keys(academicYearEndDateMap), '$academicYear'] }] } },
                      in: '$$endDate',
                    },
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          isArrear: true,
        },
      },
      {
        $unwind: '$installments',
      },
      {
        $match: {
          'installments.feeItems': { $exists: true, $ne: [] },
          'installments.installmentName': { $exists: true, $ne: '' },
        },
      },
      {
        $unwind: '$installments.feeItems',
      },
      {
        $match: {
          'installments.feeItems.feeTypeId': { $in: Object.keys(feeTypeMap).map(id => id) },
          'installments.feeItems.paid': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            classId: '$className',
            sectionId: '$section',
            originalAcademicYear: '$academicYear',
            installmentName: '$installments.installmentName',
            paymentMode: '$paymentMode',
            transactionNumber: '$transactionNumber',
            receiptNumber: '$receiptNumber',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            feeTypeId: '$installments.feeItems.feeTypeId',
          },
          totalAmount: { $sum: '$installments.feeItems.amount' },
          totalPaid: { $sum: '$installments.feeItems.paid' },
          totalConcession: { $sum: '$installments.feeItems.concession' },
          fineAmount: { $sum: '$installments.fineAmount' },
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$_id.admissionNumber',
            studentName: '$_id.studentName',
            classId: '$_id.classId',
            sectionId: '$_id.sectionId',
            originalAcademicYear: '$_id.originalAcademicYear',
            installmentName: '$_id.installmentName',
            paymentMode: '$_id.paymentMode',
            transactionNumber: '$_id.transactionNumber',
            receiptNumber: '$_id.receiptNumber',
            paymentDate: '$_id.paymentDate',
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalAmount: '$totalAmount',
              totalPaid: '$totalPaid',
              totalConcession: '$totalConcession',
            },
          },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$totalPaid' },
          totalConcession: { $sum: '$totalConcession' },
          fineAmount: { $sum: '$fineAmount' },
        },
      },
    ]);

    const combinedData = schoolFeesAggregation.map((item) => {
      const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
      const totalConcession = item.totalConcession || 0;
      const totalAmount = item.totalAmount || 0;
      const totalDue = totalAmount;
      const netCollection = grossPaid - totalConcession;

      return {
        admissionNumber: item._id.admissionNumber || '-',
        studentName: item._id.studentName || '-',
        className: classMap[item._id.classId] || '-',
        sectionName: sectionMap[item._id.sectionId] || '-',
        academicYear: item._id.originalAcademicYear || '-',
        installmentName: item._id.installmentName || '-',
        paymentMode: item._id.paymentMode || '-',
        transactionNumber: item._id.transactionNumber || '-',
        receiptNumber: item._id.receiptNumber || '-',
        paymentDate: item._id.paymentDate || '-',
        feeTypes: item.feeTypes.reduce((acc, fee) => {
          const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
          acc[feeTypeName] = {
            totalAmount: fee.totalAmount,
            totalPaid: fee.totalPaid,
            totalConcession: fee.totalConcession || 0,
          };
          return acc;
        }, {}),
        totalDue: totalDue,
        totalPaid: netCollection,
        totalConcession: totalConcession,
      };
    }).filter((item) => item.admissionNumber && item.admissionNumber !== '-');

    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}_${item.academicYear}_${item.installmentName}`;
      if (!acc[key]) {
        acc[key] = {
          paymentDate: item.paymentDate,
          academicYear: item.academicYear,
          admissionNumber: item.admissionNumber,
          studentName: item.studentName,
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          paymentMode: item.paymentMode,
          transactionNumber: item.transactionNumber,
          receiptNumber: item.receiptNumber,
          feeTypes: { ...item.feeTypes },
          totalDue: item.totalDue,
          totalPaid: item.totalPaid,
          totalConcession: item.totalConcession,
        };
      } else {
        Object.entries(item.feeTypes).forEach(([feeType, amounts]) => {
          acc[key].feeTypes[feeType] = {
            totalAmount: (acc[key].feeTypes[feeType]?.totalAmount || 0) + amounts.totalAmount,
            totalPaid: (acc[key].feeTypes[feeType]?.totalPaid || 0) + amounts.totalPaid,
            totalConcession: (acc[key].feeTypes[feeType]?.totalConcession || 0) + amounts.totalConcession,
          };
        });
        acc[key].totalDue += item.totalDue;
        acc[key].totalPaid += item.totalPaid;
        acc[key].totalConcession += item.totalConcession;
      }
      return acc;
    }, {});

    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
      const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
      return dateA - dateB;
    });

    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
      value: mode,
      label: mode,
    }));

    const feeTypeOptions = uniqueFeeTypes.map((type) => ({
      value: type,
      label: type,
    }));

    res.status(200).json({
      data: result.length > 0 ? result : [],
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default ArrearFeesReport;