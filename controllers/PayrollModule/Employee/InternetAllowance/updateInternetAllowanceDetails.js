import mongoose from 'mongoose';
import EmployeeInternetAllowance from '../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';
import path from 'path';

const updateInternetAllowanceDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicYear, status, internetAllowanceDetails } = req.body;
    // const sessionUserDetails = req.session?.userDetails || {};
    // const schoolId = sessionUserDetails.schoolId || bodySchoolId;
    // const employeeId = sessionUserDetails.userId || bodyEmployeeId;
const { schoolId, employeeId } = req.params;

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

    if (!Array.isArray(internetAllowanceDetails) || internetAllowanceDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'internetAllowanceDetails must be a non-empty array',
      });
    }

    // Validate internetAllowanceDetails
    for (const detail of internetAllowanceDetails) {
      if (!detail._id || !detail.billStatus || !['Pending', 'Approved', 'Rejected'].includes(detail.billStatus)) {
        throw new Error(`Invalid internet allowance detail: missing _id or invalid billStatus for billNumber ${detail.billNumber}`);
      }
    }

    // Fetch existing internet allowance details
    let internetRecord = await EmployeeInternetAllowance.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!internetRecord) {
      throw new Error('Internet allowance details not found');
    }

    // Fetch CTC for categoryLimit
    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).session(session).lean();
    if (!ctc) {
      throw new Error('CTC data not found for the employee and academic year');
    }

    const internetComponent = ctc.components.find((comp) => comp.ctcComponentName.toLowerCase().includes('internet allowance'));
    if (!internetComponent) {
      throw new Error('Internet allowance component not found in CTC');
    }
    const categoryLimit = internetComponent.annualAmount || 0;

    // Process updated internetAllowanceDetails
    const updatedInternetDetails = internetRecord.internetAllowanceDetails.map((existingDetail) => {
      const updatedDetail = internetAllowanceDetails.find((d) => d._id.toString() === existingDetail._id.toString());
      if (updatedDetail) {
        return {
          ...existingDetail.toObject(),
          billStatus: updatedDetail.billStatus,
          adminRemarks: updatedDetail.adminRemarks || existingDetail.adminRemarks || '',
        };
      }
      return existingDetail;
    });

    // Recalculate proofSubmitted and categoryFinalDeduction
    const proofSubmitted = updatedInternetDetails.reduce((sum, detail) => {
      return detail.billStatus === 'Approved' ? sum + detail.grossAmount : sum;
    }, 0);
    const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit);

    // Update EmployeeInternetAllowance
    internetRecord.internetAllowanceDetails = updatedInternetDetails;
    internetRecord.proofSubmitted = proofSubmitted;
    internetRecord.categoryFinalDeduction = categoryFinalDeduction;
    internetRecord.status = status;
    internetRecord.categoryLimit = categoryLimit;

    await internetRecord.save({ session });

    // Update ItDeclaration
    const declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!declaration) {
      throw new Error('IT Declaration not found');
    }

    declaration.otherExemption.internetAllowance.status = status;
    declaration.otherExemption.internetAllowance.proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
    declaration.otherExemption.internetAllowance.categoryFinalDeduction = status === 'Approved' ? categoryFinalDeduction : 0;
    declaration.otherExemption.internetAllowance.adminRemarks = internetRecord.internetAllowanceDetails[0]?.adminRemarks || declaration.otherExemption.internetAllowance.adminRemarks || '';

    await declaration.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: internetRecord,
      message: 'Internet allowance details updated successfully',
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
    console.error('Error updating internet allowance details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    session.endSession();
  }
};

export default updateInternetAllowanceDetails;