import mongoose from 'mongoose';
import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

export const getFeesStructureReport = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }


    const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classMap = classAndSections.reduce((acc, item) => {
      acc[item._id.toString()] = item.className;
      return acc;
    }, {});
    const sectionMap = classAndSections.reduce((acc, item) => {
      item.sections.forEach((section) => {
        acc[section._id.toString()] = section.name;
      });
      return acc;
    }, {});


    const feeTypes = await FeesType.find({ schoolId, academicYear }).lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    const allFeeTypes = feeTypes.map((type) => type.feesTypeName).sort();

  
    const feesStructures = await FeesStructure.find({ schoolId, academicYear }).lean();
    const schoolFeesData = feesStructures.flatMap((structure) => {
      const className = classMap[structure.classId.toString()] || structure.classId.toString();
      return structure.installments.flatMap((installment) =>
        structure.sectionIds.flatMap((sectionId) => {
          const sectionName = sectionMap[sectionId.toString()] || sectionId.toString();
          return installment.fees.map((fee) => ({
            className,
            sectionName,
            groupOfFees: 'School Fees',
            installment: installment.name,
            feeTypeName: feeTypeMap[fee.feesTypeId.toString()] || fee.feesTypeId.toString(),
            amount: fee.amount || 0,
          }));
        })
      );
    });

  
    const oneTimeFees = await OneTimeFees.find({ schoolId, academicYear }).lean();
    const oneTimeFeesData = oneTimeFees.flatMap((otf) => {
      const className = classMap[otf.classId.toString()] || otf.classId.toString();
      return otf.sectionIds.flatMap((sectionId) => {
        const sectionName = sectionMap[sectionId.toString()] || sectionId.toString();
        return otf.oneTimeFees.map((fee) => ({
          className,
          sectionName,
          groupOfFees: 'One Time Fees',
          installment: '-',
          feeTypeName: feeTypeMap[fee.feesTypeId.toString()] || fee.feesTypeId.toString(),
          amount: fee.amount || 0,
        }));
      });
    });


    const result = [...schoolFeesData, ...oneTimeFeesData];

    if (!result.length) {
      return res.status(404).json({ message: 'No fee structure data found for the given academic year' });
    }

   
    const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
      value: name,
      label: name,
    }));
    const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
      value: name,
      label: name,
    }));

    res.status(200).json({
      data: result,
      feeTypes: allFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
      },
    });
  } catch (error) {
    console.error('Error fetching fees structure report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getFeesStructureReport;