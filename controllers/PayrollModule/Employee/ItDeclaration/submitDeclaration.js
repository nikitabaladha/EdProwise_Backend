// // import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// // import fs from 'fs';
// // import path from 'path';

// // const submitDeclaration = async (req, res) => {
// //   console.log('Reached submitDeclaration controller'); // Debugging log
// //   try {
// //     const { schoolId, employeeId } = req.params;
// //     const { academicYear, taxRegime, panNumber } = req.body;

// //     // Validate required fields
// //     if (!schoolId || !employeeId || !academicYear || !taxRegime || !panNumber) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Missing required fields'
// //       });
// //     }

// //     // Group files by field name
// //     const filesByField = {};
// //     (req.files || []).forEach(file => {
// //       const match = file.fieldname.match(/(section80CProofs|section80DProofs)\[(\d+)\]/);
// //       if (match) {
// //         const fieldBase = match[1];
// //         const index = parseInt(match[2]);
// //         if (!filesByField[fieldBase]) filesByField[fieldBase] = {};
// //         filesByField[fieldBase][index] = file;
// //       }
// //     });

// //     // Process Section 80C
// //     const section80CItems = [];
// //     let section80CTotal = 0;

// //     for (let i = 0; i < 8; i++) {
// //       const section = req.body.section80C?.[i]?.section;
// //       const category = req.body.section80C?.[i]?.category;
// //       const proofSubmitted = parseFloat(req.body.section80C?.[i]?.proofSubmitted) || 0;
// //       const status = req.body.section80C?.[i]?.status || 'Pending';
// //       const adminRemarks = req.body.section80C?.[i]?.adminRemarks || '';
// //       const proofDocument = filesByField?.section80CProofs?.[i]?.path;

// //       // Validate required fields
// //       if (!section || !category) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Missing section or category for section80C[${i}]`
// //         });
// //       }

// //       // Validate proof document
// //       if (proofSubmitted > 0 && !proofDocument) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Proof document required for section80C[${i}] with proofSubmitted > 0`
// //         });
// //       }

// //       section80CItems.push({
// //         section,
// //         category,
// //         proofSubmitted,
// //         proofDocument,
// //         status,
// //         adminRemarks
// //       });

// //       section80CTotal += proofSubmitted;
// //     }

// //     const section80CFinalDeduction = Math.min(section80CTotal, 150000);

// //     // Process Section 80D with mutual exclusion
// //     const section80DItems = [];
// //     let section80DTotal = 0;
// //     let section80DFinalDeduction = 0;
// //     let hasSelfGroupValue = false;
// //     let hasParentsGroupValue = false;

// //     for (let i = 0; i < 7; i++) {
// //       const section = req.body.section80D?.[i]?.section;
// //       const category = req.body.section80D?.[i]?.category;
// //       const categoryLimit = parseFloat(req.body.section80D?.[i]?.categoryLimit) || 0;
// //       const proofSubmitted = parseFloat(req.body.section80D?.[i]?.proofSubmitted) || 0;
// //       const status = req.body.section80D?.[i]?.status || 'Pending';
// //       const adminRemarks = req.body.section80D?.[i]?.adminRemarks || '';
// //       const categoryFinalDeduction = parseFloat(req.body[' section80D']?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
// //       const proofDocument = filesByField?.section80DProofs?.[i]?.path;

// //       // Validate required fields
// //       if (!section || !category || !categoryLimit) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Missing section, category, or categoryLimit for section80D[${i}]`
// //         });
// //       }

// //       // Validate proof document
// //       if (proofSubmitted > 0 && !proofDocument) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Proof document required for section80D[${i}] with proofSubmitted > 0`
// //         });
// //       }

// //       // Mutual exclusion logic
// //       const isSelfGroup = [0, 1, 4].includes(i);
// //       const isParentsGroup = [2, 3, 5].includes(i);

// //       if ((isSelfGroup && hasSelfGroupValue && proofSubmitted > 0) || 
// //           (isParentsGroup && hasParentsGroupValue && proofSubmitted > 0)) {
// //         continue;
// //       }

// //       if (proofSubmitted > 0) {
// //         if (isSelfGroup) hasSelfGroupValue = true;
// //         if (isParentsGroup) hasParentsGroupValue = true;
// //       }

// //       section80DItems.push({
// //         section,
// //         category,
// //         categoryLimit,
// //         categoryFinalDeduction,
// //         proofSubmitted,
// //         proofDocument,
// //         status,
// //         adminRemarks
// //       });

// //       section80DTotal += proofSubmitted;
// //       section80DFinalDeduction += categoryFinalDeduction;
// //     }

// //     // Create/update the declaration
// //     const declarationData = {
// //       schoolId,
// //       employeeId,
// //       academicYear,
// //       taxRegime,
// //       panNumber,
// //       section80C: {
// //         items: section80CItems,
// //         sectionLimit: 150000,
// //         finalDeduction: section80CFinalDeduction
// //       },
// //       section80D: {
// //         items: section80DItems,
// //         finalDeduction: section80DFinalDeduction
// //       },
// //       status: 'Verification Pending',
// //       submittedAt: new Date()
// //     };

// //     const declaration = await ItDeclaration.findOneAndUpdate(
// //       { schoolId, employeeId, academicYear },
// //       declarationData,
// //       { upsert: true, new: true, runValidators: true }
// //     );

// //     res.status(200).json({
// //       success: true,
// //       data: declaration,
// //       message: 'IT declaration submitted successfully'
// //     });

// //   } catch (error) {
// //     // Cleanup uploaded files on error
// //     if (req.files) {
// //       req.files.forEach(file => {
// //         try {
// //           if (file?.path && fs.existsSync(file.path)) {
// //             fs.unlinkSync(file.path);
// //           }
// //         } catch (err) {
// //           console.error('Error cleaning up file:', err);
// //         }
// //       });
// //     }

// //     console.error('Error submitting IT declaration:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: error.message || 'Internal server error'
// //     });
// //   }
// // };

// // export default submitDeclaration;

// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import fs from 'fs';
// import path from 'path';

// const submitDeclaration = async (req, res) => {
//   console.log('Reached submitDeclaration controller');
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear, taxRegime, panNumber } = req.body;

//     // Validate required fields
//     if (!schoolId || !employeeId || !academicYear || !taxRegime || !panNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     // Group files by field name
//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/(section80CProofs|section80DProofs|otherSectionsProofs)\[(\d+)\]/);
//       if (match) {
//         const fieldBase = match[1];
//         const index = parseInt(match[2]);
//         if (!filesByField[fieldBase]) filesByField[fieldBase] = {};
//         filesByField[fieldBase][index] = file;
//       }
//     });

//     // Process Section 80C
//     const section80CItems = [];
//     let section80CTotal = 0;

//     for (let i = 0; i < 10; i++) {
//       const section = req.body.section80C?.[i]?.section;
//       const category = req.body.section80C?.[i]?.category;
//       const proofSubmitted = parseFloat(req.body.section80C?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80C?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80C?.[i]?.adminRemarks || '';
//       const proofDocument = filesByField?.section80CProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for section80C[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80C[${i}] with proofSubmitted > 0`
//         });
//       }

//       section80CItems.push({
//         section,
//         category,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80CTotal += proofSubmitted;
//     }

//     const section80CFinalDeduction = Math.min(section80CTotal, 150000);

//     // Process Section 80D with mutual exclusion
//     const section80DItems = [];
//     let section80DTotal = 0;
//     let section80DFinalDeduction = 0;
//     let hasSelfGroupValue = false;
//     let hasParentsGroupValue = false;

//     for (let i = 0; i < 7; i++) {
//       const section = req.body.section80D?.[i]?.section;
//       const category = req.body.section80D?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.section80D?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.section80D?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80D?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80D?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.section80D?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
//       const proofDocument = filesByField?.section80DProofs?.[i]?.path;

//       if (!section || !category || !categoryLimit) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section, category, or categoryLimit for section80D[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80D[${i}] with proofSubmitted > 0`
//         });
//       }

//       const isSelfGroup = [0, 1, 4].includes(i);
//       const isParentsGroup = [2, 3, 5].includes(i);

//       if ((isSelfGroup && hasSelfGroupValue && proofSubmitted > 0) || 
//           (isParentsGroup && hasParentsGroupValue && proofSubmitted > 0)) {
//         continue;
//       }

//       if (proofSubmitted > 0) {
//         if (isSelfGroup) hasSelfGroupValue = true;
//         if (isParentsGroup) hasParentsGroupValue = true;
//       }

//       section80DItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80DTotal += proofSubmitted;
//       section80DFinalDeduction += categoryFinalDeduction;
//     }

//     // Process Other Sections
//     const otherSectionsItems = [];
//     let otherSectionsTotal = 0;
//     let otherSectionsFinalDeduction = 0;

//     for (let i = 0; i < 9; i++) {
//       const section = req.body.otherSections?.[i]?.section;
//       const category = req.body.otherSections?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.otherSections?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.otherSections?.[i]?.proofSubmitted) || 0;
//       const status = req.body.otherSections?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.otherSections?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.otherSections?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
//       const proofDocument = filesByField?.otherSectionsProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for otherSections[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for otherSections[${i}] with proofSubmitted > 0`
//         });
//       }

//       otherSectionsItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       otherSectionsTotal += proofSubmitted;
//       otherSectionsFinalDeduction += categoryFinalDeduction;
//     }

//     // Create/update the declaration
//     const declarationData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       taxRegime,
//       panNumber,
//       section80C: {
//         items: section80CItems,
//         sectionLimit: 150000,
//         finalDeduction: section80CFinalDeduction
//       },
//       section80D: {
//         items: section80DItems,
//         finalDeduction: section80DFinalDeduction
//       },
//       otherSections: {
//         items: otherSectionsItems
//       },
//       status: 'Verification Pending',
//       submittedAt: new Date()
//     };

//     const declaration = await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       declarationData,
//       { upsert: true, new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: declaration,
//       message: 'IT declaration submitted successfully'
//     });

//   } catch (error) {
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

//     console.error('Error submitting IT declaration:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitDeclaration;

// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import fs from 'fs';
// import path from 'path';

// const submitDeclaration = async (req, res) => {
//   console.log('Reached submitDeclaration controller');
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear, taxRegime, panNumber } = req.body;

//     if (!schoolId || !employeeId || !academicYear || !taxRegime || !panNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/(section80CProofs|section80DProofs|otherSectionsProofs)\[(\d+)\]/);
//       if (match) {
//         const fieldBase = match[1];
//         const index = parseInt(match[2]);
//         if (!filesByField[fieldBase]) filesByField[fieldBase] = {};
//         filesByField[fieldBase][index] = file;
//       }
//     });

//     const section80CItems = [];
//     let section80CTotal = 0;

//     for (let i = 0; i < 10; i++) {
//       const section = req.body.section80C?.[i]?.section;
//       const category = req.body.section80C?.[i]?.category;
//       const proofSubmitted = parseFloat(req.body.section80C?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80C?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80C?.[i]?.adminRemarks || '';
//       const proofDocument = filesByField?.section80CProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for section80C[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80C[${i}] with proofSubmitted > 0`
//         });
//       }

//       section80CItems.push({
//         section,
//         category,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80CTotal += proofSubmitted;
//     }

//     const section80CFinalDeduction = Math.min(section80CTotal, 150000);

//     const section80DItems = [];
//     let section80DTotal = 0;
//     let section80DFinalDeduction = 0;
//     let hasSelfGroupValue = false;
//     let hasParentsGroupValue = false;

//     for (let i = 0; i < 7; i++) {
//       const section = req.body.section80D?.[i]?.section;
//       const category = req.body.section80D?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.section80D?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.section80D?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80D?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80D?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.section80D?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
//       const proofDocument = filesByField?.section80DProofs?.[i]?.path;

//       if (!section || !category || !categoryLimit) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section, category, or categoryLimit for section80D[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80D[${i}] with proofSubmitted > 0`
//         });
//       }

//       const isSelfGroup = [0, 1, 4].includes(i);
//       const isParentsGroup = [2, 3, 5].includes(i);

//       if ((isSelfGroup && hasSelfGroupValue && proofSubmitted > 0) || 
//           (isParentsGroup && hasParentsGroupValue && proofSubmitted > 0)) {
//         continue;
//       }

//       if (proofSubmitted > 0) {
//         if (isSelfGroup) hasSelfGroupValue = true;
//         if (isParentsGroup) hasParentsGroupValue = true;
//       }

//       section80DItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80DTotal += proofSubmitted;
//       section80DFinalDeduction += categoryFinalDeduction;
//     }

//     const otherSectionsItems = [];
//     let otherSectionsTotal = 0;
//     let otherSectionsFinalDeduction = 0;

//     for (let i = 0; i < 9; i++) {
//       const section = req.body.otherSections?.[i]?.section;
//       const category = req.body.otherSections?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.otherSections?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.otherSections?.[i]?.proofSubmitted) || 0;
//       const status = req.body.otherSections?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.otherSections?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.otherSections?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
//       const proofDocument = filesByField?.otherSectionsProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for otherSections[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for otherSections[${i}] with proofSubmitted > 0`
//         });
//       }

//       otherSectionsItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       otherSectionsTotal += proofSubmitted;
//       otherSectionsFinalDeduction += categoryFinalDeduction;
//     }

//     const declarationData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       taxRegime,
//       panNumber,
//       section80C: {
//         items: section80CItems,
//         sectionLimit: 150000,
//         finalDeduction: section80CFinalDeduction
//       },
//       section80D: {
//         items: section80DItems,
//         finalDeduction: section80DFinalDeduction
//       },
//       otherSections: {
//         items: otherSectionsItems,
//         finalDeduction: otherSectionsFinalDeduction
//       },
//       status: 'Verification Pending',
//       submittedAt: new Date()
//     };

//     const declaration = await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       declarationData,
//       { upsert: true, new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: declaration,
//       message: 'IT declaration submitted successfully'
//     });

//   } catch (error) {
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

//     console.error('Error submitting IT declaration:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitDeclaration;

// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import fs from 'fs';
// import path from 'path';

// const submitDeclaration = async (req, res) => {
//   console.log('Reached submitDeclaration controller');
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear, taxRegime, panNumber } = req.body;

//     if (!schoolId || !employeeId || !academicYear || !taxRegime || !panNumber) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     const filesByField = {};
//     (req.files || []).forEach(file => {
//       const match = file.fieldname.match(/(section80CProofs|section80DProofs|otherSectionsProofs)\[(\d+)\]/);
//       if (match) {
//         const fieldBase = match[1];
//         const index = parseInt(match[2]);
//         if (!filesByField[fieldBase]) filesByField[fieldBase] = {};
//         filesByField[fieldBase][index] = file;
//       }
//     });

//     const section80CItems = [];
//     let section80CTotal = 0;

//     for (let i = 0; i < 10; i++) {
//       const section = req.body.section80C?.[i]?.section;
//       const category = req.body.section80C?.[i]?.category;
//       const proofSubmitted = parseFloat(req.body.section80C?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80C?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80C?.[i]?.adminRemarks || '';
//       const proofDocument = filesByField?.section80CProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for section80C[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80C[${i}] with proofSubmitted > 0`
//         });
//       }

//       section80CItems.push({
//         section,
//         category,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80CTotal += proofSubmitted;
//     }

//     const section80CFinalDeduction = Math.min(section80CTotal, 150000);

//     const section80DItems = [];
//     let section80DTotal = 0;
//     let section80DFinalDeduction = 0;
//     let hasSelfGroupValue = false;
//     let hasParentsGroupValue = false;

//     for (let i = 0; i < 7; i++) {
//       const section = req.body.section80D?.[i]?.section;
//       const category = req.body.section80D?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.section80D?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.section80D?.[i]?.proofSubmitted) || 0;
//       const status = req.body.section80D?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.section80D?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.section80D?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
//       const proofDocument = filesByField?.section80DProofs?.[i]?.path;

//       if (!section || !category || !categoryLimit) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section, category, or categoryLimit for section80D[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for section80D[${i}] with proofSubmitted > 0`
//         });
//       }

//       const isSelfGroup = [0, 1, 4].includes(i);
//       const isParentsGroup = [2, 3, 5].includes(i);

//       if ((isSelfGroup && hasSelfGroupValue && proofSubmitted > 0) || 
//           (isParentsGroup && hasParentsGroupValue && proofSubmitted > 0)) {
//         continue;
//       }

//       if (proofSubmitted > 0) {
//         if (isSelfGroup) hasSelfGroupValue = true;
//         if (isParentsGroup) hasParentsGroupValue = true;
//       }

//       section80DItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       section80DTotal += proofSubmitted;
//       section80DFinalDeduction += categoryFinalDeduction;
//     }

//     const otherSectionsItems = [];
//     let otherSectionsTotal = 0;
//     let otherSectionsFinalDeduction = 0;

//     for (let i = 0; i < 9; i++) {
//       const section = req.body.otherSections?.[i]?.section;
//       const category = req.body.otherSections?.[i]?.category;
//       const categoryLimit = parseFloat(req.body.otherSections?.[i]?.categoryLimit) || 0;
//       const proofSubmitted = parseFloat(req.body.otherSections?.[i]?.proofSubmitted) || 0;
//       const status = req.body.otherSections?.[i]?.status || 'Pending';
//       const adminRemarks = req.body.otherSections?.[i]?.adminRemarks || '';
//       const categoryFinalDeduction = parseFloat(req.body.otherSections?.[i]?.categoryFinalDeduction) || (categoryLimit > 0 ? Math.min(proofSubmitted, categoryLimit) : proofSubmitted);
//       const proofDocument = filesByField?.otherSectionsProofs?.[i]?.path;

//       if (!section || !category) {
//         return res.status(400).json({
//           success: false,
//           message: `Missing section or category for otherSections[${i}]`
//         });
//       }

//       if (proofSubmitted > 0 && !proofDocument) {
//         return res.status(400).json({
//           success: false,
//           message: `Proof document required for otherSections[${i}] with proofSubmitted > 0`
//         });
//       }

//       otherSectionsItems.push({
//         section,
//         category,
//         categoryLimit,
//         categoryFinalDeduction,
//         proofSubmitted,
//         proofDocument,
//         status,
//         adminRemarks
//       });

//       otherSectionsTotal += proofSubmitted;
//       otherSectionsFinalDeduction += categoryFinalDeduction;
//     }

//     // Fetch HRA exemption for the ongoing month
//     const monthOrder = [
//       'April', 'May', 'June', 'July', 'August', 'September',
//       'October', 'November', 'December', 'January', 'February', 'March'
//     ];
//     const currentDate = new Date();
//     const fiscalYearStart = parseInt(academicYear.split('-')[0]); // e.g., 2025
//     const currentMonthIndex = (currentDate.getMonth() + 9) % 12; // Adjust for fiscal year (April=0)
//     const currentYear = currentDate.getFullYear();
//     const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
//     const ongoingMonth = monthOrder[fiscalMonthIndex];
//     const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

//     let hraExemptionProofSubmitted = 0;
//     const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
//     if (rentDetail && rentDetail.rentDetails) {
//       const ongoingMonthDetail = rentDetail.rentDetails.find(detail => detail.month === ongoingMonth);
//       if (ongoingMonthDetail) {
//         hraExemptionProofSubmitted = ongoingMonthDetail.hraExemption || 0;
//       } else if (previousMonth) {
//         const previousMonthDetail = rentDetail.rentDetails.find(detail => detail.month === previousMonth);
//         if (previousMonthDetail) {
//           hraExemptionProofSubmitted = previousMonthDetail.hraExemption || 0;
//         }
//       }
//     }

//     const declarationData = {
//       schoolId,
//       employeeId,
//       academicYear,
//       taxRegime,
//       panNumber,
//       section80C: {
//         items: section80CItems,
//         sectionLimit: 150000,
//         finalDeduction: section80CFinalDeduction
//       },
//       section80D: {
//         items: section80DItems,
//         finalDeduction: section80DFinalDeduction
//       },
//       otherSections: {
//         items: otherSectionsItems,
//         finalDeduction: otherSectionsFinalDeduction
//       },
//       hraExemption: {
//         rentDetailsId: rentDetail?._id,
//         proofSubmitted: hraExemptionProofSubmitted
//       },
//       status: 'Verification Pending',
//       submittedAt: new Date()
//     };

//     const declaration = await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       declarationData,
//       { upsert: true, new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       data: declaration,
//       message: 'IT declaration submitted successfully'
//     });

//   } catch (error) {
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

//     console.error('Error submitting IT declaration:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default submitDeclaration;

import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import fs from 'fs';
import path from 'path';

const submitDeclaration = async (req, res) => {
  console.log('Reached submitDeclaration controller');
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear, taxRegime, panNumber,  acceptTermsAndConditions } = req.body;
    
    if (!schoolId || !employeeId || !academicYear || !taxRegime || !panNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (acceptTermsAndConditions !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'You must accept the terms and conditions'
      });
    }

    const filesByField = {};
    (req.files || []).forEach(file => {
      const match = file.fieldname.match(/(section80CProofs|section80DProofs|otherSectionsProofs)\[(\d+)\]/);
      if (match) {
        const fieldBase = match[1];
        const index = parseInt(match[2]);
        if (!filesByField[fieldBase]) filesByField[fieldBase] = {};
        filesByField[fieldBase][index] = file;
      }
    });

    const section80CItems = [];
    let section80CTotal = 0;

    for (let i = 0; i < 10; i++) {
      const section = req.body.section80C?.[i]?.section;
      const category = req.body.section80C?.[i]?.category;
      const proofSubmitted = parseFloat(req.body.section80C?.[i]?.proofSubmitted) || 0;
      const status = req.body.section80C?.[i]?.status || 'Pending';
      const adminRemarks = req.body.section80C?.[i]?.adminRemarks || '';
      const existingDocument = req.body.section80C?.[i]?.existingDocument;
      const newFile = filesByField?.section80CProofs?.[i]?.path;

      if (!section || !category) {
        return res.status(400).json({
          success: false,
          message: `Missing section or category for section80C[${i}]`
        });
      }

      if (proofSubmitted > 0 && !newFile && !existingDocument) {
        return res.status(400).json({
          success: false,
          message: `Proof document required for section80C[${i}] with proofSubmitted > 0`
        });
      }

      // If a new file is uploaded, delete the old file
      if (newFile && existingDocument && fs.existsSync(existingDocument)) {
        try {
          fs.unlinkSync(existingDocument);
        } catch (err) {
          console.error(`Error deleting old file ${existingDocument}:`, err);
        }
      }

      section80CItems.push({
        section,
        category,
        proofSubmitted,
        proofDocument: newFile || existingDocument,
        status,
        adminRemarks
      });

      section80CTotal += proofSubmitted;
    }

    const section80CFinalDeduction = Math.min(section80CTotal, 150000);

    const section80DItems = [];
    let section80DTotal = 0;
    let section80DFinalDeduction = 0;
    let hasSelfGroupValue = false;
    let hasParentsGroupValue = false;

    for (let i = 0; i < 7; i++) {
      const section = req.body.section80D?.[i]?.section;
      const category = req.body.section80D?.[i]?.category;
      const categoryLimit = parseFloat(req.body.section80D?.[i]?.categoryLimit) || 0;
      const proofSubmitted = parseFloat(req.body.section80D?.[i]?.proofSubmitted) || 0;
      const status = req.body.section80D?.[i]?.status || 'Pending';
      const adminRemarks = req.body.section80D?.[i]?.adminRemarks || '';
      const categoryFinalDeduction = parseFloat(req.body.section80D?.[i]?.categoryFinalDeduction) || Math.min(proofSubmitted, categoryLimit);
      const existingDocument = req.body.section80D?.[i]?.existingDocument;
      const newFile = filesByField?.section80DProofs?.[i]?.path;

      if (!section || !category || !categoryLimit) {
        return res.status(400).json({
          success: false,
          message: `Missing section, category, or categoryLimit for section80D[${i}]`
        });
      }

      if (proofSubmitted > 0 && !newFile && !existingDocument) {
        return res.status(400).json({
          success: false,
          message: `Proof document required for section80D[${i}] with proofSubmitted > 0`
        });
      }

      // If a new file is uploaded, delete the old file
      if (newFile && existingDocument && fs.existsSync(existingDocument)) {
        try {
          fs.unlinkSync(existingDocument);
        } catch (err) {
          console.error(`Error deleting old file ${existingDocument}:`, err);
        }
      }

      const isSelfGroup = [0, 1, 4].includes(i);
      const isParentsGroup = [2, 3, 5].includes(i);

      if ((isSelfGroup && hasSelfGroupValue && proofSubmitted > 0) || 
          (isParentsGroup && hasParentsGroupValue && proofSubmitted > 0)) {
        continue;
      }

      if (proofSubmitted > 0) {
        if (isSelfGroup) hasSelfGroupValue = true;
        if (isParentsGroup) hasParentsGroupValue = true;
      }

      section80DItems.push({
        section,
        category,
        categoryLimit,
        categoryFinalDeduction,
        proofSubmitted,
        proofDocument: newFile || existingDocument,
        status,
        adminRemarks
      });

      section80DTotal += proofSubmitted;
      section80DFinalDeduction += categoryFinalDeduction;
    }

    const otherSectionsItems = [];
    let otherSectionsTotal = 0;
    let otherSectionsFinalDeduction = 0;

    for (let i = 0; i < 9; i++) {
      const section = req.body.otherSections?.[i]?.section;
      const category = req.body.otherSections?.[i]?.category;
      const categoryLimit = parseFloat(req.body.otherSections?.[i]?.categoryLimit) || 0;
      const proofSubmitted = parseFloat(req.body.otherSections?.[i]?.proofSubmitted) || 0;
      const status = req.body.otherSections?.[i]?.status || 'Pending';
      const adminRemarks = req.body.otherSections?.[i]?.adminRemarks || '';
      const categoryFinalDeduction = parseFloat(req.body.otherSections?.[i]?.categoryFinalDeduction) || (categoryLimit > 0 ? Math.min(proofSubmitted, categoryLimit) : proofSubmitted);
      const existingDocument = req.body.otherSections?.[i]?.existingDocument;
      const newFile = filesByField?.otherSectionsProofs?.[i]?.path;

      if (!section || !category) {
        return res.status(400).json({
          success: false,
          message: `Missing section or category for otherSections[${i}]`
        });
      }

      if (proofSubmitted > 0 && !newFile && !existingDocument) {
        return res.status(400).json({
          success: false,
          message: `Proof document required for otherSections[${i}] with proofSubmitted > 0`
        });
      }

      // If a new file is uploaded, delete the old file
      if (newFile && existingDocument && fs.existsSync(existingDocument)) {
        try {
          fs.unlinkSync(existingDocument);
        } catch (err) {
          console.error(`Error deleting old file ${existingDocument}:`, err);
        }
      }

      otherSectionsItems.push({
        section,
        category,
        categoryLimit,
        categoryFinalDeduction,
        proofSubmitted,
        proofDocument: newFile || existingDocument,
        status,
        adminRemarks
      });

      otherSectionsTotal += proofSubmitted;
      otherSectionsFinalDeduction += categoryFinalDeduction;
    }

    // Fetch HRA exemption for the ongoing month
    const monthOrder = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];
    const currentDate = new Date();
    const fiscalYearStart = parseInt(academicYear.split('-')[0]);
    const currentMonthIndex = (currentDate.getMonth() + 9) % 12;
    const fiscalMonthIndex = currentMonthIndex >= 3 ? currentMonthIndex - 3 : currentMonthIndex + 9;
    const ongoingMonth = monthOrder[fiscalMonthIndex];
    const previousMonth = fiscalMonthIndex > 0 ? monthOrder[fiscalMonthIndex - 1] : null;

    let hraExemptionProofSubmitted = 0;
    let rentDetailStatus = "Pending";
    const rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).lean();
    if (rentDetail && rentDetail.rentDetails) {
      
      hraExemptionProofSubmitted = rentDetail.hraExemption;
      rentDetailStatus = rentDetail.status;
    }

    const declarationData = {
      schoolId,
      employeeId,
      academicYear,
      taxRegime,
      panNumber,
      acceptTermsAndConditions: acceptTermsAndConditions === 'true',
      section80C: {
        items: section80CItems,
        sectionLimit: 150000,
        finalDeduction: section80CFinalDeduction
      },
      section80D: {
        items: section80DItems,
        finalDeduction: section80DFinalDeduction
      },
      otherSections: {
        items: otherSectionsItems,
        finalDeduction: otherSectionsFinalDeduction
      },
      hraExemption: {
        rentDetailsId: rentDetail?._id,
        proofSubmitted: hraExemptionProofSubmitted,
        status: rentDetailStatus,
      },
      status: 'Verification Pending',
      submittedAt: new Date()
    };

    const declaration = await ItDeclaration.findOneAndUpdate(
      { schoolId, employeeId, academicYear },
      declarationData,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: declaration,
      message: 'IT declaration submitted successfully'
    });

  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error('Error cleaning up file:', err);
        }
      });
    }

    console.error('Error submitting IT declaration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

export default submitDeclaration;