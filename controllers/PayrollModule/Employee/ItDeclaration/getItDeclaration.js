// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';

// const getItDeclaration = async (req, res) => {
//   console.log('Reached getItDeclaration controller');
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

//     // Determine ongoing and previous month
//     const currentDate = new Date();
//     const fiscalYearStart = parseInt(academicYear.split('-')[0]); // e.g., 2025
//     const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
//     const currentYear = currentDate.getFullYear();
//     const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
//     const ongoingMonth = monthOrder[fiscalMonthIndex];
//     const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

//     // Fetch ItDeclaration
//     let declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
    
//     // Default structure if no declaration exists
//     if (!declaration) {
//       declaration = {
//         schoolId,
//         employeeId,
//         academicYear,
//         taxRegime: 'old',
//         panNumber: '',
//         section80C: {
//           items: [
//             {
//               section: "80C",
//               category: "Life Insurance Premium including Bima Nivesh( only Self , Spouse and children)",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Employee Provident Fund (EPF)",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Public Provident Fund (PPF)",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Tuition Fees ( For 2 Children)",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "5 Year Bank Fixed Deposit",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "5 Year Post office Time Deposit",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Sukanya Samriddhi Account",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Housing Loan Payment of Principal/Stamp Duty & Registration",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Unit Link Insurance Plan / Infrastructure Bond / National Saving Certificate / Accrued Interest on NSC",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80C",
//               category: "Subscription to notified Central Government security (NSS) / Mutual Funds/ELSS and others / Pension Fund",
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             }
//           ],
//           sectionLimit: 150000,
//           finalDeduction: 0
//         },
//         section80D: {
//           items: [
//             {
//               section: "80D",
//               category: "Medical Insurance Premium For Self,Spouse and Dependent Children (Age Below 60 Years)",
//               categoryLimit: 25000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Medical Insurance Premium For Self,Spouse and Dependent Children (60 Years or Above )",
//               categoryLimit: 50000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Medical Insurance Premium For parents(Age Below 60 Years)",
//               categoryLimit: 25000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Medical Insurance Premium For Parents (60 Years or Above)",
//               categoryLimit: 50000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Medical Expenditure for Self (60 Years or Above) (If No Insurance Premium)",
//               categoryLimit: 50000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Medical Expenditure for Parents ( 60 Years or Above) (If No Insurance Premium)",
//               categoryLimit: 50000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "80D",
//               category: "Preventive Health Checkup (Self, Family or Parents)",
//               categoryLimit: 5000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             }
//           ],
//           finalDeduction: 0
//         },
//         otherSections: {
//           items: [
//             {
//               section: "Other",
//               category: "Deduction For Dependent With Disability (Form 10-I) (Flat Dedcution of INR 75000) (Yes/No)",
//               categoryLimit: 75000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             },
//             {
//               section: "Other",
//               category: "Deduction For Dependent With Severe Disability (Form 10-I)",
//               categoryLimit: 125000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             },
//             {
//               section: "Other",
//               category: "Deduction For Self Disability",
//               categoryLimit: 75000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             },
//             {
//               section: "Other",
//               category: "Deduction For Self Severe Disability",
//               categoryLimit: 125000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             },
//             {
//               section: "Other",
//               category: "Mediclaim Expenses For Critical Illness (Deduction allowed to the extent of expenses incurred , Maximum of INR 40000)",
//               categoryLimit: 40000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "Other",
//               category: "Mediclaim Expenses For Critical Illness - Senior Citizen (Deduction allowed to the extent of expenses incurred , Maximum of INR 100000)",
//               categoryLimit: 100000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "Other",
//               category: "Interest on Educational Loan for Higher studies (u/s 80E) - Self, Spouse & Children [Allowed for 8 Years from repayment starts]",
//               categoryLimit: 0,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: ""
//             },
//             {
//               section: "Section80EE",
//               category: "Interest on Home Loan (u/s 80EE) ( Loan Sanctioned between April 2016 to Mar 2017)",
//               categoryLimit: 50000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             },
//             {
//               section: "Section80EEA",
//               category: "Interest on Home Loan (u/s 80EEA) ( Loan Sanctioned between April 2019 to Mar 2022) (Cost of House Less than 45 Lakh)",
//               categoryLimit: 150000,
//               categoryFinalDeduction: 0,
//               proofSubmitted: 0,
//               proofDocument: null,
//               status: "Pending",
//               adminRemarks: "",
//               enabled: false
//             }
//           ],
//           finalDeduction: 0
//         },
//         hraExemption: {
//           rentDetailsId: null,
//           proofSubmitted: 0
//         },
//         status: 'Verification Pending',
//         submittedAt: null,
//         verifiedAt: null,
//         adminRemarks: ''
//       };
//     }

//     // Fetch HRA exemption for the ongoing month
//     let hraExemptionProofSubmitted = 0;
//     let rentDetailStatus = "Pending";
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (rentDetail && rentDetail.rentDetails) {

//        hraExemptionProofSubmitted = rentDetail.hraExemption;
//        rentDetailStatus = rentDetail.status;
//     }

//     declaration.hraExemption.proofSubmitted = hraExemptionProofSubmitted;
//     declaration.hraExemption.status = rentDetailStatus;

//     res.status(200).json({
//       success: true,
//       data: declaration,
//       message: 'IT declaration fetched successfully'
//     });

//   } catch (error) {
//     console.error('Error fetching IT declaration:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default getItDeclaration;

import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';
import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';

const getItDeclaration = async (req, res) => {
  console.log('Reached getItDeclaration controller');
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, employeeId, or academicYear'
      });
    }

    const monthOrder = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];

    // Determine ongoing and previous month
    const currentDate = new Date();
    const fiscalYearStart = parseInt(academicYear.split('-')[0]); // e.g., 2025
    const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
    const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
    const ongoingMonth = monthOrder[fiscalMonthIndex];
    const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

    // Fetch ItDeclaration with populated references
    let declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear })
      .populate('otherExemption.ltaExemption.ltaDetailsId')
      .populate('otherExemption.telephoneAllowance.telephoneAllowanceDetailsId')
      .populate('otherExemption.internetAllowance.internetAllowanceDetailsId')
      .lean();

    // Default structure if no declaration exists
    if (!declaration) {
      declaration = {
        schoolId,
        employeeId,
        academicYear,
        taxRegime: 'old',
        panNumber: '',
        section80C: {
          items: [
            {
              section: "80C",
              category: "Life Insurance Premium including Bima Nivesh (only Self, Spouse and children)",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Employee Provident Fund (EPF)",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Public Provident Fund (PPF)",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Tuition Fees (For 2 Children)",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "5 Year Bank Fixed Deposit",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "5 Year Post Office Time Deposit",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Sukanya Samriddhi Account",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Housing Loan Payment of Principal/Stamp Duty & Registration",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Unit Link Insurance Plan / Infrastructure Bond / National Saving Certificate / Accrued Interest on NSC",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80C",
              category: "Subscription to notified Central Government security (NSS) / Mutual Funds/ELSS and others / Pension Fund",
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            }
          ],
          sectionLimit: 150000,
          finalDeduction: 0
        },
        section80D: {
          items: [
            {
              section: "80D",
              category: "Medical Insurance Premium For Self, Spouse and Dependent Children (Age Below 60 Years)",
              categoryLimit: 25000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Medical Insurance Premium For Self, Spouse and Dependent Children (60 Years or Above)",
              categoryLimit: 50000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Medical Insurance Premium For Parents (Age Below 60 Years)",
              categoryLimit: 25000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Medical Insurance Premium For Parents (60 Years or Above)",
              categoryLimit: 50000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Medical Expenditure for Self (60 Years or Above) (If No Insurance Premium)",
              categoryLimit: 50000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Medical Expenditure for Parents (60 Years or Above) (If No Insurance Premium)",
              categoryLimit: 50000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "80D",
              category: "Preventive Health Checkup (Self, Family or Parents)",
              categoryLimit: 5000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            }
          ],
          finalDeduction: 0
        },
        otherSections: {
          items: [
            {
              section: "Other",
              category: "Deduction For Dependent With Disability (Form 10-I) (Flat Deduction of INR 75000) (Yes/No)",
              categoryLimit: 75000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            },
            {
              section: "Other",
              category: "Deduction For Dependent With Severe Disability (Form 10-I)",
              categoryLimit: 125000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            },
            {
              section: "Other",
              category: "Deduction For Self Disability",
              categoryLimit: 75000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            },
            {
              section: "Other",
              category: "Deduction For Self Severe Disability",
              categoryLimit: 125000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            },
            {
              section: "Other",
              category: "Mediclaim Expenses For Critical Illness (Deduction allowed to the extent of expenses incurred, Maximum of INR 40000)",
              categoryLimit: 40000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "Other",
              category: "Mediclaim Expenses For Critical Illness - Senior Citizen (Deduction allowed to the extent of expenses incurred, Maximum of INR 100000)",
              categoryLimit: 100000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "Other",
              category: "Interest on Educational Loan for Higher Studies (u/s 80E) - Self, Spouse & Children [Allowed for 8 Years from repayment starts]",
              categoryLimit: 0,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: ""
            },
            {
              section: "Section80EE",
              category: "Interest on Home Loan (u/s 80EE) (Loan Sanctioned between April 2016 to Mar 2017)",
              categoryLimit: 50000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            },
            {
              section: "Section80EEA",
              category: "Interest on Home Loan (u/s 80EEA) (Loan Sanctioned between April 2019 to Mar 2022) (Cost of House Less than 45 Lakh)",
              categoryLimit: 150000,
              categoryFinalDeduction: 0,
              proofSubmitted: 0,
              proofDocument: null,
              status: "Pending",
              adminRemarks: "",
              enabled: false
            }
          ],
          finalDeduction: 0
        },
        hraExemption: {
          rentDetailsId: null,
          proofSubmitted: 0,
          status: "Pending",
          adminRemarks: ""
        },
        otherExemption: {
          ltaExemption: {
            ltaDetailsId: null,
            categoryLimit: 0,
            proofSubmitted: 0,
            categoryFinalDeduction: 0,
            status: "Pending",
            adminRemarks: ""
          },
          telephoneAllowance: {
            telephoneAllowanceDetailsId: null,
            categoryLimit: 0,
            proofSubmitted: 0,
            categoryFinalDeduction: 0,
            status: "Pending",
            adminRemarks: ""
          },
          internetAllowance: {
            internetAllowanceDetailsId: null,
            categoryLimit: 0,
            proofSubmitted: 0,
            categoryFinalDeduction: 0,
            status: "Pending",
            adminRemarks: ""
          }
        },
        status: 'Verification Pending',
        submittedAt: null,
        verifiedAt: null,
        adminRemarks: '',
        acceptTermsAndConditions: false
      };
    }

    // Fetch HRA exemption for the ongoing month
    let hraExemptionProofSubmitted = 0;
    let rentDetailStatus = "Pending";
    let rentDetailAdminRemarks = "";
    const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
    if (rentDetail && rentDetail.rentDetails) {
      hraExemptionProofSubmitted = rentDetail.hraExemption || 0;
      rentDetailStatus = rentDetail.status || "Pending";
      rentDetailAdminRemarks = rentDetail.adminRemarks || "";
    }
    declaration.hraExemption.proofSubmitted = hraExemptionProofSubmitted;
    declaration.hraExemption.status = rentDetailStatus;
    declaration.hraExemption.adminRemarks = rentDetailAdminRemarks;

    // Fetch LTA details
    const ltaDetails = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).lean();
    if (ltaDetails) {
      declaration.otherExemption.ltaExemption = {
        ltaDetailsId: ltaDetails._id,
        categoryLimit: ltaDetails.categoryLimit || 0,
        proofSubmitted: ltaDetails.proofSubmitted || 0,
        categoryFinalDeduction: ltaDetails.categoryFinalDeduction || 0,
        status: ltaDetails.status || "Pending",
        adminRemarks: ltaDetails.adminRemarks || "",
        ltaDetails: ltaDetails.ltaDetails || []
      };
    }

    // Fetch Telephone Allowance details
    const telephoneDetail = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
    if (telephoneDetail) {
      declaration.otherExemption.telephoneAllowance = {
        telephoneAllowanceDetailsId: telephoneDetail._id,
        categoryLimit: telephoneDetail.categoryLimit || 0,
        proofSubmitted: telephoneDetail.proofSubmitted || 0,
        categoryFinalDeduction: telephoneDetail.categoryFinalDeduction || 0,
        status: telephoneDetail.status || "Pending",
        adminRemarks: telephoneDetail.adminRemarks || "",
        telephoneAllowanceDetails: telephoneDetail.telephoneAllowanceDetails || []
      };
    }

    // Fetch Internet Allowance details
    const internetDetail = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
    if (internetDetail) {
      declaration.otherExemption.internetAllowance = {
        internetAllowanceDetailsId: internetDetail._id,
        categoryLimit: internetDetail.categoryLimit || 0,
        proofSubmitted: internetDetail.proofSubmitted || 0,
        categoryFinalDeduction: internetDetail.categoryFinalDeduction || 0,
        status: internetDetail.status || "Pending",
        adminRemarks: internetDetail.adminRemarks || "",
        internetAllowanceDetails: internetDetail.internetAllowanceDetails || []
      };
    }

    res.status(200).json({
      success: true,
      data: declaration,
      message: 'IT declaration fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching IT declaration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export default getItDeclaration;