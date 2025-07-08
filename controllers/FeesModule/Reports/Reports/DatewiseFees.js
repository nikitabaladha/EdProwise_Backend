import mongoose from 'mongoose';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js'; 
import TCForm from '../../../../models/FeesModule/TCForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js'; 
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';

export const getTotalPaidFeeTypes = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }


    
    const schoolIdString = schoolId.trim();


    const feeTypes = await FeesType.find({ academicYear, schoolId: schoolIdString });
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName; 
      return acc;
    }, {});


    const academicYears = await FeesStructure.distinct('academicYear', { schoolId: schoolIdString });
    const academicYearOptions = academicYears
      .sort((a, b) => a.localeCompare(b))
      .map((year) => ({
        value: year,
        label: year.split('-').length === 2 ? `${year.split('-')[0]}-${year.split('-')[1].slice(-2)}` : year,
      }));


    const classResponse = await ClassAndSection.find({ schoolId: schoolIdString }).lean();
    const classOptions = [...new Set(classResponse.map((cls) => cls.className))].map((cls) => ({
      value: cls,
      label: cls,
    }));
    const sectionOptions = [...new Set(classResponse.map((cls) => cls.sectionName).filter((sec) => sec))].map((sec) => ({
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
        $unwind: { path: '$admissionData.academicHistory', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'admissionData.academicHistory.academicYear': academicYear,
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'admissionData.academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'admissionData.academicHistory.section',
          foreignField: '_id',
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
        $unwind: '$installments',
      },
      {
        $unwind: '$installments.feeItems',
      },
      {
        $group: {
          _id: {
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            paymentMode: '$paymentMode',
            feeTypeId: '$installments.feeItems.feeTypeId',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
            installmentName: '$installments.installmentName',
          },
          totalPaid: { $sum: '$installments.feeItems.paid' },
        },
      },
    ]);

   
    const admissionFeesAggregation = await AdmissionForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          admissionFees: { $gt: 0 },
        },
      },
      {
        $unwind: '$academicHistory',
      },
      {
        $match: {
          'academicHistory.academicYear': academicYear,
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'academicHistory.masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'academicHistory.section',
          foreignField: '_id',
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
        $group: {
          _id: {
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: '$sectionData.sectionName',
          },
          totalPaid: { $sum: '$admissionFees' },
        },
      },
      {
        $addFields: {
          feeTypeId: 'Admission Fees',
          installmentName: null,
        },
      },
    ]);


    const registrationFeesAggregation = await StudentRegistration.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          registrationFee: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
          },
          totalPaid: { $sum: '$registrationFee' },
        },
      },
      {
        $addFields: {
          feeTypeId: 'Registration Fees',
          installmentName: null,
        },
      },
    ]);


    const tcFeesAggregation = await TCForm.aggregate([
      {
        $match: {
          schoolId: schoolIdString,
          academicYear,
          TCfees: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'classAndSections',
          localField: 'masterDefineClass',
          foreignField: '_id',
          as: 'classData',
        },
      },
      {
        $unwind: { path: '$classData', preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: {
            paymentDate: {
              $dateToString: { format: '%d-%m-%Y', date: '$paymentDate' },
            },
            paymentMode: '$paymentMode',
            className: '$classData.className',
            sectionName: null,
          },
          totalPaid: { $sum: '$TCfees' },
        },
      },
      {
        $addFields: {
          feeTypeId: 'TC Fees',
          installmentName: null,
        },
      },
    ]);


    const combinedData = [
      ...schoolFeesAggregation.map((item) => ({
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item._id.feeTypeId.toString(),
        feeTypeName: feeTypeMap[item._id.feeTypeId.toString()] || item._id.feeTypeId, 
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item._id.installmentName || null,
        totalPaid: item.totalPaid,
      })),
      ...admissionFeesAggregation.map((item) => ({
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
      })),
      ...registrationFeesAggregation.map((item) => ({
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
      })),
      ...tcFeesAggregation.map((item) => ({
        paymentDate: item._id.paymentDate,
        paymentMode: item._id.paymentMode,
        feeTypeId: item.feeTypeId,
        feeTypeName: item.feeTypeId,
        className: item._id.className || null,
        sectionName: item._id.sectionName || null,
        installmentName: item.installmentName,
        totalPaid: item.totalPaid,
      })),
    ];

    // Group by paymentDate and paymentMode
    const groupedData = combinedData.reduce((acc, item) => {
      const key = `${item.paymentDate}_${item.paymentMode}`;
      if (!acc[key]) {
        acc[key] = {
          paymentDate: item.paymentDate,
          paymentMode: item.paymentMode,
          feeTypes: {},
          className: item.className,
          sectionName: item.sectionName,
          installmentName: item.installmentName,
        };
      }
      acc[key].feeTypes[item.feeTypeName] = (acc[key].feeTypes[item.feeTypeName] || 0) + item.totalPaid;
      return acc;
    }, {});

    // Convert grouped data to array and sort by paymentDate
    const result = Object.values(groupedData).sort((a, b) => {
      const dateA = new Date(a.paymentDate.split('-').reverse().join('-'));
      const dateB = new Date(b.paymentDate.split('-').reverse().join('-'));
      return dateA - dateB;
    });

    // Payment mode options
    const paymentModeOptions = [...new Set(combinedData.map((item) => item.paymentMode).filter(Boolean))].map((mode) => ({
      value: mode,
      label: mode,
    }));

    // Fee type options (including Viva if present)
    const feeTypeOptions = [...new Set(combinedData.map((item) => item.feeTypeName))].map((type) => ({
      value: type,
      label: type,
    }));

    // Unique fee types for table headers
    const uniqueFeeTypes = [...new Set(combinedData.map((item) => item.feeTypeName))].sort();

    res.status(200).json({
      data: result,
      feeTypes: uniqueFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions,
        paymentModeOptions,
        academicYearOptions,
      },
    });
  } catch (error) {
    console.error('Error fetching total paid fee types:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getTotalPaidFeeTypes;