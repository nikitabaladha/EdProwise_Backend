// import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';

// const updateRentDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId } = req.params;
//     const { academicYear, rentDetails, status } = req.body;

//     if (!schoolId || !employeeId || !academicYear) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: schoolId, employeeId, or academicYear'
//       });
//     }

//     // Validate rentDetails if provided
//     if (rentDetails && !Array.isArray(rentDetails)) {
//       return res.status(400).json({
//         success: false,
//         message: 'rentDetails must be an array'
//       });
//     }

//     const updateData = {};
//     if (rentDetails) {
//       updateData.rentDetails = rentDetails.map(detail => ({
//         ...detail,
//         monthStatus: detail.monthStatus || 'Pending'
//       }));
//     }
//     if (status) {
//       updateData.status = status;
//       if (status === 'Approved' || status === 'Rejected') {
//         updateData.verifiedAt = new Date();
//       }
//     }

//     // Update EmployeeRentDetail
//     const rentDetail = await EmployeeRentDetail.findOneAndUpdate(
//       { schoolId, employeeId, academicYear },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!rentDetail) {
//       return res.status(404).json({
//         success: false,
//         message: 'Rent details not found'
//       });
//     }

//     // Update ItDeclaration HRA exemption status if overall status changes
//     if (status) {
//       await ItDeclaration.findOneAndUpdate(
//         { schoolId, employeeId, academicYear },
//         { 'hraExemption.status': status },
//         { new: true }
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: rentDetail,
//       message: 'Rent details status updated successfully'
//     });

//   } catch (error) {
//     console.error('Error updating rent details status:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error'
//     });
//   }
// };

// export default updateRentDetails;

import mongoose from 'mongoose';
import EmployeeRentDetail from '../../../../models/PayrollModule/Employee/EmployeeRentDetail.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';
import path from 'path';

const updateRentDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicYear, status, rentDetails: updatedRentDetails } = req.body;
    const sessionUserDetails = req.session?.userDetails || {};
    const { schoolId, employeeId } = req.params;
    // const { academicYear, rentDetails, status } = req.body;
     
    console.log("update rent school",schoolId);
    console.log("update rent school",employeeId);
    console.log("update rent school",academicYear);
    // Validate required fields
    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, employeeId, or academicYear',
      });
    }

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing status',
      });
    }

    if (!Array.isArray(updatedRentDetails) || updatedRentDetails.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'rentDetails must be an array of 12 months',
      });
    }

    // Validate monthStatus in rentDetails
    for (const detail of updatedRentDetails) {
      if (!detail.month || !months.includes(detail.month)) {
        throw new Error(`Invalid month: ${detail.month}`);
      }
      if (!['Pending', 'Approved', 'Rejected'].includes(detail.monthStatus)) {
        throw new Error(`Invalid monthStatus for ${detail.month}: ${detail.monthStatus}`);
      }
    }

    // Fetch CTC for HRA and Basic Salary calculations
    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).session(session).lean();
    if (!ctc) {
      throw new Error('CTC data not found for the employee and academic year');
    }

    const monthOrder = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March',
    ];

    // Function to get CTC components for a month
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
          applicableDate: ctcData.applicableDate,
        };
      } else {
        const validHistory = ctcData.history
          .filter((h) => new Date(h.applicableDate) <= monthEnd)
          .sort((a, b) => new Date(b.applicableDate) - new Date(a.applicableDate));
        if (validHistory.length > 0) {
          selectedCtc = {
            components: validHistory[0].components,
            totalAnnualCost: validHistory[0].totalAnnualCost,
            applicableDate: validHistory[0].applicableDate,
          };
        }
      }

      if (!selectedCtc) {
        return {
          monthlyHRA: 0,
          monthlyBasicSalary: 0,
        };
      }

      const hraComponent = selectedCtc.components.find((comp) =>
        comp.ctcComponentName.toLowerCase().includes('hra')
      );
      const basicSalaryComponent = selectedCtc.components.find((comp) =>
        comp.ctcComponentName.toLowerCase().includes('basic salary')
      );

      if (!hraComponent || !basicSalaryComponent) {
        throw new Error(`HRA or Basic Salary component not found in CTC for ${monthName}`);
      }

      return {
        monthlyHRA: (hraComponent.annualAmount || 0) / 12,
        monthlyBasicSalary: (basicSalaryComponent.annualAmount || 0) / 12,
      };
    };

    // Fetch existing rent details
    let rentDetail = await EmployeeRentDetail.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!rentDetail) {
      throw new Error('Rent details not found');
    }

    // Process updated rent details
    let totalDeclaredRent = 0;
    let totalMonthActualHRAReceivedMetro = 0;
    let totalMonthActualRentPaidMetro = 0;
    let totalMonthBasicSalaryMetro = 0;
    let totalMonthActualHRAReceivedNonMetro = 0;
    let totalMonthActualRentPaidNonMetro = 0;
    let totalMonthBasicSalaryNonMetro = 0;

    const processedRentDetails = updatedRentDetails.map((detail) => {
      const existingDetail = rentDetail.rentDetails.find((d) => d.month === detail.month) || {};
      const declaredRentValue = parseFloat(detail.declaredRent) || 0;
      const { monthlyHRA, monthlyBasicSalary } = getCtcForMonth(detail.month, ctc);
      const monthActualRentPaid = declaredRentValue;
      const monthBasicSalaryCity = parseFloat(monthlyBasicSalary);

      // Only include values for Approved months
      if (detail.monthStatus === 'Approved' && declaredRentValue > 0) {
        totalDeclaredRent += declaredRentValue;
        if (detail.cityType === 'Metro') {
          totalMonthActualHRAReceivedMetro += monthlyHRA;
          totalMonthActualRentPaidMetro += monthActualRentPaid;
          totalMonthBasicSalaryMetro += monthBasicSalaryCity;
        } else if (detail.cityType === 'Non-Metro') {
          totalMonthActualHRAReceivedNonMetro += monthlyHRA;
          totalMonthActualRentPaidNonMetro += monthActualRentPaid;
          totalMonthBasicSalaryNonMetro += monthBasicSalaryCity;
        }
      }

      return {
        month: detail.month,
        declaredRent: declaredRentValue,
        cityType: detail.cityType || existingDetail.cityType || '',
        landlordName: detail.landlordName || existingDetail.landlordName || '',
        landlordPanNumber: detail.landlordPanNumber || existingDetail.landlordPanNumber || '',
        landlordAddress: detail.landlordAddress || existingDetail.landlordAddress || '',
        rentReceipt: detail.rentReceipt || existingDetail.rentReceipt || null,
        monthActualHRAReceived: monthlyHRA,
        monthActualRentPaid: declaredRentValue,
        monthBasicSalaryCity: monthBasicSalaryCity,
        monthStatus: detail.monthStatus,
        adminRemarks: detail.adminRemarks || existingDetail.adminRemarks || '',
      };
    });

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

    // Total calculations
    const actualHRAReceived = actualHRAReceivedMetro + actualHRAReceivedNonMetro;
    const actualRentPaid = parseFloat((actualRentPaidMetro + actualRentPaidNonMetro).toFixed(0));
    const basicSalaryCity = parseFloat((basicSalaryMetroCity + basicSalaryNonMetroCity).toFixed(0));
    const hraExemption = parseFloat((metroHraExemption + nonMetroHraExemption).toFixed(0));

    // Update EmployeeRentDetail
    rentDetail.actualHRAReceived = actualHRAReceived;
    rentDetail.actualRentPaid = actualRentPaid;
    rentDetail.basicSalaryCity = basicSalaryCity;
    rentDetail.hraExemption = hraExemption;
    rentDetail.status = status;
    rentDetail.rentDetails = processedRentDetails;

    await rentDetail.save({ session });

    // Update ItDeclaration
    const declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!declaration) {
      throw new Error('IT Declaration not found');
    }

    declaration.hraExemption.status = status;
    declaration.hraExemption.proofSubmitted = status === 'Approved' ? hraExemption : 0;
    declaration.hraExemption.adminRemarks = rentDetail.rentDetails[0]?.adminRemarks || declaration.hraExemption.adminRemarks || '';

    await declaration.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: rentDetail,
      message: 'Rent details updated successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    if (req.files) {
      req.files.forEach((file) => {
        const normalizedPath = path.normalize(file.path);
        if (fs.existsSync(normalizedPath)) {
          fs.unlinkSync(normalizedPath);
        }
      });
    }
    console.error('Error updating rent details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    session.endSession();
  }
};

const months = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
];

export default updateRentDetails;