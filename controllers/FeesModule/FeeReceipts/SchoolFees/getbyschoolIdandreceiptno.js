
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js'; 
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js'; 
import FeesType from '../../../../models/FeesModule/FeesType.js'; 




const getSchoolFeesData = async (req, res) => {
try {
    const { schoolId, receiptNumber } = req.params;


    if (!schoolId || !receiptNumber) {
      return res.status(400).json({ message: 'schoolId and receiptNumber are required' });
    }

  
    const schoolFees = await SchoolFees.findOne({ schoolId, receiptNumber })
      .lean()
      .exec();

    if (!schoolFees) {
      return res.status(404).json({ message: 'School fees record not found' });
    }

  
    const classAndSection = await ClassAndSection.findOne({
      _id: schoolFees.className, 
      schoolId,
      'sections._id': schoolFees.section, 
      academicYear: schoolFees.academicYear,
    })
      .select('_id className sections')
      .lean()
      .exec();

    let classId = 'Unknown';
    let className = 'Unknown';
    let sectionId = 'Unknown';
    let sectionName = 'Unknown';

    if (classAndSection) {
      classId = classAndSection._id.toString();
      className = classAndSection.className;
      const section = classAndSection.sections.find((sec) =>
        sec._id.equals(schoolFees.section)
      );
      if (section) {
        sectionId = section._id.toString();
        sectionName = section.name;
      }
    }


    const feeTypeIds = schoolFees.installments
      .flatMap((installment) => installment.feeItems.map((item) => item.feeTypeId))
      .filter((id) => id); 

    const feesTypes = await FeesType.find({
      _id: { $in: feeTypeIds },
      schoolId,
      academicYear: schoolFees.academicYear,
    })
      .select('_id feesTypeName')
      .lean()
      .exec();


    const feeTypeMap = feesTypes.reduce((map, feeType) => {
      map[feeType._id.toString()] = feeType.feesTypeName;
      return map;
    }, {});

   
    const transformedInstallments = schoolFees.installments.map((installment) => ({
      ...installment,
      feeItems: installment.feeItems.map((feeItem) => ({
        ...feeItem,
        feeTypeId: feeItem.feeTypeId,
        feeTypeName: feeTypeMap[feeItem.feeTypeId.toString()] || 'Unknown',
      })),
    }));

    const response = {
      ...schoolFees,
      installments: transformedInstallments,
      classId,
      className,
      sectionId,
      sectionName,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching school fees:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export default getSchoolFeesData;