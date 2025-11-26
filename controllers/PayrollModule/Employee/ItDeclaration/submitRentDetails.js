// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import fs from 'fs';
// import path from 'path';

// const submitRentDetails = async (req, res) => {
//   console.log('Reached submitRentDetails controller');
//   try {
//     const { academicYear, schoolId: bodySchoolId, employeeId: bodyEmployeeId } = req.body;
//     const sessionUserDetails = req.session?.userDetails || {};
//     const schoolId = sessionUserDetails.schoolId || bodySchoolId;
//     const employeeId = sessionUserDetails.userId || bodyEmployeeId;

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear'
//       });
//     }

//     // Fetch EmployeeCTC for the employee and academic year
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(404).json({
//         success: false,
//         message: 'CTC data not found for the employee and academic year'
//       });
//     }

//     // Extract HRA and Basic Salary from CTC components
//     const hraComponent = ctc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('hra'));
//     const basicSalaryComponent = ctc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('basic salary'));
    
//     if (!hraComponent || !basicSalaryComponent) {
//       return res.status(400).json({
//         success: false,
//         message: 'HRA or Basic Salary component not found in CTC'
//       });
//     }

//     const annualHRA = hraComponent.annualAmount || 0;
//     console.log("annualHRA",annualHRA);
    
//     const annualBasicSalary = basicSalaryComponent.annualAmount || 0;
//     console.log("annualBasicSalary",annualBasicSalary);
    
//     const monthlyHRA = annualHRA / 12;
//     const monthlyBasicSalary = annualBasicSalary / 12;

//     // Map uploaded files to their respective indices
//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/rentReceipts\[(\d+)\]/);
//       if (match) {
//         const index = parseInt(match[1]);
//         filesByField[index] = file;
//       }
//     });

//     // Process rentDetails, only including entries with declaredRent > 0
//     const rentDetails = [];
//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];

//     (req.body.rentDetails || []).forEach((detail, index) => {
//       const { month, declaredRent, cityType, landlordName, landlordPanNumber, landlordAddress } = detail;
//       const rentReceipt = filesByField[index]?.path;

//       const declaredRentValue = parseFloat(declaredRent) || 0;

//       // Only process entries with declaredRent > 0 and complete data
//       if (declaredRentValue > 0) {
//         if (!month || !monthOrder.includes(month)) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid or missing month for rentDetails[${index}]`
//           });
//         }
//         if (!cityType || !['Metro', 'Non-Metro'].includes(cityType)) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid or missing cityType for rentDetails[${index}]`
//           });
//         }
//         if (!landlordName || !landlordPanNumber || !landlordAddress || !rentReceipt) {
//           return res.status(400).json({
//             success: false,
//             message: `Missing required fields for rentDetails[${index}]: landlordName, landlordPanNumber, landlordAddress, or rentReceipt`
//           });
//         }

//         // Calculate actualRentPaid = declaredRent - 10% of Basic Salary
//         const tenPercentBasic = annualBasicSalary * 0.1;
//         const actualRentPaid =  parseFloat(declaredRentValue - tenPercentBasic).toFixed(0);
       
//         // Calculate HRA exemption based on Indian tax rules
//         const hraPercentage = cityType === 'Metro' ? 0.5 : 0.4;
//         console.log("hraPercentage",hraPercentage);
        
//         const basicSalaryCity = parseFloat((annualBasicSalary * hraPercentage).toFixed(0));
//         console.log("basicSalaryCity",basicSalaryCity);
        
//         const hraExemption = Math.min(
//           annualHRA, 
//           actualRentPaid, 
//           basicSalaryCity, 
//         );

//         rentDetails.push({
//           month,
//           declaredRent: declaredRentValue,
//           cityType,
//           landlordName,
//           landlordPanNumber,
//           landlordAddress,
//           rentReceipt,
//           actualHRAReceived: annualHRA,
//           actualRentPaid,
//           basicSalaryCity: basicSalaryCity,
//           hraExemption
//         });
//       }
//     });

//     // If no valid rent details, return early
//     if (rentDetails.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No valid rent details provided (all declaredRent values are 0 or invalid)'
//       });
//     }

//     // Sort rentDetails by month order
//     rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

//     const rentDetailData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       rentDetails
//     };

//     // Save to EmployeeRentDetail
//     const rentDetail = await EmployeeRentDetail.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       rentDetailData,
//       { upsert: true, new: true, runValidators: true }
//     );

//     // Update ItDeclaration with rentDetailsId
//     await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { 'hraExemption.rentDetailsId': rentDetail._id },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: rentDetail,
//       message: 'Rent details submitted successfully'
//     });

//   } catch (error) {
//     // Clean up uploaded files in case of error
//     if (req.files) {
//       req.files.forEach(file => {
//         try {
//           if (file?.path && fs.existsSync(file.path)) {
//             fs.unlinkSync(file.path);
//           }
//         } catch (err) {
//           console.error('Error cleaning up file:', err);
//         }
//       });
//     }

//     console.error('Error submitting rent details:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitRentDetails;

// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import fs from 'fs';
// import path from 'path';

// const submitRentDetails = async (req, res) => {
//   console.log('Reached submitRentDetails controller');
//   try {
//     const { academicYear, schoolId: bodySchoolId, employeeId: bodyEmployeeId } = req.body;
//     const sessionUserDetails = req.session?.userDetails || {};
//     console.log('Session userDetails:', sessionUserDetails);

//     // Prefer session data, fallback to req.body for debugging
//     const schoolId = sessionUserDetails.schoolId || bodySchoolId;
//     const employeeId = sessionUserDetails.userId || bodyEmployeeId;

//     if (!schoolId || !employeeId || !academicYear) {
//       console.error('Missing required fields:', { schoolId, employeeId, academicYear });
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear'
//       });
//     }

//     if (!sessionUserDetails.schoolId || !sessionUserDetails.userId) {
//       console.warn('Session data incomplete, using req.body as fallback:', { bodySchoolId, bodyEmployeeId });
//     }

//     // Fetch CTC
//     console.log('Fetching CTC for:', { schoolId, employeeId, academicYear });
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       console.error('CTC data not found');
//       return res.status(400).json({
//         success: false,
//         message: 'CTC data not found for the employee and academic year'
//       });
//     }
//     console.log('CTC found:', ctc);

//     // Month-to-index mapping (fiscal year: April to March)
//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];

//     // Function to get month-specific CTC data
//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       // Calculate monthEnd for fiscal year (April 2025 to March 2026)
//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = (monthIndex + 3) % 12;
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);
//       console.log(`Processing CTC for ${monthName}, monthEnd: ${monthEnd}`);

//       const applicableDate = new Date(ctcData.applicableDate);
//       console.log(`Main CTC applicableDate: ${applicableDate}, components:`, ctcData.components);

//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate
//         };
//         console.log(`Using main CTC for ${monthName}`);
//       } else {
//         const validHistory = ctcData.history
//           .filter((h) => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         console.log(`History entries for ${monthName}:`, validHistory);

//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate
//           };
//           console.log(`Using history CTC for ${monthName}, applicableDate: ${validHistory[0].applicableDate}`);
//         }
//       }

//       if (!selectedCtc) {
//         console.log(`No valid CTC data found for ${monthName}, using default values`);
//         return {
//           annualHRA: 0,
//           annualBasicSalary: 0,
//           monthlyHRA: 0,
//           monthlyBasicSalary: 0
//         };
//       }

//       const hraComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('hra'));
//       const basicSalaryComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('basic salary'));

//       if (!hraComponent || !basicSalaryComponent) {
//         console.log(`HRA or Basic Salary missing in CTC for ${monthName}, components:`, selectedCtc.components);
//         throw new Error(`HRA or Basic Salary component not found in CTC for ${monthName}`);
//       }

//       return {
//         annualHRA: hraComponent.annualAmount || 0,
//         annualBasicSalary: basicSalaryComponent.annualAmount || 0,
//         monthlyHRA: (hraComponent.annualAmount || 0) / 12,
//         monthlyBasicSalary: (basicSalaryComponent.annualAmount || 0) / 12
//       };
//     };

//     // Map uploaded files
//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/rentReceipts\[(\d+)\]/);
//       if (match) {
//         const index = parseInt(match[1]);
//         filesByField[index] = file;
//       }
//     });
//     console.log('Mapped files:', filesByField);

//     // Process rentDetails
//     const rentDetails = [];
//     for (const [index, detail] of (req.body.rentDetails || []).entries()) {
//       const { month, declaredRent, cityType, landlordName, landlordPanNumber, landlordAddress, existingRentReceipt } = detail;
//       const rentReceipt = filesByField[index]?.path;
//       const declaredRentValue = parseFloat(declaredRent) || 0;

//       console.log(`Processing rentDetails[${index}]:`, { month, declaredRentValue, cityType, landlordName, landlordPanNumber, landlordAddress, rentReceipt, existingRentReceipt });

//       // Normalize file paths
//       const normalizedExistingRentReceipt = existingRentReceipt ? path.normalize(existingRentReceipt) : null;
//       const normalizedRentReceipt = rentReceipt ? path.normalize(rentReceipt) : null;

//       if (declaredRentValue > 0) {
//         if (!month || !monthOrder.includes(month)) {
//           throw new Error(`Invalid or missing month for rentDetails[${index}]`);
//         }
//         if (!cityType || !['Metro', 'Non-Metro'].includes(cityType)) {
//           throw new Error(`Invalid or missing cityType for rentDetails[${index}]`);
//         }
//         if (!landlordName || !landlordAddress || (!normalizedRentReceipt && !normalizedExistingRentReceipt)) {
//           throw new Error(`Missing required fields for rentDetails[${index}]: landlordName, landlordAddress, or rentReceipt`);
//         }
//         if (declaredRentValue > 100000 && !landlordPanNumber) {
//           throw new Error(`Missing landlordPanNumber for rentDetails[${index}] with declaredRent > ₹1,00,000`);
//         }

//         // Get month-specific CTC data
//         const { annualHRA,annualBasicSalary,monthlyHRA, monthlyBasicSalary } = getCtcForMonth(month, ctc);

//         // Calculate HRA exemption
//         const tenPercentBasic = annualBasicSalary * 0.1;
//         const monthActualRentPaid = parseFloat(declaredRentValue).toFixed(0);
//         const hraPercentage = cityType === 'Metro' ? 0.5 : 0.4;
//         // const basicSalaryCity = parseFloat((annualBasicSalary * hraPercentage).toFixed(0));
//         const monthBasicSalaryCity = parseFloat((monthlyBasicSalary).toFixed(0));
//         const hraExemption = Math.min(annualHRA, actualRentPaid, basicSalaryCity);

//         // If a new file is uploaded, delete the old file
//         if (normalizedRentReceipt && normalizedExistingRentReceipt && fs.existsSync(normalizedExistingRentReceipt)) {
//           try {
//             fs.unlinkSync(normalizedExistingRentReceipt);
//             console.log(`Deleted old file: ${normalizedExistingRentReceipt}`);
//           } catch (err) {
//             console.error(`Error deleting old file ${normalizedExistingRentReceipt}:`, err);
//           }
//         }

//         rentDetails.push({
//           month,
//           declaredRent: declaredRentValue,
//           cityType,
//           landlordName,
//           landlordPanNumber: landlordPanNumber || '',
//           landlordAddress,
//           rentReceipt: normalizedRentReceipt || normalizedExistingRentReceipt,
//           monthActualHRAReceived: monthlyHRA,
//           monthActualRentPaid,
//           monthBasicSalaryCity, 
//         });
//       } else {
//         rentDetails.push({
//           month,
//           declaredRent: 0,
//           cityType: '',
//           landlordName: '',
//           landlordPanNumber: '',
//           landlordAddress: '',
//           rentReceipt: null,
//           actualHRAReceived: 0,
//           actualRentPaid: 0,
//           basicSalaryCity: 0,
          
//         });
//       }
//     }

//     // Validate rentDetails
//     if (rentDetails.length === 0) {
//       console.error('No rent details provided');
//       return res.status(400).json({
//         success: false,
//         message: 'No rent details provided'
//       });
//     }

//     // Sort rentDetails by month order
//     rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
//     console.log('Sorted rentDetails:', rentDetails);

//     const rentDetailData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       rentDetails
//     };

//     // Save to EmployeeRentDetail
//     console.log('Saving rent details to database');
//     const rentDetail = await EmployeeRentDetail.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       rentDetailData,
//       { upsert: true, new: true, runValidators: true }
//     );
//     console.log('Rent details saved:', rentDetail);

//     // Update ItDeclaration
//     console.log('Updating ItDeclaration');
//     await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { 'hraExemption.rentDetailsId': rentDetail._id },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: rentDetail,
//       message: 'Rent details submitted successfully'
//     });

//   } catch (error) {
//     // Clean up uploaded files
//     if (req.files) {
//       req.files.forEach(file => {
//         try {
//           const normalizedPath = path.normalize(file.path);
//           if (fs.existsSync(normalizedPath)) {
//             fs.unlinkSync(normalizedPath);
//             console.log(`Cleaned up file: ${normalizedPath}`);
//           }
//         } catch (err) {
//           console.error('Error cleaning up file:', err);
//         }
//       });
//     }
//     console.error('Error submitting rent details:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitRentDetails;



// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import fs from 'fs';
// import path from 'path';

// const submitRentDetails = async (req, res) => {
//   try {
//     const { academicYear, schoolId: bodySchoolId, employeeId: bodyEmployeeId } = req.body;
//     const sessionUserDetails = req.session?.userDetails || {};
//     const schoolId = sessionUserDetails.schoolId || bodySchoolId;
//     const employeeId = sessionUserDetails.userId || bodyEmployeeId;

//     console.log('Received data:', { schoolId, employeeId, academicYear, rentDetails: req.body.rentDetails });

//     if (!schoolId || !employeeId || !academicYear) {
//       console.error('Missing required fields:', { schoolId, employeeId, academicYear });
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear'
//       });
//     }

//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       console.error('CTC data not found:', { schoolId, employeeId, academicYear });
//       return res.status(400).json({
//         success: false,
//         message: 'CTC data not found for the employee and academic year'
//       });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = (monthIndex + 3) % 12;
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter((h) => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {
//           monthlyHRA: 0,
//           monthlyBasicSalary: 0
//         };
//       }

//       const hraComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('hra'));
//       const basicSalaryComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('basic salary'));

//       if (!hraComponent || !basicSalaryComponent) {
//         throw new Error(`HRA or Basic Salary component not found in CTC for ${monthName}`);
//       }

//       return {
//         monthlyHRA: (hraComponent.annualAmount || 0) / 12,
//         monthlyBasicSalary: (basicSalaryComponent.annualAmount || 0) / 12
//       };
//     };

//     const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
//     const maxFileSize = 2 * 1024 * 1024;
//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/rentReceipts\[(\d+)\]/);
//       if (match) {
//         const index = parseInt(match[1]);
//         filesByField[index] = file;
//       }
//     });

//     if (!Array.isArray(req.body.rentDetails) || req.body.rentDetails.length !== 12) {
//       console.error('Invalid rentDetails array:', req.body.rentDetails);
//       return res.status(400).json({
//         success: false,
//         message: 'rentDetails must be an array of 12 months'
//       });
//     }

//     const rentDetails = [];
//     let totalDeclaredRent = 0;
//     let totalMonthActualHRAReceived = 0;
//     let totalMonthActualRentPaid = 0;
//     let totalMonthBasicSalaryCity = 0;
//     let totalMonthActualHRAReceivedNonMetro = 0;
//     let totalMonthActualRentPaidNonMetro = 0;
//     let totalMonthBasicSalaryNonMetro =0;
//     const cityTypes = req.body.rentDetails
//       .filter(detail => parseFloat(detail.declaredRent) > 0)
//       .map(detail => detail.cityType);
//     // if (cityTypes.length > 0 && new Set(cityTypes).size > 1) {
//     //   throw new Error('All non-zero rent entries must have the same city type (Metro or Non-Metro)');
//     // }

//     for (const [index, detail] of req.body.rentDetails.entries()) {
//       const { month, declaredRent, cityType, landlordName, landlordPanNumber, landlordAddress, existingRentReceipt } = detail;
//       const rentReceipt = filesByField[index]?.path;
//       const declaredRentValue = parseFloat(declaredRent) || 0;

//       console.log(`Processing rentDetails[${index}]:`, { month, declaredRentValue, cityType, landlordName, landlordPanNumber, landlordAddress, rentReceipt });

//       if (rentReceipt) {
//         const file = filesByField[index];
//         if (!validTypes.includes(file.mimetype)) {
//           throw new Error(`Invalid file type for rentDetails[${index}]. Only JPEG, PNG, or PDF allowed.`);
//         }
//         if (file.size > maxFileSize) {
//           throw new Error(`File size for rentDetails[${index}] exceeds 2MB.`);
//         }
//       }

//       const normalizedExistingRentReceipt = existingRentReceipt ? path.normalize(existingRentReceipt) : null;
//       const normalizedRentReceipt = rentReceipt ? path.normalize(rentReceipt) : null;

//       if (declaredRentValue > 0) {
//         if (!month || !monthOrder.includes(month)) {
//           throw new Error(`Invalid or missing month for rentDetails[${index}]`);
//         }
//         if (!cityType || !['Metro', 'Non-Metro'].includes(cityType)) {
//           throw new Error(`Invalid or missing cityType for rentDetails[${index}]`);
//         }
//         if (!landlordName || !landlordAddress || (!normalizedRentReceipt && !normalizedExistingRentReceipt)) {
//           throw new Error(`Missing required fields for rentDetails[${index}]: landlordName, landlordAddress, or rentReceipt`);
//         }
//         if (declaredRentValue > 100000 && !landlordPanNumber) {
//           throw new Error(`Missing landlordPanNumber for rentDetails[${index}] with declaredRent > ₹1,00,000`);
//         }

//         const { monthlyHRA, monthlyBasicSalary } = getCtcForMonth(month, ctc);

//         const monthActualRentPaid = declaredRentValue;
//         const monthBasicSalaryCity = parseFloat(monthlyBasicSalary.toFixed(0));

//         if (normalizedRentReceipt && normalizedExistingRentReceipt && fs.existsSync(normalizedExistingRentReceipt)) {
//           fs.unlinkSync(normalizedExistingRentReceipt);
//           console.log(`Deleted old file: ${normalizedExistingRentReceipt}`);
//         }

//         rentDetails.push({
//           month,
//           declaredRent: declaredRentValue,
//           cityType,
//           landlordName,
//           landlordPanNumber: landlordPanNumber || '',
//           landlordAddress,
//           rentReceipt: normalizedRentReceipt || normalizedExistingRentReceipt,
//           monthActualHRAReceived: monthlyHRA,
//           monthActualRentPaid,
//           monthBasicSalaryCity
//         });

//       totalDeclaredRent += declaredRentValue;
//        if (cityType === "Metro") {
//         totalMonthActualHRAReceived += monthlyHRA;
//         totalMonthActualRentPaid += monthActualRentPaid;
//         totalMonthBasicSalaryCity += monthBasicSalaryCity;
//        }else{
//         totalMonthActualHRAReceivedNonMetro += monthlyHRA;
//         totalMonthActualRentPaidNonMetro += monthActualRentPaid;
//         totalMonthBasicSalaryNonMetro += monthBasicSalaryCity;
//        }
//         // totalDeclaredRent += declaredRentValue;
//         // totalMonthActualHRAReceived += monthlyHRA;
//         // totalMonthActualRentPaid += monthActualRentPaid;
//         // totalMonthBasicSalaryCity += monthBasicSalaryCity;
//       } else {
//         rentDetails.push({
//           month,
//           declaredRent: 0,
//           cityType: '',
//           landlordName: '',
//           landlordPanNumber: '',
//           landlordAddress: '',
//           rentReceipt: null,
//           monthActualHRAReceived: 0,
//           monthActualRentPaid: 0,
//           monthBasicSalaryCity: 0
//         });
//       }
//     }

//     if (rentDetails.length === 0) {
//       console.error('No rent details provided');
//       return res.status(400).json({
//         success: false,
//         message: 'No rent details provided'
//       });
//     }

//     // The calcultion For The Metro City
    

//     const cityType = cityTypes.length > 0 ? cityTypes[0] : 'Non-Metro';
//     const hraPercentage = cityType === 'Metro' ? 0.5 : 0.4;
//     console.log("hraPercentage",hraPercentage);
    
//     // Calculating the Metro
//     const actualHRAReceivedMetro = totalMonthActualHRAReceived;
//     console.log("actualHRAReceivedMetro",actualHRAReceivedMetro);

//     const basicSalaryMetroCity = parseFloat((totalMonthBasicSalaryCity * hraPercentage).toFixed(0));
//      console.log("basicSalaryMetroCity",basicSalaryMetroCity);

//     const actualRentPaidMetro = parseFloat((totalMonthActualRentPaid - (totalMonthBasicSalaryCity * 0.1)).toFixed(0));
//     console.log("actualRentPaidMetro",actualRentPaidMetro);

//     const metroHraExemption = Math.min(
//       actualHRAReceivedMetro,
//       actualRentPaidMetro,
//       basicSalaryMetroCity,   
//     ).toFixed(0);
//     console.log("metroHraExemption",metroHraExemption);

//     // Calculating the Non Metro
//     const actualHRAReceivedNonMetro = totalMonthActualHRAReceivedNonMetro;
//     console.log("actualHRAReceivedNonMetro",actualHRAReceivedNonMetro);
    
//     const basicSalaryNonMetroCity = parseFloat((totalMonthBasicSalaryNonMetro * hraPercentage).toFixed(0));
//     console.log("actualHRAReceivedNonMetro",basicSalaryNonMetroCity);

//     const actualRentPaidNonMetro = parseFloat((totalMonthActualRentPaidNonMetro - (totalMonthBasicSalaryNonMetro * 0.1)).toFixed(0));
//     console.log("actualHRAReceivedNonMetro",actualRentPaidNonMetro);

//     const nonMetroHraExemption = Math.min(
//       actualHRAReceivedNonMetro,
//       actualRentPaidNonMetro,
//       basicSalaryNonMetroCity,
//     ).toFixed(0);
//     console.log("nonMetroHraExemption", nonMetroHraExemption);

//     const actualHRAReceived = parseFloat(actualHRAReceivedMetro + actualHRAReceivedNonMetro);
//     console.log("actualHRAReceived",actualHRAReceived);
    
//     const basicSalaryCity = parseFloat(basicSalaryMetroCity + basicSalaryNonMetroCity);
//     console.log("basicSalaryCity",basicSalaryCity);
    
//     const actualRentPaid = parseFloat(actualRentPaidMetro + actualRentPaidNonMetro);
//     console.log("actualRentPaid",actualRentPaid);
    
//     const rentPaidMinusTenPercent = actualRentPaid - (basicSalaryCity * 0.1);
//     console.log("rentPaidMinusTenPercent",rentPaidMinusTenPercent);

//     const hraExemption = parseFloat(metroHraExemption + nonMetroHraExemption) ;
//     console.log("hraExemption", hraExemption);
    
//     rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

//     const rentDetailData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       actualHRAReceived,
//       actualRentPaid,
//       basicSalaryCity,
//       hraExemption,
//       rentDetails
//     };

//     console.log('Saving rent details:', rentDetailData);

//     const rentDetail = await EmployeeRentDetail.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       rentDetailData,
//       { upsert: true, new: true, runValidators: true }
//     );

//     console.log('Rent detail saved:', rentDetail);

//     await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { 'hraExemption.rentDetailsId': rentDetail._id },
//       { upsert: true, new: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: rentDetail,
//       message: 'Rent details submitted successfully'
//     });
//   } catch (error) {
//     if (req.files) {
//       req.files.forEach(file => {
//         const normalizedPath = path.normalize(file.path);
//         if (fs.existsSync(normalizedPath)) {
//           fs.unlinkSync(normalizedPath);
//           console.log(`Cleaned up file: ${normalizedPath}`);
//         }
//       });
//     }
//     console.error('Error submitting rent details:', error.stack);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitRentDetails;

import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';
import path from 'path';
const submitRentDetails = async (req, res) => {
  try {
    const { academicYear, schoolId: bodySchoolId, employeeId: bodyEmployeeId, status } = req.body;
    const sessionUserDetails = req.session?.userDetails || {};
    const schoolId = sessionUserDetails.schoolId || bodySchoolId;
    const employeeId = sessionUserDetails.userId || bodyEmployeeId;

    console.log('Received data:', { schoolId, employeeId, academicYear, rentDetails: req.body.rentDetails });

    if (!schoolId || !employeeId || !academicYear) {
      console.error('Missing required fields:', { schoolId, employeeId, academicYear });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, employeeId, or academicYear'
      });
    }

    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
    if (!ctc) {
      console.error('CTC data not found:', { schoolId, employeeId, academicYear });
      return res.status(400).json({
        success: false,
        message: 'CTC data not found for the employee and academic year'
      });
    }

    const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

    const getCtcForMonth = (monthName, ctcData) => {
      const monthIndex = monthOrder.indexOf(monthName);
      if (monthIndex === -1) {
        throw new Error(`Invalid month: ${monthName}`);
      }

      const fiscalYearStart = parseInt(academicYear.split('-')[0]);
      const calendarMonth = (monthIndex + 3) % 12;
      const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
      const monthEnd = new Date(year, calendarMonth + 1, 0);

      const applicableDate = new Date(ctcData.applicableDate);
      let selectedCtc = null;
      if (applicableDate <= monthEnd) {
        selectedCtc = {
          components: ctcData.components,
          totalAnnualCost: ctcData.totalAnnualCost,
          applicableDate: ctcData.applicableDate
        };
      } else {
        const validHistory = ctcData.history
          .filter((h) => new Date(h.applicableDate) <= monthEnd)
          .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
        if (validHistory.length > 0) {
          selectedCtc = {
            components: validHistory[0].components,
            totalAnnualCost: validHistory[0].totalAnnualCost,
            applicableDate: validHistory[0].applicableDate
          };
        }
      }

      if (!selectedCtc) {
        return {
          monthlyHRA: 0,
          monthlyBasicSalary: 0
        };
      }

      const hraComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('hra'));
      const basicSalaryComponent = selectedCtc.components.find(comp => comp.ctcComponentName.toLowerCase().includes('basic salary'));

      if (!hraComponent || !basicSalaryComponent) {
        throw new Error(`HRA or Basic Salary component not found in CTC for ${monthName}`);
      }

      return {
        monthlyHRA: (hraComponent.annualAmount || 0) / 12,
        monthlyBasicSalary: (basicSalaryComponent.annualAmount || 0) / 12
      };
    };

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxFileSize = 2 * 1024 * 1024;
    const filesByField = {};
    (req.files || []).forEach(file => {
      const match = file.fieldname.match(/rentReceipts\[(\d+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        filesByField[index] = file;
      }
    });

    if (!Array.isArray(req.body.rentDetails) || req.body.rentDetails.length !== 12) {
      console.error('Invalid rentDetails array:', req.body.rentDetails);
      return res.status(400).json({
        success: false,
        message: 'rentDetails must be an array of 12 months'
      });
    }

    const rentDetails = [];
    let totalDeclaredRent = 0;
    let totalMonthActualHRAReceivedMetro = 0;
    let totalMonthActualRentPaidMetro = 0;
    let totalMonthBasicSalaryMetro = 0;
    let totalMonthActualHRAReceivedNonMetro = 0;
    let totalMonthActualRentPaidNonMetro = 0;
    let totalMonthBasicSalaryNonMetro = 0;

    for (const [index, detail] of req.body.rentDetails.entries()) {
      const { month, declaredRent, cityType, landlordName, landlordPanNumber, landlordAddress, existingRentReceipt, monthStatus } = detail;
      const rentReceipt = filesByField[index]?.path;
      const declaredRentValue = parseFloat(declaredRent) || 0;

      console.log(`Processing rentDetails[${index}]:`, { month, declaredRentValue, cityType, landlordName, landlordPanNumber, landlordAddress, rentReceipt });

      if (rentReceipt) {
        const file = filesByField[index];
        if (!validTypes.includes(file.mimetype)) {
          throw new Error(`Invalid file type for rentDetails[${index}]. Only JPEG, PNG, or PDF allowed.`);
        }
        if (file.size > maxFileSize) {
          throw new Error(`File size for rentDetails[${index}] exceeds 2MB.`);
        }
      }

      const normalizedExistingRentReceipt = existingRentReceipt ? path.normalize(existingRentReceipt) : null;
      const normalizedRentReceipt = rentReceipt ? path.normalize(rentReceipt) : null;

      if (declaredRentValue > 0) {
        if (!month || !monthOrder.includes(month)) {
          throw new Error(`Invalid or missing month for rentDetails[${index}]`);
        }
        if (!cityType || !['Metro', 'Non-Metro'].includes(cityType)) {
          throw new Error(`Invalid or missing cityType for rentDetails[${index}]`);
        }
        if (!landlordName || !landlordAddress || (!normalizedRentReceipt && !normalizedExistingRentReceipt)) {
          throw new Error(`Missing required fields for rentDetails[${index}]: landlordName, landlordAddress, or rentReceipt`);
        }
        if (declaredRentValue > 100000 && !landlordPanNumber) {
          throw new Error(`Missing landlordPanNumber for rentDetails[${index}] with declaredRent > ₹1,00,000`);
        }

        const { monthlyHRA, monthlyBasicSalary } = getCtcForMonth(month, ctc);
        const monthActualRentPaid = declaredRentValue;
        const monthBasicSalaryCity = parseFloat(monthlyBasicSalary);

        if (normalizedRentReceipt && normalizedExistingRentReceipt && fs.existsSync(normalizedExistingRentReceipt)) {
          fs.unlinkSync(normalizedExistingRentReceipt);
          console.log(`Deleted old file: ${normalizedExistingRentReceipt}`);
        }

        rentDetails.push({
          month,
          declaredRent: declaredRentValue,
          cityType,
          landlordName,
          landlordPanNumber: landlordPanNumber || '',
          landlordAddress,
          rentReceipt: normalizedRentReceipt || normalizedExistingRentReceipt,
          monthActualHRAReceived: monthlyHRA,
          monthActualRentPaid,
          monthBasicSalaryCity,
          monthStatus: monthStatus || 'Pending'
        });

        totalDeclaredRent += declaredRentValue;
        if (cityType === 'Metro') {
          totalMonthActualHRAReceivedMetro += monthlyHRA;
          totalMonthActualRentPaidMetro += monthActualRentPaid;
          totalMonthBasicSalaryMetro += monthBasicSalaryCity;
        } else if (cityType === 'Non-Metro') {
          totalMonthActualHRAReceivedNonMetro += monthlyHRA;
          totalMonthActualRentPaidNonMetro += monthActualRentPaid;
          totalMonthBasicSalaryNonMetro += monthBasicSalaryCity;
        }
      } else {
        rentDetails.push({
          month,
          declaredRent: 0,
          cityType: '',
          landlordName: '',
          landlordPanNumber: '',
          landlordAddress: '',
          rentReceipt: null,
          monthActualHRAReceived: 0,
          monthActualRentPaid: 0,
          monthBasicSalaryCity: 0,
          monthStatus: 'Pending',
        });
      }
    }

    if (rentDetails.length === 0) {
      console.error('No rent details provided');
      return res.status(400).json({
        success: false,
        message: 'No rent details provided'
      });
    }

    // Metro calculations
    const actualHRAReceivedMetro = totalMonthActualHRAReceivedMetro;
    const basicSalaryMetroCity = totalMonthBasicSalaryMetro * 0.5;
    const actualRentPaidMetro = totalMonthActualRentPaidMetro - (totalMonthBasicSalaryMetro * 0.1);
    const metroHraExemption = Math.min(
      actualHRAReceivedMetro,
      actualRentPaidMetro,
      basicSalaryMetroCity
    );

    // Non-Metro calculations
    const actualHRAReceivedNonMetro = totalMonthActualHRAReceivedNonMetro;
    const basicSalaryNonMetroCity = totalMonthBasicSalaryNonMetro * 0.4;
    const actualRentPaidNonMetro = totalMonthActualRentPaidNonMetro - (totalMonthBasicSalaryNonMetro * 0.1);
    const nonMetroHraExemption = Math.min(
      actualHRAReceivedNonMetro,
      actualRentPaidNonMetro,
      basicSalaryNonMetroCity
    );

    // totals 
    const actualHRAReceived = actualHRAReceivedMetro + actualHRAReceivedNonMetro;
    const actualRentPaid = parseFloat((actualRentPaidMetro + actualRentPaidNonMetro).toFixed(0));
    const basicSalaryCity = parseFloat((basicSalaryMetroCity + basicSalaryNonMetroCity).toFixed(0)) ;
    const rentPaidMinusTenPercent = actualRentPaid - (basicSalaryCity * 0.1);
    const hraExemption = parseFloat((metroHraExemption + nonMetroHraExemption).toFixed(0));

    console.log('Totals:', {
      actualHRAReceived,
      actualRentPaid,
      basicSalaryCity,
      rentPaidMinusTenPercent,
      hraExemption,
      metroHraExemption,
      nonMetroHraExemption
    });

    rentDetails.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    const rentDetailData = {
      schoolId,
      employeeId,
      academicYear,
      actualHRAReceived,
      actualRentPaid,
      basicSalaryCity,
      hraExemption,
      status,
      rentDetails
    };

    console.log('Saving rent details:', rentDetailData);

    const rentDetail = await EmployeeRentDetail.findOneAndUpdate(
      { schoolId, employeeId, academicYear },
      rentDetailData,
      { upsert: true, new: true, runValidators: true }
    );

    console.log('Rent detail saved:', rentDetail);

    await ItDeclaration.findOneAndUpdate(
      { schoolId, employeeId, academicYear },
      { 'hraExemption.rentDetailsId': rentDetail._id },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: rentDetail,
      message: 'Rent details submitted successfully'
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        const normalizedPath = path.normalize(file.path);
        if (fs.existsSync(normalizedPath)) {
          fs.unlinkSync(normalizedPath);
          console.log(`Cleaned up file: ${normalizedPath}`);
        }
      });
    }
    console.error('Error submitting rent details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
export default submitRentDetails;


