// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
// import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';
// import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
// const getAllEmployeeItDeclarations = async (req, res) => {
//   console.log('Reached getAllEmployeeItDeclarations controller');
//   try {
//     const { schoolId } = req.params;
//     const { academicYear = '2025-26' } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId or academicYear'
//       });
//     }

//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];

//     // Determine ongoing and previous month
//     const currentDate = new Date();
//     const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//     const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
//     const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
//     const ongoingMonth = monthOrder[fiscalMonthIndex];
//     const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

//     // Fetch all IT declarations for the school and academic year
//     let declarations = await ItDeclaration.find({ schoolId, academicYear })
//       .lean()
//       .select('-__v');

//     // If no declarations exist, return empty array
//     if (!declarations || declarations.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//         message: 'No IT declarations found for the specified school and academic year'
//       });
//     }

//     for (let declaration of declarations) {
//       let hraExemptionProofSubmitted = 0;
//       let rentDetailStatus = "Pending";

//       let rentDetails = monthOrder.map(month => ({
//         month,
//         declaredRent: 0,
//         cityType: '',
//         landlordName: '',
//         landlordPanNumber: '',
//         landlordAddress: '',
//         rentReceipt: null,
//         monthStatus: 'Pending'
//       }));

//       const rentDetail = await EmployeeRentDetail.findOne({
//         schoolId,
//         employeeId: declaration.employeeId,
//         academicYear
//       }).lean();

//       if (rentDetail && rentDetail.rentDetails) {

//         hraExemptionProofSubmitted = rentDetail.hraExemption;
//         rentDetailStatus = rentDetail.status;

//         if (rentDetail && rentDetail.rentDetails) {
//           hraExemptionProofSubmitted = rentDetail.hraExemption || 0;
//           rentDetailStatus = rentDetail.status || 'Pending';
//           // Merge fetched rent details with default structure
//           const existingMonths = rentDetail.rentDetails.reduce((acc, detail) => {
//             acc[detail.month] = {
//               month: detail.month,
//               declaredRent: detail.declaredRent || 0,
//               cityType: detail.cityType || '',
//               landlordName: detail.landlordName || '',
//               landlordPanNumber: detail.landlordPanNumber || '',
//               landlordAddress: detail.landlordAddress || '',
//               rentReceipt: detail.rentReceipt || null,
//               monthStatus: detail.monthStatus || 'Pending'
//             };
//             return acc;
//           }, {});
//           rentDetails = monthOrder.map(month => existingMonths[month] || {
//             month,
//             declaredRent: 0,
//             cityType: '',
//             landlordName: '',
//             landlordPanNumber: '',
//             landlordAddress: '',
//             rentReceipt: null,
//             monthStatus: 'Pending'
//           });
//         }
//         declaration.hraExemption = {
//           proofSubmitted: hraExemptionProofSubmitted,
//           status: rentDetailStatus,
//           rentDetailsId: rentDetail?._id || null,
//           rentDetails
//         };
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: declarations,
//       totalRecords: declarations.length,
//       message: 'All IT declarations fetched successfully'
//     });

//   } catch (error) {
//     console.error('Error fetching all IT declarations:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default getAllEmployeeItDeclarations;

// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
// import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';
// import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
// const getAllEmployeeItDeclarations = async (req, res) => {
//   console.log('Reached getAllEmployeeItDeclarations controller');
//   try {
//     const { schoolId } = req.params;
//     const { academicYear = '2025-26' } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId or academicYear'
//       });
//     }

//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];

//     // Determine ongoing and previous month
//     const currentDate = new Date();
//     const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//     const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
//     const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
//     const ongoingMonth = monthOrder[fiscalMonthIndex];
//     const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

//     // Fetch all IT declarations with populated references
//     let declarations = await ItDeclaration.find({ schoolId, academicYear })
//       .populate('otherExemption.ltaExemption.ltaDetailsId') // Populate LTA details
//       .populate('otherExemption.telephoneAllowance.telephoneAllowanceDetailsId') // Populate Telephone Allowance
//       .populate('otherExemption.internetAllowance.internetAllowanceDetailsId') // Populate Internet Allowance
//       .lean()
//       .select('-__v');

//     // If no declarations exist, return empty array
//     if (!declarations || declarations.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//         message: 'No IT declarations found for the specified school and academic year'
//       });
//     }

//     for (let declaration of declarations) {
//       // Handle HRA Exemption
//       let hraExemptionProofSubmitted = 0;
//       let rentDetailStatus = 'Pending';
//       let rentDetails = monthOrder.map(month => ({
//         month,
//         declaredRent: 0,
//         cityType: '',
//         landlordName: '',
//         landlordPanNumber: '',
//         landlordAddress: '',
//         rentReceipt: null,
//         monthStatus: 'Pending'
//       }));

//       const rentDetail = await EmployeeRentDetail.findOne({
//         schoolId,
//         employeeId: declaration.employeeId,
//         academicYear
//       }).lean();

//       if (rentDetail && rentDetail.rentDetails) {
//         hraExemptionProofSubmitted = rentDetail.hraExemption || 0;
//         rentDetailStatus = rentDetail.status || 'Pending';
//         const existingMonths = rentDetail.rentDetails.reduce((acc, detail) => {
//           acc[detail.month] = {
//             month: detail.month,
//             declaredRent: detail.declaredRent || 0,
//             cityType: detail.cityType || '',
//             landlordName: detail.landlordName || '',
//             landlordPanNumber: detail.landlordPanNumber || '',
//             landlordAddress: detail.landlordAddress || '',
//             rentReceipt: detail.rentReceipt || null,
//             monthStatus: detail.monthStatus || 'Pending'
//           };
//           return acc;
//         }, {});
//         rentDetails = monthOrder.map(month => existingMonths[month] || {
//           month,
//           declaredRent: 0,
//           cityType: '',
//           landlordName: '',
//           landlordPanNumber: '',
//           landlordAddress: '',
//           rentReceipt: null,
//           monthStatus: 'Pending'
//         });
//       }

//       declaration.hraExemption = {
//         proofSubmitted: hraExemptionProofSubmitted,
//         status: rentDetailStatus,
//         rentDetailsId: rentDetail?._id || null,
//         rentDetails
//       };

//       // Handle LTA Exemption
//       const ltaDetail = declaration.otherExemption.ltaExemption.ltaDetailsId;
//       declaration.otherExemption.ltaExemption = {
//         proofSubmitted: ltaDetail?.proofSubmitted || 0,
//         status: ltaDetail?.status || 'Pending',
//         ltaDetailsId: ltaDetail?._id || null,
//         ltaDetails: ltaDetail?.ltaDetails || [] 
//       };

//       // Handle Telephone Allowance
//       const telephoneDetail = declaration.otherExemption.telephoneAllowance.telephoneAllowanceDetailsId;
//       declaration.otherExemption.telephoneAllowance = {
//         proofSubmitted: telephoneDetail?.proofSubmitted || 0,
//         status: telephoneDetail?.status || 'Pending',
//         telephoneAllowanceDetailsId: telephoneDetail?._id || null,
//         telephoneAllowanceDetails: telephoneDetail?.telephoneAllowanceDetails || [] ,
//       };

//       // Handle Internet Allowance
//       const internetDetail = declaration.otherExemption.internetAllowance.internetAllowanceDetailsId;
//       declaration.otherExemption.internetAllowance = {
//         proofSubmitted: internetDetail?.proofSubmitted || 0,
//         status: internetDetail?.status || 'Pending',
//         internetAllowanceDetailsId: internetDetail?._id || null,
//         internetAllowanceDetails: internetDetail?.internetAllowanceDetails || [] ,
//       };
//     }

//     res.status(200).json({
//       success: true,
//       data: declarations,
//       totalRecords: declarations.length,
//       message: 'All IT declarations fetched successfully'
//     });
//   } catch (error) {
//     console.error('Error fetching all IT declarations:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };
// export default getAllEmployeeItDeclarations;

import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';
import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
import EmployeeRegistration from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
const getAllEmployeeItDeclarations = async (req, res) => {
  console.log('Reached getAllEmployeeItDeclarations controller');
  try {
    const { schoolId, academicYear } = req.params;
    // const { academicYear  } = req.query;
console.log(schoolId);
console.log(academicYear);


    if (!schoolId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId or academicYear'
      });
    }

    const monthOrder = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];

    // Determine ongoing and previous month
    const currentDate = new Date();
    const fiscalYearStart = parseInt(academicYear.split('-')[0]);
    const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
    const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
    const ongoingMonth = monthOrder[fiscalMonthIndex];
    const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

    // Fetch all IT declarations
    let declarations = await ItDeclaration.find({ schoolId, academicYear })
      .lean()
      .select('-__v');

    // If no declarations exist, return empty array
    if (!declarations || declarations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No IT declarations found for the specified school and academic year'
      });
    }

    for (let declaration of declarations) {
     let employeeId = declaration.employeeId;
   let employeeInfo = await EmployeeRegistration.findOne(
  { schoolId, academicYear, employeeId });
  console.log("employeeInfo", employeeInfo);
      // declaration.employeeName = .employeeName;

      let hraExemptionProofSubmitted = 0;
      let rentDetailStatus = 'Pending';
      let rentDetails = monthOrder.map(month => ({
        month,
        declaredRent: 0,
        cityType: '',
        landlordName: '',
        landlordPanNumber: '',
        landlordAddress: '',
        rentReceipt: null,
        monthStatus: 'Pending'
      }));

      const rentDetail = await EmployeeRentDetail.findOne({
        schoolId,
        employeeId: declaration.employeeId,
        academicYear
      }).lean();

      if (rentDetail && rentDetail.rentDetails) {
        hraExemptionProofSubmitted = rentDetail.hraExemption || 0;
        rentDetailStatus = rentDetail.status || 'Pending';
        const existingMonths = rentDetail.rentDetails.reduce((acc, detail) => {
          acc[detail.month] = {
            month: detail.month,
            declaredRent: detail.declaredRent || 0,
            cityType: detail.cityType || '',
            landlordName: detail.landlordName || '',
            landlordPanNumber: detail.landlordPanNumber || '',
            landlordAddress: detail.landlordAddress || '',
            rentReceipt: detail.rentReceipt || null,
            monthStatus: detail.monthStatus || 'Pending'
          };
          return acc;
        }, {});
        rentDetails = monthOrder.map(month => existingMonths[month] || {
          month,
          declaredRent: 0,
          cityType: '',
          landlordName: '',
          landlordPanNumber: '',
          landlordAddress: '',
          rentReceipt: null,
          monthStatus: 'Pending'
        });
      }

      declaration.hraExemption = {
        proofSubmitted: hraExemptionProofSubmitted,
        status: rentDetailStatus,
        rentDetailsId: rentDetail?._id || null,
        rentDetails
      };

      // Fetch LTA Exemption
      const ltaDetail = await EmployeeltaDetails.findOne({
        schoolId,
        employeeId: declaration.employeeId,
        academicYear
      }).lean();
      declaration.otherExemption.ltaExemption = {
        ltaDetailsId: ltaDetail?._id || null,
        categoryLimit: ltaDetail?.categoryLimit || 0,
        proofSubmitted: ltaDetail?.proofSubmitted || 0,
        categoryFinalDeduction: ltaDetail?.categoryFinalDeduction || 0,
        status: ltaDetail?.status || 'Pending',
        adminRemarks: ltaDetail?.adminRemarks || '',
        ltaDetails: ltaDetail?.ltaDetails || []
      };

      // Fetch Telephone Allowance
      const telephoneDetail = await EmployeeTelephoneAllowance.findOne({
        schoolId,
        employeeId: declaration.employeeId,
        academicYear
      }).lean();
      declaration.otherExemption.telephoneAllowance = {
        telephoneAllowanceDetailsId: telephoneDetail?._id || null,
        categoryLimit: telephoneDetail?.categoryLimit || 0,
        proofSubmitted: telephoneDetail?.proofSubmitted || 0,
        categoryFinalDeduction: telephoneDetail?.categoryFinalDeduction || 0,
        status: telephoneDetail?.status || 'Pending',
        adminRemarks: telephoneDetail?.adminRemarks || '',
        telephoneAllowanceDetails: telephoneDetail?.telephoneAllowanceDetails || []
      };

      // Fetch Internet Allowance
      const internetDetail = await EmployeeInternetAllowance.findOne({
        schoolId,
        employeeId: declaration.employeeId,
        academicYear,
        
      }).lean();
      declaration.otherExemption.internetAllowance = {
        internetAllowanceDetailsId: internetDetail?._id || null,
        categoryLimit: internetDetail?.categoryLimit || 0,
        proofSubmitted: internetDetail?.proofSubmitted || 0,
        categoryFinalDeduction: internetDetail?.categoryFinalDeduction || 0,
        status: internetDetail?.status || 'Pending',
        adminRemarks: internetDetail?.adminRemarks || '',
        internetAllowanceDetails: internetDetail?.internetAllowanceDetails || []
      };
    }

    res.status(200).json({
      success: true,
      data: declarations,
      totalRecords: declarations.length,
      message: 'All IT declarations fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching all IT declarations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export default getAllEmployeeItDeclarations;