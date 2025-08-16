// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';

// const getRentDetails = async (req, res) => {
//   console.log('Reached getRentDetails controller');
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear = '2025-26' } = req.query;

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear'
//       });
//     }

//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];

//     // Fetch EmployeeRentDetail
//     let rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();

//     // Default structure if no rent detail exists
//     if (!rentDetail) {
//       rentDetail = {
//         schoolId,
//         employeeId,
//         academicYear,
//         actualHRAReceived,
//         actualRentPaid,
//         basicSalaryCity,
//         rentDetails: monthOrder.map(month => ({
//           month,
//           declaredRent: 0,
//           cityType: '',
//           landlordName: '',
//           landlordPanNumber: '',
//           landlordAddress: '',
//           rentReceipt: null,
//           monthActualHRAReceived: 0,
//           monthActualRentPaid: 0,
//           monthBasicSalaryCity: 0,
//         }))
//       };
//     } else {
//       // Ensure all months are included in rentDetails
//       const existingMonths = rentDetail.rentDetails.map(detail => detail.month);
//       const missingMonths = monthOrder.filter(month => !existingMonths.includes(month));
//       rentDetail.rentDetails = [
//         ...rentDetail.rentDetails,
//         ...missingMonths.map(month => ({
//           month,
//           declaredRent: 0,
//           cityType: '',
//           landlordName: '',
//           landlordPanNumber: '',
//           landlordAddress: '',
//           rentReceipt: null,
//           monthActualHRAReceived: 0,
//           monthBctualRentPaid: 0,
//           monthBasicSalaryCity: 0,
          
//         }))
//       ];
      
//       rentDetail.rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
//     }

//     res.status(200).json({
//       success: true,
//       data: rentDetail,
//       message: 'Rent details fetched successfully'
//     });

//   } catch (error) {
//     console.error('Error fetching rent details:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default getRentDetails;

import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
const getRentDetails = async (req, res) => {
  console.log('Reached getRentDetails controller');
  try {
    const { schoolId: paramSchoolId, employeeId: paramEmployeeId } = req.params;
    const { academicYear } = req.query;
    const sessionUserDetails = req.session?.userDetails || {};
    const schoolId = sessionUserDetails.schoolId || paramSchoolId;
    const employeeId = sessionUserDetails.userId || paramEmployeeId;

    // Validate required fields
    if (!schoolId || !employeeId || !academicYear) {
      console.error('Missing required fields:', { schoolId, employeeId, academicYear });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, employeeId, or academicYear'
      });
    }

    // Validate session user authorization
    if (sessionUserDetails.schoolId && sessionUserDetails.userId) {
      if (sessionUserDetails.schoolId !== schoolId || sessionUserDetails.userId !== employeeId) {
        console.error('Unauthorized access attempt:', { sessionUserDetails, schoolId, employeeId });
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only access your own rent details'
        });
      }
    }

    const monthOrder = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];

    // Fetch EmployeeRentDetail
    let rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();

    // Default structure if no rent detail exists
    if (!rentDetail) {
      rentDetail = {
        schoolId,
        employeeId,
        academicYear,
        // status,
        actualHRAReceived: 0,
        actualRentPaid: 0,
        basicSalaryCity: 0,
        hraExemption: 0,
        
        rentDetails: monthOrder.map(month => ({
          month,
          declaredRent: 0,
          cityType: '',
          landlordName: '',
          landlordPanNumber: '',
          landlordAddress: '',
          rentReceipt: null,
          monthStatus,
          monthActualHRAReceived: 0,
          monthActualRentPaid: 0,
          monthBasicSalaryCity: 0
        }))
      };
    } else {
      // Ensure all months are included in rentDetails
      const existingMonths = rentDetail.rentDetails.map(detail => detail.month);
      const missingMonths = monthOrder.filter(month => !existingMonths.includes(month));
      rentDetail.rentDetails = [
        ...rentDetail.rentDetails,
        ...missingMonths.map(month => ({
          month,
          declaredRent: 0,
          cityType: '',
          landlordName: '',
          landlordPanNumber: '',
          landlordAddress: '',
          rentReceipt: null,
          monthStatus,
          monthActualHRAReceived: 0,
          monthActualRentPaid: 0,
          monthBasicSalaryCity: 0
        }))
      ];

      // Sort rentDetails by monthOrder
      rentDetail.rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    }

    res.status(200).json({
      success: true,
      data: rentDetail,
      message: 'Rent details fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching rent details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
export default getRentDetails;