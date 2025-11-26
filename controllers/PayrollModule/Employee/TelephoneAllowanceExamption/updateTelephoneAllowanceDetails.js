import mongoose from 'mongoose';
import EmployeeTelephoneAllowance from '../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';
import path from 'path';

const updateTelephoneAllowanceDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicYear, status, telephoneAllowanceDetails } = req.body;
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

    if (!Array.isArray(telephoneAllowanceDetails) || telephoneAllowanceDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'telephoneAllowanceDetails must be a non-empty array',
      });
    }

    // Validate telephoneAllowanceDetails
    for (const detail of telephoneAllowanceDetails) {
      if (!detail._id || !detail.billStatus || !['Pending', 'Approved', 'Rejected'].includes(detail.billStatus)) {
        throw new Error(`Invalid telephone allowance detail: missing _id or invalid billStatus for billNumber ${detail.billNumber}`);
      }
    }

    // Fetch existing telephone allowance details
    let telephoneRecord = await EmployeeTelephoneAllowance.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!telephoneRecord) {
      throw new Error('Telephone allowance details not found');
    }

    // Fetch CTC for categoryLimit
    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).session(session).lean();
    if (!ctc) {
      throw new Error('CTC data not found for the employee and academic year');
    }

    const telephoneComponent = ctc.components.find((comp) => comp.ctcComponentName.toLowerCase().includes('telephone allowance'));
    if (!telephoneComponent) {
      throw new Error('Telephone allowance component not found in CTC');
    }
    const categoryLimit = telephoneComponent.annualAmount || 0;

    // Process updated telephoneAllowanceDetails
    const updatedTelephoneDetails = telephoneRecord.telephoneAllowanceDetails.map((existingDetail) => {
      const updatedDetail = telephoneAllowanceDetails.find((d) => d._id.toString() === existingDetail._id.toString());
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
    const proofSubmitted = updatedTelephoneDetails.reduce((sum, detail) => {
      return detail.billStatus === 'Approved' ? sum + detail.grossAmount : sum;
    }, 0);
    const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit);

    // Update EmployeeTelephoneAllowance
    telephoneRecord.telephoneAllowanceDetails = updatedTelephoneDetails;
    telephoneRecord.proofSubmitted = proofSubmitted;
    telephoneRecord.categoryFinalDeduction = categoryFinalDeduction;
    telephoneRecord.status = status;
    telephoneRecord.categoryLimit = categoryLimit;

    await telephoneRecord.save({ session });

    // Update ItDeclaration
    const declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!declaration) {
      throw new Error('IT Declaration not found');
    }

    declaration.otherExemption.telephoneAllowance.status = status;
    declaration.otherExemption.telephoneAllowance.proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
    declaration.otherExemption.telephoneAllowance.categoryFinalDeduction = status === 'Approved' ? categoryFinalDeduction : 0;
    declaration.otherExemption.telephoneAllowance.adminRemarks = telephoneRecord.telephoneAllowanceDetails[0]?.adminRemarks || declaration.otherExemption.telephoneAllowance.adminRemarks || '';

    await declaration.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: telephoneRecord,
      message: 'Telephone allowance details updated successfully',
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
    console.error('Error updating telephone allowance details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    session.endSession();
  }
};

export default updateTelephoneAllowanceDetails;