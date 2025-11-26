// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';

// const updateItDeclaration = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear, section80C, section80D, otherSections, hraExemption, status } = req.body;

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear',
//       });
//     }

//     const updateData = {};
//     if (section80C) {
//       updateData.section80C = {
//         ...section80C,
//         items: section80C.items.map(item => ({
//           ...item,
//           // proofSubmitted: item.status === "Approved" ? item.proofSubmitted : 0,
//           // finalDeduction: item.status === 'Approved' ? item.proofSubmitted : 0,
//         }))
//       };
//     }
//     if (section80D) {
//       updateData.section80D = {
//         ...section80D,
//         items: section80D.items.map(item => ({
//           ...item,
//           // finalDeduction: item.status === 'Approved' ? item.proofSubmitted : 0
//         }))
//       };
//     }
//     if (otherSections) {
//       updateData.otherSections = {
//         ...otherSections,
//         items: otherSections.items.map(item => ({
//           ...item,
//           // finalDeduction: item.status === 'Approved' ? item.proofSubmitted : 0
//         }))
//       };
//     }

//     if (hraExemption) {
//       updateData.hraExemption = {
//         ...hraExemption,
//         // finalDeduction: hraExemption.status === 'Approved' ? hraExemption.proofSubmitted : 0
//       };
      
//       await EmployeeRentDetail.findOneAndUpdate(
//         { schoolId, employeeId, academicYear },
//         { status: hraExemption.status },
//         { new: true }
//       );
//     }

//     if (status) updateData.status = status;
//     if (status === 'Verification Done') updateData.verifiedAt = new Date();

//     const declaration = await ItDeclaration.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { $set: updateData },
//       { new: true }
//     );

//     if (!declaration) {
//       return res.status(404).json({
//         success: false,
//         message: 'IT declaration not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: declaration,
//       message: 'IT declaration updated successfully',
//     });
//   } catch (error) {
//     console.error('Error updating IT declaration:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// export default updateItDeclaration;

import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';

const updateItDeclaration = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear, updates, section80C, section80D, otherSections, hraExemption, otherExemption, status } = req.body;

    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Get current declaration
    const declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear });
    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found',
      });
    }

    // Process updates for section80C, section80D, otherSections
    if (updates) {
      const { section, index, status, proofSubmitted, adminRemarks } = updates;

      if (['section80C', 'section80D', 'otherSections'].includes(section) && declaration[section]?.items[index]) {
        const item = declaration[section].items[index];

        // Update only the changed fields
        if (status !== undefined) item.status = status;
        if (proofSubmitted !== undefined) item.proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
        if (adminRemarks !== undefined) item.adminRemarks = adminRemarks;

        // Calculate final deduction based on status
        if (status) {
          item.categoryFinalDeduction = status === 'Approved'
            ? section === 'section80D' || section === 'otherSections'
              ? Math.min(item.proofSubmitted, item.categoryLimit || Infinity)
              : item.proofSubmitted
            : 0;
        }

        // Recalculate section totals
        const { finalDeduction } = calculateSectionTotals(section, declaration[section].items);
        declaration[section].finalDeduction = finalDeduction;
      } else if (section === 'hraExemption' && declaration.hraExemption) {
        // Handle hraExemption updates
        if (status !== undefined) declaration.hraExemption.status = status;
        if (proofSubmitted !== undefined) declaration.hraExemption.proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
        if (adminRemarks !== undefined) declaration.hraExemption.adminRemarks = adminRemarks;
      } else if (['ltaExemption', 'telephoneAllowance', 'internetAllowance'].includes(section) && declaration.otherExemption[section]) {
        // Handle otherExemption updates
        if (status !== undefined) declaration.otherExemption[section].status = status;
        if (proofSubmitted !== undefined) declaration.otherExemption[section].proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
        if (adminRemarks !== undefined) declaration.otherExemption[section].adminRemarks = adminRemarks;

        // Calculate final deduction for otherExemption
        if (status) {
          declaration.otherExemption[section].categoryFinalDeduction = status === 'Approved'
            ? Math.min(declaration.otherExemption[section].proofSubmitted, declaration.otherExemption[section].categoryLimit || Infinity)
            : 0;
        }
      }
    }

    // Handle bulk updates (e.g., from handleSubmit)
    if (section80C) declaration.section80C = section80C;
    if (section80D) declaration.section80D = section80D;
    if (otherSections) declaration.otherSections = otherSections;
    if (hraExemption) declaration.hraExemption = hraExemption;
    if (otherExemption) declaration.otherExemption = otherExemption;
    if (status) declaration.status = status;

    // Save the updated declaration
    await declaration.save();

    return res.status(200).json({
      success: true,
      data: declaration,
      message: 'Declaration updated successfully',
    });
  } catch (error) {
    console.error('Error updating declaration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

function calculateSectionTotals(section, items) {
  const totalProofSubmitted = items.reduce((sum, item) => sum + (item.status === 'Approved' ? item.proofSubmitted || 0 : 0), 0);
  let finalDeduction = totalProofSubmitted;

  if (section === 'section80C') {
    finalDeduction = Math.min(totalProofSubmitted, 150000);
  } else if (section === 'section80D' || section === 'otherSections') {
    finalDeduction = items.reduce((sum, item) => sum + (item.status === 'Approved' ? item.categoryFinalDeduction || 0 : 0), 0);
  }

  return { totalProofSubmitted, finalDeduction };
}
export default updateItDeclaration;