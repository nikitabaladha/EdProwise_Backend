// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// const getItComputationSheetDetails = async (req, res) => {
//     try {
//         const { schoolId, employeeId } = req.params;
//         const { academicYear } = req.query;

//         console.log("School ID", schoolId);
//         console.log("Employee Id", employeeId);
//         console.log("academicYear", academicYear);

//         if (!schoolId || !employeeId || !academicYear) {
//             return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//         }


//         const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//         if (!employee) {
//             console.log("Employee NOt found");
//             return res.status(404).json({ hasError: true, message: 'Employee not found' });
//         }

//         console.log("Employee Details", employee);


//         const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//         if (!academicYearData) {
//             return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//         }
//         console.log("academicYearData", academicYearData);

//         // Calculate total months and remaining months
//         const startDate = moment(academicYearData.startDate, 'YYYY-MM-DD');
//         console.log("StartDate", startDate);
        
//         const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//         console.log("endDate",endDate);
        
//         const totalMonths = endDate.diff(startDate, 'months') + 1;
//         console.log("totalMonths",totalMonths);
        
//         //  payroll details for approved and paid months
//         const payrollRecords = await PayrollDetails.find({
//             schoolId,
//             academicYear,
//             approvalStatus: 'Approved',
//             'employees.employeeId': employeeId,
//             'employees.payrollStatus': 'Paid',
//         }).lean();
//         console.log("PayrollRecords", payrollRecords);
           

//         // Process payroll data
//         let paidMonthsCount = 0;
//         const ctcEarnings = {};
//         let totalActualSalary = 0;

//         payrollRecords.forEach(record => {
//             const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//             if (employeeData) {
//                 paidMonthsCount++;
//                 Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//                     ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//                     totalActualSalary += value;
//                 });
//             }
//         });
        
//         // Calculate remaining months
//         const remainingMonths = totalMonths - paidMonthsCount;
//         console.log("remainingMonths",remainingMonths);
        

//         // Project earnings for remaining months (assuming same monthly earnings as average of paid months)
//         const projectedEarnings = {};
//         let totalProjectedSalary = 0;
//         if (paidMonthsCount > 0) {
//             Object.entries(ctcEarnings).forEach(([key, value]) => {
//                 const monthlyAverage = value / paidMonthsCount;
//                 projectedEarnings[key] = monthlyAverage * remainingMonths;
//                 totalProjectedSalary += projectedEarnings[key];
//             });
//         }

//         // Check for previous income (simplified; assumes stored in EmployeeRegistration or another model)
//         let hasPreviousIncome = !!employee.previousIncome; 
//         const previousIncome = hasPreviousIncome ? employee.previousIncome : {};
        
//         // Compute deductions and tax (simplified for now; adjust based on actual tax rules)
//         const hraExemption = ctcEarnings['HRA'] ? Math.min(ctcEarnings['HRA'] * 0.4, 10000) : 0; // Example rule
//         const standardDeduction = 75000;
//         const section80C = 150000;
//         const section80D = 20000;
//         const otherDeductions = 45000;

//         const totalIncome = totalActualSalary + totalProjectedSalary;
//         const salaryAfterDeductions = totalIncome - hraExemption - standardDeduction;
//         const netTaxableIncome = salaryAfterDeductions - section80C - section80D - otherDeductions;

//         // Tax calculation (simplified; adjust based on regime and slab rates)
//         const taxRegime = employee.taxRegime || 'new';
//         let totalTax = 0;
//         if (taxRegime === 'new') {
//             if (netTaxableIncome <= 700000) {
//                 totalTax = 0; // Rebate u/s 87A
//             } else {
//                 // Simplified tax slab for new regime
//                 totalTax = (netTaxableIncome - 700000) * 0.1; // Example: 10% on excess
//             }
//         } else {
//             // Old regime tax calculation (simplify or expand as needed)
//             totalTax = netTaxableIncome > 500000 ? (netTaxableIncome - 500000) * 0.2 : 0;
//         }

//         const data = {
//             employeeDetails: {
//                 employeeName: employee.employeeName,
//                 employeeId: employee.employeeId,
//                 grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//                 jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//                 taxRegime,
//             },
//             hasPreviousIncome,
//             computation: {
//                 months: {
//                     previousIncome: hasPreviousIncome ? 0 : null, // Adjust based on actual data
//                     actual: paidMonthsCount,
//                     projection: remainingMonths,
//                     total: totalMonths,
//                 },
//                 ctcComponents: Object.keys(ctcEarnings).map(key => ({
//                     name: key,
//                     previousIncome: hasPreviousIncome ? previousIncome[key] || 0 : null,
//                     actual: ctcEarnings[key] || 0,
//                     projection: projectedEarnings[key] || 0,
//                     total: (ctcEarnings[key] || 0) + (projectedEarnings[key] || 0),
//                 })),
//                 incomeFromSalary: {
//                     previousIncome: hasPreviousIncome ? Object.values(previousIncome).reduce((sum, val) => sum + val, 0) : null,
//                     actual: totalActualSalary,
//                     projection: totalProjectedSalary,
//                     total: totalIncome,
//                 },
//                 deductions: {
//                     hraExemption: { total: 0 },
//                     standardDeduction: { total: standardDeduction },
//                     ltaExemption: { total: 0 }, // Adjust as needed
//                     professionalTaxExemption: { total: 0 }, // Adjust as needed
//                     section80C: { total: section80C },
//                     section80D: { total: section80D },
//                     otherSection: { total: otherDeductions },
//                 },
//                 salaryAfterDeductions: { total: salaryAfterDeductions },
//                 totalIncome: { total: totalIncome },
//                 netTaxableIncome: { total: netTaxableIncome },
//                 totalTax: { total: totalTax },
//                 rebate87A: { total: netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0 },
//                 netTaxPayable: { total: totalTax },
//                 taxAlreadyDeducted: { total: 0 }, // Adjust based on actual data
//                 taxYetToBeDeducted: { total: totalTax },
//             },
//         };

//         console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//         return res.status(200).json({ hasError: false, data });
//     } catch (error) {
//         console.error('Error fetching IT computation sheet:', error);
//         return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//     }
// };

// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);

//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months
//     const startDate = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const totalMonths = endDate.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
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
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter(h => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//         monthlyCtc[comp.ctcComponentName] = (comp.annualAmount || 0) ;
//       });
//       return monthlyCtc;
//     };

//     // Calculate remaining months and project earnings
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;

//     if (remainingMonths > 0) {
//       const currentDate = moment();
//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const remainingMonthNames = monthOrder.filter((month, index) => {
//         const calendarMonth = (index + 3) % 12;
//         const year = index < 9 ? fiscalYearStart : fiscalYearStart + 1;
//         const monthDate = moment(`${year}-${calendarMonth + 1}-01`, 'YYYY-M-DD');
//         return monthDate.isAfter(currentDate, 'month');
//       }).slice(0, remainingMonths);

//       remainingMonthNames.forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//         });
//       });
//     }

//     // Fetch previous income
//     const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     console.log('Previous Income:', previousIncome);

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch IT declaration for deductions
//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     const deductions = {
//       standardDeduction: 75000, 
//       section80C: itDeclaration?.section80C.finalDeduction || 0,
//       section80D: itDeclaration?.section80D.finalDeduction || 0,
//       otherSection: itDeclaration?.otherSections.finalDeduction || 0,
//     //   hraExemption: itDeclaration?.hraExemption.proofSubmitted || 0,
//       ltaExemption: itDeclaration?.deductions?.ltaExemption || 0,
//       professionalTaxExemption: itDeclaration?.deductions?.professionalTaxExemption || 0,
//     };

//     // Compute totals
//     const totalPreviousIncome = hasPreviousIncome
//       ? Object.values(previousIncome).reduce((sum, val) => sum + (val || 0), 0)
//       : null;

    

//     const totalIncome = totalActualSalary + totalProjectedSalary + (totalPreviousIncome || 0);

//     const salaryAfterDeductions =
//       totalIncome -
//       hraExemption -
//       deductions.standardDeduction -
//       deductions.ltaExemption -
//       deductions.professionalTaxExemption;
//     const netTaxableIncome =
//       salaryAfterDeductions - deductions.section80C - deductions.section80D - deductions.otherSection;

//     // Tax calculation (Indian tax slabs for 2025-26)
//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     } else {
//       // Old regime slabs (simplified for 2025-26)
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//       employeeDetails: {
//         employeeName: employee.employeeName,
//         employeeId: employee.employeeId,
//         grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//         jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//         taxRegime,
//       },
//       hasPreviousIncome,
//       computation: {
//         months: {
//           previousIncome: hasPreviousIncome ? 0 : null,
//           actual: paidMonthsCount,
//           projection: remainingMonths,
//           total: totalMonths,
//         },
//         ctcComponents: Object.keys(ctcEarnings).map(key => ({
//           name: key,
//           previousIncome: hasPreviousIncome ? previousIncome[key] || 0 : null,
//           actual: ctcEarnings[key] || 0,
//           projection: projectedEarnings[key] || 0,
//           total: (ctcEarnings[key] || 0) + (projectedEarnings[key] || 0) + (hasPreviousIncome ? previousIncome[key] || 0 : 0),
//         })),
//         incomeFromSalary: {
//           previousIncome: totalPreviousIncome,
//           actual: totalActualSalary,
//           projection: totalProjectedSalary,
//           total: totalIncome,
//         },
//         deductions: {
//           hraExemption: { total: hraExemption },
//           standardDeduction: { total: deductions.standardDeduction },
//           ltaExemption: { total: deductions.ltaExemption },
//           professionalTaxExemption: { total: deductions.professionalTaxExemption },
//           section80C: { total: deductions.section80C },
//           section80D: { total: deductions.section80D },
//           otherSection: { total: deductions.otherSection },
//         },
//         salaryAfterDeductions: { total: salaryAfterDeductions },
//         totalIncome: { total: totalIncome },
//         netTaxableIncome: { total: netTaxableIncome },
//         totalTax: { total: Math.round(totalTax) },
//         rebate87A: { total: Math.round(rebate87A) },
//         netTaxPayable: { total: Math.round(netTaxPayable) },
//         taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//         taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//       },
//     };

//     console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };
// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);

//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months
//     const startDate = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const totalMonths = endDate.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = (monthIndex + 3); // Adjusted as per your correction
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter(h => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//         monthlyCtc[comp.ctcComponentName] = (comp.annualAmount || 0) ; // Assuming monthly split for simplicity
//       });
//       return monthlyCtc;
//     };

//     // Calculate remaining months and project earnings
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;

//     if (remainingMonths > 0) {
//       const currentDate = moment();
//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const remainingMonthNames = monthOrder.filter((month, index) => {
//         const calendarMonth = (index + 3); // Adjusted as per your correction
//         const year = index < 9 ? fiscalYearStart : fiscalYearStart + 1;
//         const monthDate = moment(`${year}-${calendarMonth + 1}-01`, 'YYYY-M-DD');
//         return monthDate.isAfter(currentDate, 'month');
//       }).slice(0, remainingMonths);

//       remainingMonthNames.forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//         });
//       });
//     }

//     // Fetch previous income
//     const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     console.log('Previous Income:', previousIncome);

//     // Define valid income components for previous income calculation
//     const validIncomeComponents = [
//       'Basic Salary',
//       'HRA',
//       'Leave Travel Allowance',
//       'Education Allowance',
//       'Lunch Allowance',
//       'Conveyance Allowance',
//       'Other Allowance (Balance)',
//     ];

//     // Identify common components and aggregate other allowances
//     const ctcComponentNames = Object.keys(ctcEarnings);
//     const previousIncomeKeys = Object.keys(previousIncome);
//     const deductionComponents = ['Professional Tax', 'Employee PF Contribution'];
//     const commonComponents = ctcComponentNames.filter(name => previousIncomeKeys.includes(name) && validIncomeComponents.includes(name));
//     const otherAllowanceComponents = previousIncomeKeys.filter(
//       name => !ctcComponentNames.includes(name) && validIncomeComponents.includes(name)
//     );

//     const otherAllowancesSum = otherAllowanceComponents.reduce(
//       (sum, key) => sum + (previousIncome[key] || 0),
//       0
//     );

//     // Calculate total previous income using only valid income components
//     const totalPreviousIncome = hasPreviousIncome
//       ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
//       : 0;

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch IT declaration for deductions
//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     const deductions = {
//       standardDeduction: 75000,
//       section80C: itDeclaration?.section80C.finalDeduction || 0,
//       section80D: itDeclaration?.section80D.finalDeduction || 0,
//       otherSection: itDeclaration?.otherSections.finalDeduction || 0,
//       hraExemption: hraExemption,
//       ltaExemption: itDeclaration?.deductions?.ltaExemption || 0,
//       professionalTaxExemption: itDeclaration?.deductions?.professionalTaxExemption || 0,
//     };

//     // Compute totals
//     const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

//     const salaryAfterDeductions =
//       totalIncome -
//       hraExemption -
//       deductions.standardDeduction -
//       deductions.ltaExemption -
//       deductions.professionalTaxExemption;

//     const netTaxableIncome =
//       salaryAfterDeductions - deductions.section80C - deductions.section80D - deductions.otherSection;

//     // Tax calculation (Indian tax slabs for 2025-26)
//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     } else {
//       // Old regime slabs (simplified for 2025-26)
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//       employeeDetails: {
//         employeeName: employee.employeeName,
//         employeeId: employee.employeeId,
//         grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//         jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//         taxRegime,
//       },
//       hasPreviousIncome,
//       computation: {
//         months: {
//           previousIncome: hasPreviousIncome ? 0 : null,
//           actual: paidMonthsCount,
//           projection: remainingMonths,
//           total: totalMonths,
//         },
//         ctcComponents: commonComponents.map(name => ({
//           name,
//           previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
//           actual: ctcEarnings[name] || 0,
//           projection: projectedEarnings[name] || 0,
//           total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
//         })),
//         otherAllowances: hasPreviousIncome
//           ? {
//               previousIncome: otherAllowancesSum,
//               actual: 0,
//               projection: 0,
//               total: otherAllowancesSum,
//             }
//           : null,
//         incomeFromSalary: {
//           previousIncome: totalPreviousIncome,
//           actual: totalActualSalary,
//           projection: totalProjectedSalary.toFixed(0),
//           total: totalIncome,
//         },
//         deductions: {
//           hraExemption: { total: hraExemption },
//           standardDeduction: { total: deductions.standardDeduction },
//           ltaExemption: { total: deductions.ltaExemption },
//           professionalTaxExemption: { total: deductions.professionalTaxExemption },
//           section80C: { total: deductions.section80C },
//           section80D: { total: deductions.section80D },
//           otherSection: { total: deductions.otherSection },
//         },
//         salaryAfterDeductions: { total: salaryAfterDeductions },
//         totalIncome: { total: totalIncome },
//         netTaxableIncome: { total: netTaxableIncome },
//         totalTax: { total: Math.round(totalTax) },
//         rebate87A: { total: Math.round(rebate87A) },
//         netTaxPayable: { total: Math.round(netTaxPayable) },
//         taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//         taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//       },
//     };

//     console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };
// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);

//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months
//     const startDate = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const totalMonths = endDate.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = (monthIndex + 3);
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter(h => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//           monthlyCtc[comp.ctcComponentName] = (comp.annualAmount || 0);
//       });
//       return monthlyCtc;
//     };

//     // Calculate remaining months and project earnings
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;
//     const monthWiseProjections = {};

//     if (remainingMonths > 0) {
//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       // Start projections from the first unpaid month
//       const startMonthIndex = paidMonthsCount; // Index of the first unpaid month
//       const remainingMonthNames = monthOrder.slice(startMonthIndex, startMonthIndex + remainingMonths);

//       remainingMonthNames.forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         monthWiseProjections[month] = { ...monthlyCtc, total: 0 };
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//           monthWiseProjections[month].total += value;
//         });
//       });

//       // Log month-wise projection details
//       console.log('Month-Wise Projection Details:');
//       Object.entries(monthWiseProjections).forEach(([month, components]) => {
//         console.log(`  Month: ${month}`);
//         Object.entries(components).forEach(([component, amount]) => {
//           console.log(`    ${component}: ${amount.toFixed(2)}`);
//         });
//       });
//     } else {
//       console.log('Month-Wise Projection Details: No remaining months for projection.');
//     }

//     console.log("totalProjectedSalary", totalProjectedSalary);
//     console.log("projectedEarnings",projectedEarnings);
    

//     // Fetch previous income
//     const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     const previousEmploymentPfExemption = hasPreviousIncome ? previousIncome['Professional Tax'] || 0 : 0;
//     const previousEmploymentPfContribution = hasPreviousIncome ? previousIncome['Employee PF Contribution'] || 0 : 0;
//     console.log('Previous Income:', previousIncome);
//     console.log('Previous Employment PF Exemption:', previousEmploymentPfExemption);
// console.log('Previous Employment PF Contribution:', previousEmploymentPfContribution);

//     // Define valid income components for previous income calculation
//     const validIncomeComponents = [
//       'Basic Salary',
//       'HRA',
//       'Leave Travel Allowance',
//       'Education Allowance',
//       'Lunch Allowance',
//       'Conveyance Allowance',
//       'Other Allowance (Balance)',
//     ];

//     // Identify common components and aggregate other allowances
//     const ctcComponentNames = Object.keys(ctcEarnings);
//     const previousIncomeKeys = Object.keys(previousIncome);
//     const deductionComponents = ['Professional Tax', 'Employee PF Contribution'];
//     const commonComponents = ctcComponentNames.filter(name => previousIncomeKeys.includes(name) && validIncomeComponents.includes(name));
//     const otherAllowanceComponents = previousIncomeKeys.filter(
//       name => !ctcComponentNames.includes(name) && validIncomeComponents.includes(name)
//     );

//     const otherAllowancesSum = otherAllowanceComponents.reduce(
//       (sum, key) => sum + (previousIncome[key] || 0),
//       0
//     );

//     // Calculate total previous income using only valid income components
//     const totalPreviousIncome = hasPreviousIncome
//       ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
//       : 0;

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch IT declaration for deductions
//     // const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     // const deductions = {
//     //   standardDeduction: 75000,
//     //   section80C: itDeclaration?.section80C.finalDeduction || 0,
//     //   section80D: itDeclaration?.section80D.finalDeduction || 0,
//     //   otherSection: itDeclaration?.otherSections.finalDeduction || 0,
//     //   hraExemption: hraExemption,
//     //   ltaExemption: itDeclaration?.deductions?.ltaExemption || 0,
//     //   professionalTaxExemption: itDeclaration?.deductions?.professionalTaxExemption || 0,
//     // };

//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
// const deductions = {
//   standardDeduction: { total: 75000 },
//   section80C: {
//     previousIncome: previousEmploymentPfContribution,
//     total: itDeclaration?.section80C.finalDeduction || 0,
//   },
//   section80D: { total: itDeclaration?.section80D.finalDeduction || 0 },
//   otherSection: { total: itDeclaration?.otherSections.finalDeduction || 0 },
//   hraExemption: { total: hraExemption },
//   ltaExemption: { total: itDeclaration?.deductions?.ltaExemption || 0 },
//   professionalTaxExemption: {
//     previousIncome: previousEmploymentPfExemption,
//     total: itDeclaration?.deductions?.professionalTaxExemption || 0,
//   },
// };

//     // Compute totals
//     const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

//     const salaryAfterDeductions =
//       totalIncome -
//       hraExemption -
//       deductions.standardDeduction -
//       deductions.ltaExemption -
//       deductions.professionalTaxExemption;

//     const netTaxableIncome =
//       salaryAfterDeductions - deductions.section80C - deductions.section80D - deductions.otherSection;

//     // Tax calculation (Indian tax slabs for 2025-26)
//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     } else {
//       // Old regime slabs (simplified for 2025-26)
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       // Add 4% Health and Education Cess
//       totalTax *= 1.04;
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//   employeeDetails: {
//     employeeName: employee.employeeName,
//     employeeId: employee.employeeId,
//     grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//     jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//     taxRegime,
//   },
//   hasPreviousIncome,
//   computation: {
//     months: {
//       previousIncome: hasPreviousIncome ? 0 : null,
//       actual: paidMonthsCount,
//       projection: remainingMonths,
//       total: totalMonths,
//     },
//     ctcComponents: commonComponents.map(name => ({
//       name,
//       previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
//       actual: ctcEarnings[name] || 0,
//       projection: projectedEarnings[name] || 0,
//       total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
//     })),
//     otherAllowances: hasPreviousIncome
//       ? {
//           previousIncome: otherAllowancesSum,
//           actual: 0,
//           projection: 0,
//           total: otherAllowancesSum,
//         }
//       : null,
//     incomeFromSalary: {
//       previousIncome: totalPreviousIncome,
//       actual: totalActualSalary,
//       projection: totalProjectedSalary,
//       total: totalIncome,
//     },
//     deductions: {
//       hraExemption: { total: deductions.hraExemption.total },
//       standardDeduction: { total: deductions.standardDeduction.total },
//       ltaExemption: { total: deductions.ltaExemption.total },
//       professionalTaxExemption: {
//         previousIncome: deductions.professionalTaxExemption.previousIncome,
//         total: deductions.professionalTaxExemption.total,
//       },
//       section80C: {
//         previousIncome: deductions.section80C.previousIncome,
//         total: deductions.section80C.total,
//       },
//       section80D: { total: deductions.section80D.total },
//       otherSection: { total: deductions.otherSection.total },
//     },
//     salaryAfterDeductions: { total: salaryAfterDeductions },
//     totalIncome: { total: totalIncome },
//     netTaxableIncome: { total: netTaxableIncome },
//     totalTax: { total: Math.round(totalTax) },
//     rebate87A: { total: Math.round(rebate87A) },
//     netTaxPayable: { total: Math.round(netTaxPayable) },
//     taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//     taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//   },
// };

//     console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };
// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
// import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
// import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';

// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);

//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months
//     const startDate = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const totalMonths = endDate.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = monthIndex + 3;
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter(h => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//         monthlyCtc[comp.ctcComponentName] = ((comp.annualAmount / 12) || 0);
//       });
//       return monthlyCtc;
//     };

//     // Calculate remaining months and project earnings
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;
//     const monthWiseProjections = {};

//     if (remainingMonths > 0) {
//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const startMonthIndex = paidMonthsCount;
//       const remainingMonthNames = monthOrder.slice(startMonthIndex, startMonthIndex + remainingMonths);

//       remainingMonthNames.forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         monthWiseProjections[month] = { ...monthlyCtc, total: 0 };
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//           monthWiseProjections[month].total += value;
//         });
//       });

//       console.log('Month-Wise Projection Details:');
//       Object.entries(monthWiseProjections).forEach(([month, components]) => {
//         console.log(`  Month: ${month}`);
//         Object.entries(components).forEach(([component, amount]) => {
//           console.log(`    ${component}: ${amount.toFixed(2)}`);
//         });
//       });
//     } else {
//       console.log('Month-Wise Projection Details: No remaining months for projection.');
//     }

//     console.log('totalProjectedSalary', totalProjectedSalary);
//     console.log('projectedEarnings', projectedEarnings);

//     const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     const previousEmploymentPfExemption = hasPreviousIncome ? previousIncome['Professional Tax'] || 0 : 0;
//     const previousEmploymentPfContribution = hasPreviousIncome ? previousIncome['Employee PF Contribution'] || 0 : 0;
//     console.log('Previous Income:', previousIncome);
//     console.log('Previous Employment PF Exemption:', previousEmploymentPfExemption);
//     console.log('Previous Employment PF Contribution:', previousEmploymentPfContribution);

//     // Define valid income components for previous income calculation
//     const validIncomeComponents = [
//       'Basic Salary',
//       'HRA',
//       'Leave Travel Allowance',
//       'Education Allowance',
//       'Lunch Allowance',
//       'Conveyance Allowance',
//       'Other Allowance (Balance)',
//     ];

//     // Identify common components and aggregate other allowances
//     const ctcComponentNames = Object.keys(ctcEarnings);
//     const previousIncomeKeys = Object.keys(previousIncome);
//     const deductionComponents = ['Professional Tax', 'Employee PF Contribution'];
//     const commonComponents = ctcComponentNames.filter(name => previousIncomeKeys.includes(name) && validIncomeComponents.includes(name));
//     const otherAllowanceComponents = previousIncomeKeys.filter(
//       name => !ctcComponentNames.includes(name) && validIncomeComponents.includes(name)
//     );

//     const otherAllowancesSum = otherAllowanceComponents.reduce(
//       (sum, key) => sum + (previousIncome[key] || 0),
//       0
//     );

//     // Calculate total previous income using only valid income components
//     const totalPreviousIncome = hasPreviousIncome
//       ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
//       : 0;

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch rent details for LTA exemption
//     const ltaDetail = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).lean();
//     let ltaExemption = 0;

//     if (ltaDetail) {
//       ltaExemption = ltaDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch rent details for telephone Allowance
//     const telephoneAllowanceDetail = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let telephoneAllowance = 0;

//     if (telephoneAllowanceDetail) {
//       telephoneAllowance = telephoneAllowanceDetail.categoryFinalDeduction || 0;
//     }

// // Fetch rent details for telephone Allowance
//     const internetAllowanceDetail = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let internetAllowance = 0;

//     if (internetAllowanceDetail) {
//       internetAllowance = internetAllowanceDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch IT declaration for deductions
//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     const deductions = {
//       standardDeduction: { total: 75000 },
//       section80C: {
//         // previousIncome: hasPreviousIncome ? previousEmploymentPfContribution : null,
//         total: itDeclaration?.section80C?.finalDeduction || 0,
//       },
//       section80D: { total: itDeclaration?.section80D?.finalDeduction || 0 },
//       otherSection: { total: itDeclaration?.otherSections?.finalDeduction || 0 },

//       hraExemption: { total: hraExemption },
//       ltaExemption: { total: ltaExemption },
//       telephoneAllowance : {total: telephoneAllowance},
//       internetAllowance : {total: internetAllowance},

//       professionalTaxExemption: {
//         previousIncome: hasPreviousIncome ? previousEmploymentPfExemption : null,
//         total: itDeclaration?.deductions?.professionalTaxExemption || 0,
//       },
//     };

//     // Compute totals
//     const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

//     const salaryAfterDeductions =
//       totalIncome -
//       deductions.hraExemption.total -
//       deductions.ltaExemption.total -
//       deductions.internetAllowance.total -
//       deductions.telephoneAllowance.total -
//       deductions.standardDeduction.total -
//       (deductions.professionalTaxExemption.total+ deductions.professionalTaxExemption.previousIncome);

//     const netTaxableIncome =
//       salaryAfterDeductions -
//       (deductions.section80C.total ) -
//       deductions.section80D.total -
//       deductions.otherSection.total;

//     // Tax calculation (Indian tax slabs for 2025-26)
//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     } else {
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//       employeeDetails: {
//         employeeName: employee.employeeName,
//         employeeId: employee.employeeId,
//         grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//         jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//         taxRegime,
//       },
//       hasPreviousIncome,
//       computation: {
//         months: {
//           previousIncome: hasPreviousIncome ? 0 : null,
//           actual: paidMonthsCount,
//           projection: remainingMonths,
//           total: totalMonths,
//         },
//         ctcComponents: commonComponents.map(name => ({
//           name,
//           previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
//           actual: ctcEarnings[name] || 0,
//           projection: projectedEarnings[name] || 0,
//           total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
//         })),
//         otherAllowances: hasPreviousIncome
//           ? {
//               previousIncome: otherAllowancesSum,
//               actual: 0,
//               projection: 0,
//               total: otherAllowancesSum,
//             }
//           : null,
//         incomeFromSalary: {
//           previousIncome: totalPreviousIncome,
//           actual: totalActualSalary,
//           projection: totalProjectedSalary,
//           total: totalIncome,
//         },
//         deductions: {
//           hraExemption: { total: deductions.hraExemption.total },
//           standardDeduction: { total: deductions.standardDeduction.total },
//           ltaExemption: { total: deductions.ltaExemption.total },
//           telephoneAllowance: { total: deductions.telephoneAllowance.total },
//           internetAllowance: { total: deductions.internetAllowance.total },
//           professionalTaxExemption: {
//             previousIncome: deductions.professionalTaxExemption.previousIncome,
//             total: deductions.professionalTaxExemption.total,
//           },
//           section80C: {
//             total: deductions.section80C.total,
//           },
//           section80D: { total: deductions.section80D.total },
//           otherSection: { total: deductions.otherSection.total },
//         },
//         salaryAfterDeductions: { total: salaryAfterDeductions },
//         totalIncome: { total: totalIncome },
//         netTaxableIncome: { total: netTaxableIncome },
//         totalTax: { total: Math.round(totalTax) },
//         rebate87A: { total: Math.round(rebate87A) },
//         netTaxPayable: { total: Math.round(netTaxPayable) },
//         taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//         taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//       },
//     };

//     console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };

// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
// import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
// import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';

// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details including joining date
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);
//     const joiningDate = moment(employee.joiningDate, 'YYYY-MM-DD');
  
//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months based on joining date
//     const academicYearStart = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const startDate = moment.max(academicYearStart, joiningDate);
//     const endDate = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const totalMonths = endDate.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Calculate remaining months
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = monthIndex + 3;
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           .filter(h => new Date(h.applicableDate) <= monthEnd)
//           .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//         monthlyCtc[comp.ctcComponentName] = ((comp.annualAmount / 12) || 0);
//       });
//       return monthlyCtc;
//     };

//     // Calculate projection months
//     const joiningMonthIndex = monthOrder.indexOf(joiningDate.format('MMMM'));
//     const startMonthIndex = Math.max(joiningMonthIndex, paidMonthsCount);
//     const remainingMonthNames = monthOrder.slice(startMonthIndex, startMonthIndex + remainingMonths);

//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;
//     const monthWiseProjections = {};

//     if (remainingMonths > 0) {
//       remainingMonthNames.forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         monthWiseProjections[month] = { ...monthlyCtc, total: 0 };
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//           monthWiseProjections[month].total += value;
//         });
//       });

//       console.log('Month-Wise Projection Details:');
//       Object.entries(monthWiseProjections).forEach(([month, components]) => {
//         console.log(`  Month: ${month}`);
//         Object.entries(components).forEach(([component, amount]) => {
//           console.log(`    ${component}: ${amount.toFixed(2)}`);
//         });
//       });
//     } else {
//       console.log('Month-Wise Projection Details: No remaining months for projection.');
//     }

//     console.log('totalProjectedSalary', totalProjectedSalary);
//     console.log('projectedEarnings', projectedEarnings);

//     const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     const previousEmploymentPfExemption = hasPreviousIncome ? previousIncome['Professional Tax'] || 0 : 0;
//     const previousEmploymentPfContribution = hasPreviousIncome ? previousIncome['Employee PF Contribution'] || 0 : 0;
//     console.log('Previous Income:', previousIncome);
//     console.log('Previous Employment PF Exemption:', previousEmploymentPfExemption);
//     console.log('Previous Employment PF Contribution:', previousEmploymentPfContribution);

//     // Define valid income components for previous income calculation
//     const validIncomeComponents = [
//       'Basic Salary',
//       'HRA',
//       'Leave Travel Allowance',
//       'Education Allowance',
//       'Lunch Allowance',
//       'Conveyance Allowance',
//       'Other Allowance (Balance)',
//     ];

//     // Identify common components and aggregate other allowances
//     const ctcComponentNames = Object.keys(ctcEarnings);
//     const previousIncomeKeys = Object.keys(previousIncome);
//     const deductionComponents = ['Professional Tax', 'Employee PF Contribution'];
//     const commonComponents = ctcComponentNames.filter(name => previousIncomeKeys.includes(name) && validIncomeComponents.includes(name));
//     const otherAllowanceComponents = previousIncomeKeys.filter(
//       name => !ctcComponentNames.includes(name) && validIncomeComponents.includes(name)
//     );

//     const otherAllowancesSum = otherAllowanceComponents.reduce(
//       (sum, key) => sum + (previousIncome[key] || 0),
//       0
//     );

//     // Calculate total previous income using only valid income components
//     const totalPreviousIncome = hasPreviousIncome
//       ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
//       : 0;

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch rent details for LTA exemption
//     const ltaDetail = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).lean();
//     let ltaExemption = 0;

//     if (ltaDetail) {
//       ltaExemption = ltaDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch rent details for telephone Allowance
//     const telephoneAllowanceDetail = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let telephoneAllowance = 0;

//     if (telephoneAllowanceDetail) {
//       telephoneAllowance = telephoneAllowanceDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch rent details for internet Allowance
//     const internetAllowanceDetail = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let internetAllowance = 0;

//     if (internetAllowanceDetail) {
//       internetAllowance = internetAllowanceDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch IT declaration for deductions
//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     const deductions = {
//       standardDeduction: { total: 75000 },
//       section80C: {
//         total: itDeclaration?.section80C?.finalDeduction || 0,
//       },
//       section80D: { total: itDeclaration?.section80D?.finalDeduction || 0 },
//       otherSection: { total: itDeclaration?.otherSections?.finalDeduction || 0 },
//       hraExemption: { total: hraExemption },
//       ltaExemption: { total: ltaExemption },
//       telephoneAllowance: { total: telephoneAllowance },
//       internetAllowance: { total: internetAllowance },
//       professionalTaxExemption: {
//         previousIncome: hasPreviousIncome ? previousEmploymentPfExemption : null,
//         total: itDeclaration?.deductions?.professionalTaxExemption || 0,
//       },
//     };

//     // Compute totals
//     const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

//     const salaryAfterDeductions =
//       totalIncome -
//       deductions.hraExemption.total -
//       deductions.ltaExemption.total -
//       deductions.internetAllowance.total -
//       deductions.telephoneAllowance.total -
//       deductions.standardDeduction.total -
//       (deductions.professionalTaxExemption.total + (deductions.professionalTaxExemption.previousIncome || 0));

//     const netTaxableIncome =
//       salaryAfterDeductions -
//       deductions.section80C.total -
//       deductions.section80D.total -
//       deductions.otherSection.total;

//     // Tax calculation (Indian tax slabs for 2025-26)
//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     } else {
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//       employeeDetails: {
//         employeeName: employee.employeeName,
//         employeeId: employee.employeeId,
//         grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//         jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//         taxRegime,
//       },
//       hasPreviousIncome,
//       computation: {
//         months: {
//           previousIncome: hasPreviousIncome ? 0 : null,
//           actual: paidMonthsCount,
//           projection: remainingMonths,
//           total: totalMonths,
//         },
//         ctcComponents: commonComponents.map(name => ({
//           name,
//           previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
//           actual: ctcEarnings[name] || 0,
//           projection: projectedEarnings[name] || 0,
//           total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
//         })),
//         otherAllowances: hasPreviousIncome
//           ? {
//               previousIncome: otherAllowancesSum,
//               actual: 0,
//               projection: 0,
//               total: otherAllowancesSum,
//             }
//           : null,
//         incomeFromSalary: {
//           previousIncome: totalPreviousIncome,
//           actual: totalActualSalary,
//           projection: totalProjectedSalary,
//           total: totalIncome,
//         },
//         deductions: {
//           hraExemption: { total: deductions.hraExemption.total },
//           standardDeduction: { total: deductions.standardDeduction.total },
//           ltaExemption: { total: deductions.ltaExemption.total },
//           telephoneAllowance: { total: deductions.telephoneAllowance.total },
//           internetAllowance: { total: deductions.internetAllowance.total },
//           professionalTaxExemption: {
//             previousIncome: deductions.professionalTaxExemption.previousIncome,
//             total: deductions.professionalTaxExemption.total,
//           },
//           section80C: {
//             total: deductions.section80C.total,
//           },
//           section80D: { total: deductions.section80D.total },
//           otherSection: { total: deductions.otherSection.total },
//         },
//         salaryAfterDeductions: { total: salaryAfterDeductions },
//         totalIncome: { total: totalIncome },
//         netTaxableIncome: { total: netTaxableIncome },
//         totalTax: { total: Math.round(totalTax) },
//         rebate87A: { total: Math.round(rebate87A) },
//         netTaxPayable: { total: Math.round(netTaxPayable) },
//         taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//         taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//       },
//     };

//     console.log('IT Computation Data:', JSON.stringify(data, null, 2));
//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };

// export default getItComputationSheetDetails;

// import moment from 'moment';
// import PayrollDetails from '../../../../models/PayrollModule/Employeer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSetting/PayrollAcademicYear.js';
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
// import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
// import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';

// const getItComputationSheetDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear } = req.query;

//     console.log('School ID:', schoolId);
//     console.log('Employee ID:', employeeId);
//     console.log('Academic Year:', academicYear);

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({ hasError: true, message: 'Missing parameters' });
//     }

//     // Fetch employee details including joining date
//     const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
//     if (!employee) {
//       console.log('Employee not found');
//       return res.status(404).json({ hasError: true, message: 'Employee not found' });
//     }
//     console.log('Employee Details:', employee);
//     const joiningDate = moment(employee.joiningDate, 'YYYY-MM-DD');
  
//     // Fetch academic year details
//     const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
//     if (!academicYearData) {
//       return res.status(404).json({ hasError: true, message: 'Academic year not found' });
//     }
//     console.log('Academic Year Data:', academicYearData);

//     // Calculate total months based on joining date and academic year
//     const academicYearStart = moment(academicYearData.startDate, 'YYYY-MM-DD');
//     const academicYearEnd = moment(academicYearData.endDate, 'YYYY-MM-DD');
//     const startDate = moment.max(academicYearStart, joiningDate);
//     const totalMonths = academicYearEnd.diff(startDate, 'months') + 1;
//     console.log('Total Months:', totalMonths);

//     // Fetch payroll details for approved and paid months
//     const payrollRecords = await PayrollDetails.find({
//       schoolId,
//       academicYear,
//       approvalStatus: 'Approved',
//       'employees.employeeId': employeeId,
//       'employees.payrollStatus': 'Paid',
//     }).lean();
//     console.log('Payroll Records:', payrollRecords);

//     // Process payroll data for actual earnings
//     let paidMonthsCount = 0;
//     const ctcEarnings = {};
//     let totalActualSalary = 0;
//     const paidMonths = new Set(); // Track which months have been paid

//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         paidMonthsCount++;
//         paidMonths.add(record.month); // Add the month name to the set
//         Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
//           ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
//           totalActualSalary += value;
//         });
//       }
//     });
//     console.log('Paid Months Count:', paidMonthsCount);
//     console.log('Actual CTC Earnings:', ctcEarnings);

//     // Calculate remaining months
//     const remainingMonths = totalMonths - paidMonthsCount;
//     console.log('Remaining Months:', remainingMonths);

//     // Fetch EmployeeCTC for projections
//     const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (!ctc) {
//       return res.status(400).json({ hasError: true, message: 'CTC data not found' });
//     }

//     const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 
//                        'October', 'November', 'December', 'January', 'February', 'March'];

//     // Function to get CTC for a specific month
//     const getCtcForMonth = (monthName, ctcData) => {
//       const monthIndex = monthOrder.indexOf(monthName);
//       if (monthIndex === -1) {
//         throw new Error(`Invalid month: ${monthName}`);
//       }

//       const fiscalYearStart = parseInt(academicYear.split('-')[0]);
//       const calendarMonth = monthIndex + 3; // April is month 3 (0-based)
//       const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
//       const monthEnd = new Date(year, calendarMonth + 1, 0);

//       const applicableDate = new Date(ctcData.applicableDate);
//       let selectedCtc = null;
      
//       // Check current CTC first
//       if (applicableDate <= monthEnd) {
//         selectedCtc = {
//           components: ctcData.components,
//           totalAnnualCost: ctcData.totalAnnualCost,
//           applicableDate: ctcData.applicableDate,
//         };
//       } else {
//         const validHistory = ctcData.history
//           ? ctcData.history
//               .filter(h => new Date(h.applicableDate) <= monthEnd)
//               .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate))
//           : [];
//         if (validHistory.length > 0) {
//           selectedCtc = {
//             components: validHistory[0].components,
//             totalAnnualCost: validHistory[0].totalAnnualCost,
//             applicableDate: validHistory[0].applicableDate,
//           };
//         }
//       }

//       if (!selectedCtc) {
//         return {};
//       }

//       // Convert annual amounts to monthly
//       const monthlyCtc = {};
//       selectedCtc.components.forEach(comp => {
//         monthlyCtc[comp.ctcComponentName] = (comp.annualAmount / 12) || 0;
//       });
//       return monthlyCtc;
//     };

//     // Determine which months need projection
//     const joiningMonthIndex = monthOrder.indexOf(joiningDate.format('MMMM'));
//     const startProjectionIndex = Math.max(joiningMonthIndex, 0);
    
//     const allMonthsInScope = monthOrder.slice(startProjectionIndex);
    
//     const monthsToProject = allMonthsInScope.filter(month => !paidMonths.has(month));
    
//     // If we have remaining months to project, calculate projections
//     const projectedEarnings = {};
//     let totalProjectedSalary = 0;
//     const monthWiseProjections = {};

//     if (remainingMonths > 0 && monthsToProject.length > 0) {
//       monthsToProject.slice(0, remainingMonths).forEach(month => {
//         const monthlyCtc = getCtcForMonth(month, ctc);
//         monthWiseProjections[month] = { ...monthlyCtc, total: 0 };
        
//         Object.entries(monthlyCtc).forEach(([key, value]) => {
//           projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
//           totalProjectedSalary += value;
//           monthWiseProjections[month].total += value;
//         });
//       });

//       console.log('Month-Wise Projection Details:');
//       Object.entries(monthWiseProjections).forEach(([month, components]) => {
//         console.log(`  Month: ${month}`);
//         Object.entries(components).forEach(([component, amount]) => {
//           console.log(`    ${component}: ${amount.toFixed(2)}`);
//         });
//       });
//     } else {
//       console.log('Month-Wise Projection Details: No remaining months for projection.');
//     }

//     console.log('totalProjectedSalary', totalProjectedSalary);
//     console.log('projectedEarnings', projectedEarnings);

//     // [Rest of your code remains the same...]
//     // Include all the previous income, deductions, tax calculations etc.

//      const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
//     const hasPreviousIncome = !!previousIncomeRecord;
//     const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
//     const previousEmploymentPfExemption = hasPreviousIncome ? previousIncome['Professional Tax'] || 0 : 0;
//     const previousEmploymentPfContribution = hasPreviousIncome ? previousIncome['Employee PF Contribution'] || 0 : 0;
//     console.log('Previous Income:', previousIncome);
//     console.log('Previous Employment PF Exemption:', previousEmploymentPfExemption);
//     console.log('Previous Employment PF Contribution:', previousEmploymentPfContribution);

//     // Define valid income components for previous income calculation
//     const validIncomeComponents = [
//       'Basic Salary',
//       'HRA',
//       'lta',
//       'Education Allowance',
//       'Lunch Allowance',
//       'Conveyance Allowance',
//       'Other Allowance (Balance)',
//     ];

//     // Identify common components and aggregate other allowances
//     const ctcComponentNames = Object.keys(ctcEarnings);
//     const previousIncomeKeys = Object.keys(previousIncome);
//     const deductionComponents = ['Professional Tax', 'Employee PF Contribution'];
//     const commonComponents = ctcComponentNames.filter(name => previousIncomeKeys.includes(name));
//     const otherAllowanceComponents = previousIncomeKeys.filter(
//       name => !ctcComponentNames.includes(name) 
//     );

//     const otherAllowancesSum = otherAllowanceComponents.reduce(
//       (sum, key) => sum + (previousIncome[key] || 0),
//       0
//     );

//     const totalPreviousIncome = hasPreviousIncome
//       ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
//       : 0;

//     // Fetch rent details for HRA exemption
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     let hraExemption = 0;

//     if (rentDetail) {
//       hraExemption = rentDetail.hraExemption || 0;
//     }

//     // Fetch rent details for LTA exemption
//     const ltaDetail = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).lean();
//     let ltaExemption = 0;

//     if (ltaDetail) {
//       ltaExemption = ltaDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch details for telephone Allowance
//     const telephoneAllowanceDetail = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let telephoneAllowance = 0;

//     if (telephoneAllowanceDetail) {
//       telephoneAllowance = telephoneAllowanceDetail.categoryFinalDeduction || 0;
//     }

//     // Fetch  details for internet Allowance
//     const internetAllowanceDetail = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
//     let internetAllowance = 0;

//     if (internetAllowanceDetail) {
//       internetAllowance = internetAllowanceDetail.categoryFinalDeduction || 0;
//     }

//     const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
//     const deductions = {
//       standardDeduction: { total: 75000 },
//       section80C: {
//         total: itDeclaration?.section80C?.finalDeduction || 0,
//       },
//       section80D: { total: itDeclaration?.section80D?.finalDeduction || 0 },
//       otherSection: { total: itDeclaration?.otherSections?.finalDeduction || 0 },
//       hraExemption: { total: hraExemption },
//       ltaExemption: { total: ltaExemption },
//       telephoneAllowance: { total: telephoneAllowance },
//       internetAllowance: { total: internetAllowance },
//       professionalTaxExemption: {
//         previousIncome: hasPreviousIncome ? previousEmploymentPfExemption : null,
//         total: itDeclaration?.deductions?.professionalTaxExemption || 0,
//       },
//     };

//     const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

//     const salaryAfterDeductions =
//       totalIncome -
//       deductions.hraExemption.total -
//       deductions.ltaExemption.total -
//       deductions.internetAllowance.total -
//       deductions.telephoneAllowance.total -
//       deductions.standardDeduction.total -
//       (deductions.professionalTaxExemption.total + (deductions.professionalTaxExemption.previousIncome || 0));

//     const netTaxableIncome =
//       salaryAfterDeductions -
//       deductions.section80C.total -
//       deductions.section80D.total -
//       deductions.otherSection.total;

//     const taxRegime = employee.taxRegime || 'new';
//     let totalTax = 0;

//     if (taxRegime === 'new') {
//       if (netTaxableIncome <= 300000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 700000) {
//         totalTax = (netTaxableIncome - 300000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
//       } else if (netTaxableIncome <= 1200000) {
//         totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
//       } else if (netTaxableIncome <= 1500000) {
//         totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
//       } else {
//         totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     } else {
//       if (netTaxableIncome <= 250000) {
//         totalTax = 0;
//       } else if (netTaxableIncome <= 500000) {
//         totalTax = (netTaxableIncome - 250000) * 0.05;
//       } else if (netTaxableIncome <= 1000000) {
//         totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
//       } else {
//         totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
//       }
//       totalTax *= 1.04; // Add 4% Health and Education Cess
//     }

//     // Apply Rebate u/s 87A
//     const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
//     const netTaxPayable = totalTax - rebate87A;

//     // Fetch tax already deducted
//     let taxAlreadyDeducted = 0;
//     payrollRecords.forEach(record => {
//       const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
//       if (employeeData) {
//         taxAlreadyDeducted += employeeData.incomeTax || 0;
//       }
//     });

//     const data = {
//       employeeDetails: {
//         employeeName: employee.employeeName,
//         employeeId: employee.employeeId,
//         grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
//         jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
//         taxRegime,
//       },
//       hasPreviousIncome,
//       computation: {
//         months: {
//           previousIncome: hasPreviousIncome ? 0 : null,
//           actual: paidMonthsCount,
//           projection: remainingMonths,
//           total: totalMonths,
//         },
//         ctcComponents: commonComponents.map(name => ({
//           name,
//           previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
//           actual: ctcEarnings[name] || 0,
//           projection: projectedEarnings[name] || 0,
//           total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
//         })),
//         otherAllowances: hasPreviousIncome
//           ? {
//               previousIncome: otherAllowancesSum,
//               actual: 0,
//               projection: 0,
//               total: otherAllowancesSum,
//             }
//           : null,
//         incomeFromSalary: {
//           previousIncome: totalPreviousIncome,
//           actual: totalActualSalary,
//           projection: totalProjectedSalary,
//           total: totalIncome,
//         },
//         deductions: {
//           hraExemption: { total: deductions.hraExemption.total },
//           standardDeduction: { total: deductions.standardDeduction.total },
//           ltaExemption: { total: deductions.ltaExemption.total },
//           telephoneAllowance: { total: deductions.telephoneAllowance.total },
//           internetAllowance: { total: deductions.internetAllowance.total },
//           professionalTaxExemption: {
//             previousIncome: deductions.professionalTaxExemption.previousIncome,
//             total: deductions.professionalTaxExemption.total,
//           },
//           section80C: {
//             total: deductions.section80C.total,
//           },
//           section80D: { total: deductions.section80D.total },
//           otherSection: { total: deductions.otherSection.total },
//         },
//         salaryAfterDeductions: { total: salaryAfterDeductions },
//         totalIncome: { total: totalIncome },
//         netTaxableIncome: { total: netTaxableIncome },
//         totalTax: { total: Math.round(totalTax) },
//         rebate87A: { total: Math.round(rebate87A) },
//         netTaxPayable: { total: Math.round(netTaxPayable) },
//         taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
//         taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
//       },
//     };

//     return res.status(200).json({ hasError: false, data });
//   } catch (error) {
//     console.error('Error fetching IT computation sheet:', error);
//     return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
//   }
// };

// export default getItComputationSheetDetails;

import moment from 'moment';
import PayrollDetails from '../../../../models/PayrollModule/Employer/PayrollDetails.js';
// import PayrollAcademicYear from '../../../../models/PayrollModule/AdminSettings/PayrollAcademicYear.js';
import PayrollAcademicYear from '../../../../models/PayrollModule/PayrollAcademicYear.js';
import EmployeeRegistration from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
import PreviousEmploymentIncome from '../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';

const getItComputationSheetDetails = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear } = req.query;

    console.log('School ID:', schoolId);
    console.log('Employee ID:', employeeId);
    console.log('Academic Year:', academicYear);

    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({ hasError: true, message: 'Missing parameters' });
    }

    // Fetch employee details including joining date
    const employee = await EmployeeRegistration.findOne({ schoolId, employeeId }).lean();
    if (!employee) {
      console.log('Employee not found');
      return res.status(404).json({ hasError: true, message: 'Employee not found' });
    }
    console.log('Employee Details:', employee);
    const joiningDate = moment(employee.joiningDate, 'YYYY-MM-DD');

    // Fetch academic year details
    const academicYearData = await PayrollAcademicYear.findOne({ schoolId, academicYear }).lean();
    if (!academicYearData) {
      return res.status(404).json({ hasError: true, message: 'Academic year not found' });
    }
    console.log('Academic Year Data:', academicYearData);

    // Calculate total months based on joining date and academic year
    const academicYearStart = moment(academicYearData.startDate, 'YYYY-MM-DD');
    const academicYearEnd = moment(academicYearData.endDate, 'YYYY-MM-DD');
    const startDate = moment.max(academicYearStart, joiningDate);
    const totalMonths = academicYearEnd.diff(startDate, 'months') + 1;
    console.log('Total Months:', totalMonths);

    // Fetch payroll details for approved and paid months
    const payrollRecords = await PayrollDetails.find({
      schoolId,
      academicYear,
      approvalStatus: 'Approved',
      'employees.employeeId': employeeId,
      'employees.payrollStatus': 'Paid',
    }).lean();
    console.log('Payroll Records:', payrollRecords);

    // Process payroll data for actual earnings
    let paidMonthsCount = 0;
    const ctcEarnings = {};
    let totalActualSalary = 0;
    const paidMonths = new Set(); // Track which months have been paid

    payrollRecords.forEach(record => {
      const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
      if (employeeData) {
        paidMonthsCount++;
        paidMonths.add(record.month); // Add the month name to the set
        Object.entries(employeeData.ctc.componentEarnings.earnings || {}).forEach(([key, value]) => {
          ctcEarnings[key] = (ctcEarnings[key] || 0) + value;
          totalActualSalary += value;
        });
      }
    });
    console.log('Paid Months Count:', paidMonthsCount);
    console.log('Actual CTC Earnings:', ctcEarnings);

    // Calculate remaining months
    const remainingMonths = totalMonths - paidMonthsCount;
    console.log('Remaining Months:', remainingMonths);

    // Fetch EmployeeCTC for projections
    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).lean();
    if (!ctc) {
      return res.status(400).json({ hasError: true, message: 'CTC data not found' });
    }

    const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 
                       'October', 'November', 'December', 'January', 'February', 'March'];

    // Function to get CTC for a specific month
    const getCtcForMonth = (monthName, ctcData) => {
      const monthIndex = monthOrder.indexOf(monthName);
      if (monthIndex === -1) {
        throw new Error(`Invalid month: ${monthName}`);
      }

      const fiscalYearStart = parseInt(academicYear.split('-')[0]);
      const calendarMonth = monthIndex + 3; // April is month 3 (0-based)
      const year = monthIndex < 9 ? fiscalYearStart : fiscalYearStart + 1;
      const monthEnd = new Date(year, calendarMonth + 1, 0);

      const applicableDate = new Date(ctcData.applicableDate);
      let selectedCtc = null;
      
      // Check current CTC first
      if (applicableDate <= monthEnd) {
        selectedCtc = {
          components: ctcData.components,
          totalAnnualCost: ctcData.totalAnnualCost,
          applicableDate: ctcData.applicableDate,
        };
      } else {
        const validHistory = ctcData.history
          ? ctcData.history
              .filter(h => new Date(h.applicableDate) <= monthEnd)
              .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate))
          : [];
        if (validHistory.length > 0) {
          selectedCtc = {
            components: validHistory[0].components,
            totalAnnualCost: validHistory[0].totalAnnualCost,
            applicableDate: validHistory[0].applicableDate,
          };
        }
      }

      if (!selectedCtc) {
        return {};
      }

      // Convert annual amounts to monthly
      const monthlyCtc = {};
      selectedCtc.components.forEach(comp => {
        monthlyCtc[comp.ctcComponentName] = (comp.annualAmount / 12) || 0;
      });
      return monthlyCtc;
    };

    // Determine which months need projection
    const joiningMonthIndex = monthOrder.indexOf(joiningDate.format('MMMM'));
    const startProjectionIndex = Math.max(joiningMonthIndex, 0);
    
    const allMonthsInScope = monthOrder.slice(startProjectionIndex);
    
    const monthsToProject = allMonthsInScope.filter(month => !paidMonths.has(month));
    
    // Calculate projections
    const projectedEarnings = {};
    let totalProjectedSalary = 0;
    const monthWiseProjections = {};

    if (remainingMonths > 0 && monthsToProject.length > 0) {
      monthsToProject.slice(0, remainingMonths).forEach(month => {
        const monthlyCtc = getCtcForMonth(month, ctc);
        monthWiseProjections[month] = { ...monthlyCtc, total: 0 };
        
        Object.entries(monthlyCtc).forEach(([key, value]) => {
          projectedEarnings[key] = (projectedEarnings[key] || 0) + value;
          totalProjectedSalary += value;
          monthWiseProjections[month].total += value;
        });
      });

      console.log('Month-Wise Projection Details:');
      Object.entries(monthWiseProjections).forEach(([month, components]) => {
        console.log(`  Month: ${month}`);
        Object.entries(components).forEach(([component, amount]) => {
          console.log(`    ${component}: ${amount.toFixed(2)}`);
        });
      });
    } else {
      console.log('Month-Wise Projection Details: No remaining months for projection.');
    }

    console.log('totalProjectedSalary', totalProjectedSalary);
    console.log('projectedEarnings', projectedEarnings);

    // Fetch previous income
    const previousIncomeRecord = await PreviousEmploymentIncome.findOne({ schoolId, employeeId, academicYear }).lean();
    const hasPreviousIncome = !!previousIncomeRecord;
    const previousIncome = hasPreviousIncome ? previousIncomeRecord.incomeDetails || {} : {};
    const previousEmploymentPfExemption = hasPreviousIncome ? previousIncome['Professional Tax'] || 0 : 0;
    console.log('Previous Income:', previousIncome);

    // Define valid income components
    const validIncomeComponents = [
      'Basic Salary',
      'HRA',
      'LTA', // Changed to uppercase for consistency
      'Education Allowance',
      'Lunch Allowance',
      'Conveyance Allowance',
      'Other Allowance (Balance)',
      'Internet Allowance',
      'Telephone Allowance',
    ];

    // Get all unique CTC components from current earnings and projections
    const ctcComponentNames = [...new Set([
      ...Object.keys(ctcEarnings),
      ...Object.keys(projectedEarnings),
    ])].filter(name => validIncomeComponents.includes(name));

    // Calculate other allowances for previous income (components not in current CTC)
    const previousIncomeKeys = Object.keys(previousIncome);
    const otherAllowanceComponents = previousIncomeKeys.filter(
      name => !ctcComponentNames.includes(name) && validIncomeComponents.includes(name)
    );

    const otherAllowancesSum = otherAllowanceComponents.reduce(
      (sum, key) => sum + (previousIncome[key] || 0),
      0
    );

    const totalPreviousIncome = hasPreviousIncome
      ? validIncomeComponents.reduce((sum, key) => sum + (previousIncome[key] || 0), 0)
      : 0;

    // Fetch deductions
    const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
    let hraExemption = rentDetail ? rentDetail.hraExemption || 0 : 0;

    const ltaDetail = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).lean();
    let ltaExemption = ltaDetail ? ltaDetail.categoryFinalDeduction || 0 : 0;

    const telephoneAllowanceDetail = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
    let telephoneAllowance = telephoneAllowanceDetail ? telephoneAllowanceDetail.categoryFinalDeduction || 0 : 0;

    const internetAllowanceDetail = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).lean();
    let internetAllowance = internetAllowanceDetail ? internetAllowanceDetail.categoryFinalDeduction || 0 : 0;

    const itDeclaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).lean();
    const deductions = {
      standardDeduction: { total: 75000 },
      section80C: { total: itDeclaration?.section80C?.finalDeduction || 0 },
      section80D: { total: itDeclaration?.section80D?.finalDeduction || 0 },
      otherSection: { total: itDeclaration?.otherSections?.finalDeduction || 0 },
      hraExemption: { total: hraExemption },
      ltaExemption: { total: ltaExemption },
      telephoneAllowance: { total: telephoneAllowance },
      internetAllowance: { total: internetAllowance },
      professionalTaxExemption: {
        previousIncome: hasPreviousIncome ? previousEmploymentPfExemption : null,
        total: itDeclaration?.deductions?.professionalTaxExemption || 0,
      },
    };

    // Compute totals
    const totalIncome = totalActualSalary + totalProjectedSalary + totalPreviousIncome;

    const salaryAfterDeductions =
      totalIncome -
      deductions.hraExemption.total -
      deductions.ltaExemption.total -
      deductions.internetAllowance.total -
      deductions.telephoneAllowance.total -
      deductions.standardDeduction.total -
      (deductions.professionalTaxExemption.total + (deductions.professionalTaxExemption.previousIncome || 0));

    const netTaxableIncome =
      salaryAfterDeductions -
      deductions.section80C.total -
      deductions.section80D.total -
      deductions.otherSection.total;

    // Tax calculation (Indian tax slabs for 2025-26)
    const taxRegime = employee.taxRegime || 'new';
    let totalTax = 0;

    if (taxRegime === 'new') {
      if (netTaxableIncome <= 300000) {
        totalTax = 0;
      } else if (netTaxableIncome <= 700000) {
        totalTax = (netTaxableIncome - 300000) * 0.05;
      } else if (netTaxableIncome <= 1000000) {
        totalTax = 20000 + (netTaxableIncome - 700000) * 0.1;
      } else if (netTaxableIncome <= 1200000) {
        totalTax = 50000 + (netTaxableIncome - 1000000) * 0.15;
      } else if (netTaxableIncome <= 1500000) {
        totalTax = 80000 + (netTaxableIncome - 1200000) * 0.2;
      } else {
        totalTax = 140000 + (netTaxableIncome - 1500000) * 0.3;
      }
      totalTax *= 1.04; // Add 4% Health and Education Cess
    } else {
      if (netTaxableIncome <= 250000) {
        totalTax = 0;
      } else if (netTaxableIncome <= 500000) {
        totalTax = (netTaxableIncome - 250000) * 0.05;
      } else if (netTaxableIncome <= 1000000) {
        totalTax = 12500 + (netTaxableIncome - 500000) * 0.2;
      } else {
        totalTax = 112500 + (netTaxableIncome - 1000000) * 0.3;
      }
      totalTax *= 1.04; // Add 4% Health and Education Cess
    }

    // Apply Rebate u/s 87A
    const rebate87A = netTaxableIncome <= (taxRegime === 'new' ? 700000 : 500000) ? totalTax : 0;
    const netTaxPayable = totalTax - rebate87A;

    // Fetch tax already deducted
    let taxAlreadyDeducted = 0;
    payrollRecords.forEach(record => {
      const employeeData = record.employees.find(emp => emp.employeeId === employeeId && emp.payrollStatus === 'Paid');
      if (employeeData) {
        taxAlreadyDeducted += employeeData.incomeTax || 0;
      }
    });

    const data = {
      employeeDetails: {
        employeeName: employee.employeeName,
        employeeId: employee.employeeId,
        grade: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.grade || 'N/A',
        jobDesignation: employee.academicYearDetails?.find(d => d.academicYear === academicYear)?.jobDesignation || 'N/A',
        taxRegime,
      },
      hasPreviousIncome,
      computation: {
        months: {
          previousIncome: hasPreviousIncome ? 0 : null,
          actual: paidMonthsCount,
          projection: remainingMonths,
          total: totalMonths,
        },
        ctcComponents: ctcComponentNames.map(name => ({
          name,
          previousIncome: hasPreviousIncome ? previousIncome[name] || 0 : null,
          actual: ctcEarnings[name] || 0,
          projection: projectedEarnings[name] || 0,
          total: (ctcEarnings[name] || 0) + (projectedEarnings[name] || 0) + (hasPreviousIncome ? previousIncome[name] || 0 : 0),
        })),
        otherAllowances: hasPreviousIncome && otherAllowancesSum > 0
          ? {
              previousIncome: otherAllowancesSum,
              actual: 0,
              projection: 0,
              total: otherAllowancesSum,
            }
          : null,
        incomeFromSalary: {
          previousIncome: totalPreviousIncome,
          actual: totalActualSalary,
          projection: totalProjectedSalary,
          total: totalIncome,
        },
        deductions: {
          hraExemption: { total: deductions.hraExemption.total },
          standardDeduction: { total: deductions.standardDeduction.total },
          ltaExemption: { total: deductions.ltaExemption.total },
          telephoneAllowance: { total: deductions.telephoneAllowance.total },
          internetAllowance: { total: deductions.internetAllowance.total },
          professionalTaxExemption: {
            previousIncome: deductions.professionalTaxExemption.previousIncome,
            total: deductions.professionalTaxExemption.total,
          },
          section80C: { total: deductions.section80C.total },
          section80D: { total: deductions.section80D.total },
          otherSection: { total: deductions.otherSection.total },
        },
        salaryAfterDeductions: { total: salaryAfterDeductions },
        totalIncome: { total: totalIncome },
        netTaxableIncome: { total: netTaxableIncome },
        totalTax: { total: Math.round(totalTax) },
        rebate87A: { total: Math.round(rebate87A) },
        netTaxPayable: { total: Math.round(netTaxPayable) },
        taxAlreadyDeducted: { total: Math.round(taxAlreadyDeducted) },
        taxYetToBeDeducted: { total: Math.round(netTaxPayable - taxAlreadyDeducted) },
      },
    };

    return res.status(200).json({ hasError: false, data });
  } catch (error) {
    console.error('Error fetching IT computation sheet:', error);
    return res.status(500).json({ hasError: true, message: 'Internal Server Error' });
  }
};

export default getItComputationSheetDetails;