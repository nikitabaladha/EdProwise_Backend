import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';

export const getStudentWiseFees = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const schoolIdString = schoolId.trim();


    const feesTypes = await FeesType.find({ academicYear, schoolId: schoolIdString }).lean();
    const feeTypeMap = feesTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});

    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
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


    const feesStructures = await FeesStructure.find({ schoolId: schoolIdString, academicYear }).lean();
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
          academicYear,
          studentAdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'studentAdmissionNumber',
          foreignField: 'AdmissionNumber',
          as: 'admissionData',
        },
      },
      {
        $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$admissionData.academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        }
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: '$installments',
      },
      {
        $unwind: '$installments.feeItems',
      },
      {
        $group: {
          _id: {
            admissionNumber: '$studentAdmissionNumber',
            studentName: '$studentName',
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: '$installments.installmentName',
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            feeTypeId: '$installments.feeItems.feeTypeId',
          },
          totalPaid: { $sum: '$installments.feeItems.paid' },
          totalConcession: { $sum: '$installments.feeItems.concession' },
        },
      },
      {
        $group: {
          _id: {
            admissionNumber: '$_id.admissionNumber',
            studentName: '$_id.studentName',
            className: '$_id.className',
            sectionName: '$_id.sectionName',
            installmentName: '$_id.installmentName',
            paymentMode: '$_id.paymentMode',
            receiptNumber: '$_id.receiptNumber',
            paymentDate: '$_id.paymentDate',
          },
          feeTypes: {
            $push: {
              feeTypeId: '$_id.feeTypeId',
              totalPaid: '$totalPaid',
              totalConcession: '$totalConcession',
            },
          },
          totalConcession: { $sum: '$totalConcession' },
        },
      },
    ]);


    const admissionFeesAggregation = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          admissionFees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        }
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
          },
          feeTypes: [
            {
              feeTypeId: 'Admission Fees',
              totalPaid: '$admissionFees',
              totalConcession: '$concessionAmount',
            },
          ],
          totalConcession: '$concessionAmount',
        },
      },
    ]);


    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          registrationFee: { $gt: 0 },
          registrationNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'registrationNumber',
          foreignField: 'registrationNumber',
          as: 'admissionRecord',
        },
      },
      {
        $match: {
          'admissionRecord.0': { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            registrationNumber: '$registrationNumber',
            admissionNumber: '$admissionRecord.0.AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: null,
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
          },
          feeTypes: [
            {
              feeTypeId: 'Registration Fees',
              totalPaid: '$registrationFee',
              totalConcession: '$concessionAmount',
            },
          ],
          totalConcession: '$concessionAmount',
        },
      },
    ]);

   
    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          TCfees: { $gt: 0 },
          AdmissionNumber: { $ne: null, $ne: '' },
        },
      },
      {
        $lookup: {
          from: 'admissionforms',
          localField: 'AdmissionNumber',
          foreignField: 'AdmissionNumber',
          as: 'admissionData',
        },
      },
      {
        $unwind: { path: '$admissionData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          academicHistory: {
            $filter: {
              input: '$admissionData.academicHistory',
              as: 'history',
              cond: { $eq: ['$$history.academicYear', academicYear] }
            }
          }
        }
      },
      {
        $unwind: { path: '$academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'classandsections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classandsections',
          let: { sectionId: '$academicHistory.section' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$sectionId', '$sections._id']
                }
              }
            },
            {
              $project: {
                sections: {
                  $filter: {
                    input: '$sections',
                    as: 'section',
                    cond: { $eq: ['$$section._id', '$$sectionId'] }
                  }
                }
              }
            }
          ],
          as: 'sectionData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$sectionData.sections', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: {
            admissionNumber: '$AdmissionNumber',
            studentName: { $concat: ['$firstName', ' ', { $ifNull: ['$middleName', ''] }, ' ', '$lastName'] },
            className: '$classData.className',
            sectionName: '$sectionData.sections.name',
            installmentName: null,
            paymentMode: '$paymentMode',
            receiptNumber: '$receiptNumber',
            paymentDate: { $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' } },
          },
          feeTypes: [
            {
              feeTypeId: 'TC Fees',
              totalPaid: '$TCfees',
              totalConcession: '$concessionAmount',
            },
          ],
          totalConcession: '$concessionAmount',
        },
      },
    ]);

  
    const combinedData = [
      ...schoolFeesAggregation.map((item) => {
        const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
        const totalConcession = item.totalConcession || 0;
        const netPaid = grossPaid - totalConcession;
        return {
          admissionNumber: item._id.admissionNumber || '-',
          registrationNumber: '-',
          studentName: item._id.studentName || '-',
          className: item._id.className || '-',
          sectionName: item._id.sectionName || '-',
          installmentName: item._id.installmentName || '-',
          paymentMode: item._id.paymentMode || '-',
          receiptNumber: item._id.receiptNumber || '-',
          paymentDate: item._id.paymentDate || '-',
          feeTypes: item.feeTypes.reduce((acc, fee) => {
            const feeTypeName = feeTypeMap[fee.feeTypeId] || fee.feeTypeId;
            const netFeePaid = fee.totalPaid - (fee.totalConcession || 0);
            acc[feeTypeName] = {
              totalPaid: netFeePaid,
              totalConcession: fee.totalConcession || 0,
            };
            return acc;
          }, {}),
          totalPaid: netPaid,
          totalConcession: totalConcession,
        };
      }),
      ...admissionFeesAggregation.map((item) => {
        const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
        const totalConcession = item.totalConcession || 0;
        const netPaid = grossPaid - totalConcession;
        return {
          admissionNumber: item._id.admissionNumber || '-',
          registrationNumber: '-',
          studentName: item._id.studentName || '-',
          className: item._id.className || '-',
          sectionName: item._id.sectionName || '-',
          installmentName: item._id.installmentName || '-',
          paymentMode: item._id.paymentMode || '-',
          receiptNumber: item._id.receiptNumber || '-',
          paymentDate: item._id.paymentDate || '-',
          feeTypes: item.feeTypes.reduce((acc, fee) => {
            const netFeePaid = fee.totalPaid - (fee.totalConcession || 0);
            acc[fee.feeTypeId] = {
              totalPaid: netFeePaid,
              totalConcession: fee.totalConcession || 0,
            };
            return acc;
          }, {}),
          totalPaid: netPaid,
          totalConcession: totalConcession,
        };
      }),
      ...registrationFeesAggregation.map((item) => {
        const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
        const totalConcession = item.totalConcession || 0;
        const netPaid = grossPaid - totalConcession;
        return {
          admissionNumber: item._id.admissionNumber || '-',
          registrationNumber: item._id.registrationNumber || '-',
          studentName: item._id.studentName || '-',
          className: item._id.className || '-',
          sectionName: item._id.sectionName || '-',
          installmentName: item._id.installmentName || '-',
          paymentMode: item._id.paymentMode || '-',
          receiptNumber: item._id.receiptNumber || '-',
          paymentDate: item._id.paymentDate || '-',
          feeTypes: item.feeTypes.reduce((acc, fee) => {
            const netFeePaid = fee.totalPaid - (fee.totalConcession || 0);
            acc[fee.feeTypeId] = {
              totalPaid: netFeePaid,
              totalConcession: fee.totalConcession || 0,
            };
            return acc;
          }, {}),
          totalPaid: netPaid,
          totalConcession: totalConcession,
        };
      }),
      ...tcFeesAggregation.map((item) => {
        const grossPaid = item.feeTypes.reduce((sum, fee) => sum + fee.totalPaid, 0);
        const totalConcession = item.totalConcession || 0;
        const netPaid = grossPaid - totalConcession;
        return {
          admissionNumber: item._id.admissionNumber || '-',
          registrationNumber: '-',
          studentName: item._id.studentName || '-',
          className: item._id.className || '-',
          sectionName: item._id.sectionName || '-',
          installmentName: item._id.installmentName || '-',
          paymentMode: item._id.paymentMode || '-',
          receiptNumber: item._id.receiptNumber || '-',
          paymentDate: item._id.paymentDate || '-',
          feeTypes: item.feeTypes.reduce((acc, fee) => {
            const netFeePaid = fee.totalPaid - (fee.totalConcession || 0);
            acc[fee.feeTypeId] = {
              totalPaid: netFeePaid,
              totalConcession: fee.totalConcession || 0,
            };
            return acc;
          }, {}),
          totalPaid: netPaid,
          totalConcession: totalConcession,
        };
      }),
    ].filter((item) => (item.admissionNumber && item.admissionNumber !== '-') || (item.registrationNumber && item.registrationNumber !== '-'));

    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.admissionNumber}_${item.paymentDate}_${item.receiptNumber}`;
      if (!acc[key]) {
        acc[key] = {
          paymentDate: item.paymentDate,
          admissionNumber: item.admissionNumber,
          studentName: item.studentName,
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
          paymentMode: item.paymentMode,
          receiptNumber: item.receiptNumber,
          feeTypes: { ...item.feeTypes },
          totalPaid: item.totalPaid,
          totalConcession: item.totalConcession,
        };
      } else {
        Object.entries(item.feeTypes).forEach(([feeType, amounts]) => {
          acc[key].feeTypes[feeType] = {
            totalPaid: (acc[key].feeTypes[feeType]?.totalPaid || 0) + amounts.totalPaid,
            totalConcession: (acc[key].feeTypes[feeType]?.totalConcession || 0) + amounts.totalConcession,
          };
        });
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

    const feeTypeOptions = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].map((type) => ({
      value: type,
      label: type,
    }));

    const uniqueFeeTypes = [...new Set(combinedData.flatMap((item) => Object.keys(item.feeTypes)))].sort();

    res.status(200).json({
      data: result,
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
        academicYearOptions: feesStructures
          .map((fs) => fs.academicYear)
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort()
          .map((year) => ({
            value: year,
            label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
          })),
      },
    });
  } catch (error) {
    console.error('Error fetching student-wise fees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default getStudentWiseFees;