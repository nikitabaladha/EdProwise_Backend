import mongoose from 'mongoose';
import EmployeeltaDetails from '../../../../models/PayrollModule/Employee/EmployeeltaDetails.js';
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';
import path from 'path';

const updateLtaDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { academicYear, status, ltaDetails } = req.body;
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

    if (!Array.isArray(ltaDetails) || ltaDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ltaDetails must be a non-empty array',
      });
    }

    // Validate ltaDetails
    for (const detail of ltaDetails) {
      if (!detail._id || !detail.billstatus || !['Pending', 'Approved', 'Rejected'].includes(detail.billstatus)) {
        throw new Error(`Invalid LTA detail: missing _id or invalid billstatus for billNumber ${detail.billNumber}`);
      }
    }

    // Fetch existing LTA details
    let ltaRecord = await EmployeeltaDetails.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!ltaRecord) {
      throw new Error('LTA details not found');
    }

    // Fetch CTC for categoryLimit
    const ctc = await EmployeeCTC.findOne({ schoolId, employeeId, academicYear }).session(session).lean();
    if (!ctc) {
      throw new Error('CTC data not found for the employee and academic year');
    }

    const ltaComponent = ctc.components.find((comp) => comp.ctcComponentName.toLowerCase().includes('lta'));
    if (!ltaComponent) {
      throw new Error('LTA component not found in CTC');
    }
    const categoryLimit = ltaComponent.annualAmount || 0;

    // Process updated ltaDetails
    const updatedLtaDetails = ltaRecord.ltaDetails.map((existingDetail) => {
      const updatedDetail = ltaDetails.find((d) => d._id.toString() === existingDetail._id.toString());
      if (updatedDetail) {
        return {
          ...existingDetail.toObject(),
          billstatus: updatedDetail.billstatus,
          adminRemarks: updatedDetail.adminRemarks || existingDetail.adminRemarks || '',
        };
      }
      return existingDetail;
    });

    // Recalculate proofSubmitted and categoryFinalDeduction
    const proofSubmitted = updatedLtaDetails.reduce((sum, detail) => {
      return detail.billstatus === 'Approved' ? sum + detail.totalAmount : sum;
    }, 0);
    const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit);

    // Update EmployeeLtaDetails
    ltaRecord.ltaDetails = updatedLtaDetails;
    ltaRecord.proofSubmitted = proofSubmitted;
    ltaRecord.categoryFinalDeduction = categoryFinalDeduction;
    ltaRecord.status = status;
    ltaRecord.categoryLimit = categoryLimit;

    await ltaRecord.save({ session });

    // Update ItDeclaration
    const declaration = await ItDeclaration.findOne({ schoolId, employeeId, academicYear }).session(session);
    if (!declaration) {
      throw new Error('IT Declaration not found');
    }

    declaration.otherExemption.ltaExemption.status = status;
    declaration.otherExemption.ltaExemption.proofSubmitted = status === 'Approved' ? proofSubmitted : 0;
    declaration.otherExemption.ltaExemption.categoryFinalDeduction = status === 'Approved' ? categoryFinalDeduction : 0;
    declaration.otherExemption.ltaExemption.adminRemarks = ltaRecord.ltaDetails[0]?.adminRemarks || declaration.otherExemption.ltaExemption.adminRemarks || '';

    await declaration.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: ltaRecord,
      message: 'LTA details updated successfully',
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
    console.error('Error updating LTA details:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  } finally {
    session.endSession();
  }
};

export default updateLtaDetails;