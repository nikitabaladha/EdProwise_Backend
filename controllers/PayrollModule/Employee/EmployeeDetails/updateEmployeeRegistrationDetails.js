
import mongoose from 'mongoose';
import EmployeeRegistration from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
import { employeeUpdateUpload } from '../../../UploadFiles/EmployeeDetailsFiles.js';
import fs from 'fs';

const removeOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Removed old file: ${filePath}`);
    } catch (error) {
      console.error(`Error removing file ${filePath}:`, error);
    }
  }
};

// Enhanced array data parser that handles both formats
const parseArrayData = (fieldName, body) => {
  try {
    // Case 1: Field is a JSON string
    if (typeof body[fieldName] === 'string' && body[fieldName].startsWith('[')) {
      return JSON.parse(body[fieldName]);
    }
    
    // Case 2: Field is already an array
    if (Array.isArray(body[fieldName])) {
      return body[fieldName];
    }

    // Case 3: Field is in exploded format (nominationDetails[0][fieldName])
    const result = [];
    const regex = new RegExp(`^${fieldName}\\[(\\d+)\\]\\[(.+)\\]$`);
    
    Object.keys(body).forEach(key => {
      const match = key.match(regex);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        if (!result[index]) result[index] = {};
        result[index][field] = body[key];
      }
    });

    // If we found exploded fields, return them
    if (result.length > 0) {
      return result.filter(Boolean);
    }

    // Case 4: Field might be missing or in unexpected format
    return [];
  } catch (error) {
    console.error(`Error parsing ${fieldName}:`, error);
    return [];
  }
};

const updateEmployeeDetails = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear } = req.query;
    const files = req.files || [];
    const formData = req.body || {};

    console.log('Request Parameters:', { schoolId, employeeId, academicYear });
    console.log('Form Data Structure:', Object.keys(formData));
    console.log('Files Received:', files.map(f => f.fieldname));

    // Validate required parameters
    if (!schoolId || !employeeId || !academicYear) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'schoolId, employeeId, and academicYear are required',
      });
    }

    const existingEmployee = await EmployeeRegistration.findOne({
      schoolId,
      employeeId,
    }).session(session);

    if (!existingEmployee) {
      await session.abortTransaction();
      return res.status(404).json({
        hasError: true,
        message: 'Employee not found',
      });
    }

    // Parse array data using our enhanced parser
    const rawNominationDetails = parseArrayData('nominationDetails', formData);
    const rawExperienceDetails = parseArrayData('experienceDetails', formData);

    console.log('Parsed Nomination Details:', rawNominationDetails);
    console.log('Parsed Experience Details:', rawExperienceDetails);

    // Process nomination details with file handling
    const cleanedNominationDetails = rawNominationDetails.map((nominee, index) => {
      const fileKey = `nominationDetails[${index}][nomineeAadharCardOrPassportFile]`;
      const file = files.find(f => f.fieldname === fileKey);
      const existingFile = existingEmployee.nominationDetails?.[index]?.nomineeAadharCardOrPassportFile;

      // Remove old file if new one is uploaded
      if (file && existingFile) {
        removeOldFile(existingFile);
      }

      return {
        nomineeName: nominee.nomineeName || '',
        nomineeRelation: nominee.nomineeRelation || '',
        nomineeAadharNumber: nominee.nomineeAadharNumber || '',
        nomineeShearPercentage: Number(nominee.nomineeShearPercentage) || 0,
        nomineeAadharCardOrPassportFile: file?.path || existingFile || '',
      };
    });

    // Process experience details
    const cleanedExperienceDetails = rawExperienceDetails.map((exp) => ({
      previousSchoolName: exp.previousSchoolName || '',
      previousSchoolAddress: exp.previousSchoolAddress || '',
      previousSchoolJoiningDate: exp.previousSchoolJoiningDate
        ? new Date(exp.previousSchoolJoiningDate)
        : null,
      previousSchoolLastDate: exp.previousSchoolLastDate
        ? new Date(exp.previousSchoolLastDate)
        : null,
      previousJobDesignation: exp.previousJobDesignation || '',
      numberOfExperience: exp.numberOfExperience || '',
    }));

    // Validate nominee shares sum to 100%
    const totalShares = cleanedNominationDetails.reduce(
      (sum, n) => sum + (n.nomineeShearPercentage || 0),
      0
    );
    if (totalShares !== 100 && cleanedNominationDetails.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'Nominee shares must sum to 100%',
        totalShares,
      });
    }

    // Validate experience dates
    const invalidExperience = cleanedExperienceDetails.find((exp) => {
      if (exp.previousSchoolJoiningDate && exp.previousSchoolLastDate) {
        return new Date(exp.previousSchoolJoiningDate) >= new Date(exp.previousSchoolLastDate);
      }
      return false;
    });

    if (invalidExperience) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'End date must be after start date for all experiences',
      });
    }

    // Process file uploads
    const fileUpdates = {};
    const fileFields = [
      'aadharPassportFile',
      'panFile',
      'class12Certificate',
      'degreeCertificate',
      'resume',
      'experienceLetter',
      'relievingLetter',
    ];

    fileFields.forEach((field) => {
      const file = files.find(f => f.fieldname === field);
      if (file?.path) {
        const oldPath = existingEmployee[field];
        if (oldPath) removeOldFile(oldPath);
        fileUpdates[field] = file.path;
      }
    });

    // Prepare academic year data update
    const academicYearUpdate = {
      academicYear,
      categoryOfEmployees: formData.categoryOfEmployees || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.categoryOfEmployees || '',
      grade: formData.grade || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.grade || '',
      jobDesignation: formData.jobDesignation || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.jobDesignation || '',
      currentAddress: formData.currentAddress || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.currentAddress || '',
      nationality: formData.nationality || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.nationality || 'Indian',
      religion: formData.religion || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.religion || '',
      maritalStatus: formData.maritalStatus || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.maritalStatus || '',
      higherQualification: formData.higherQualification || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.higherQualification || '',
      physicalHandicap: formData.physicalHandicap || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.physicalHandicap || 'No',
      accountHolderName: formData.accountHolderName || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.accountHolderName || '',
      bankName: formData.bankName || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.bankName || '',
      ifscCode: formData.ifscCode || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.ifscCode || '',
      accountNumber: formData.accountNumber || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.accountNumber || '',
      accountType: formData.accountType || 
        existingEmployee.academicYearDetails?.find((ay) => ay.academicYear === academicYear)?.accountType || 'Savings',
    };

    // Prepare the complete update query
    const updateQuery = {
      $set: {
        nominationDetails: cleanedNominationDetails,
        experienceDetails: cleanedExperienceDetails,
        ...fileUpdates,
        employeeName: formData.employeeName || existingEmployee.employeeName,
        emailId: formData.emailId || existingEmployee.emailId,
        contactNumber: formData.contactNumber || existingEmployee.contactNumber,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : existingEmployee.dateOfBirth,
        gender: formData.gender || existingEmployee.gender,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : existingEmployee.joiningDate,
        fatherName: formData.fatherName || existingEmployee.fatherName,
        spouseName: formData.spouseName || existingEmployee.spouseName,
        emergencyContactNumber: formData.emergencyContactNumber || existingEmployee.emergencyContactNumber,
        aadharPassportNumber: formData.aadharPassportNumber || existingEmployee.aadharPassportNumber,
        panNumber: formData.panNumber || existingEmployee.panNumber,
        uanNumber: formData.uanNumber || existingEmployee.uanNumber,
        esicNumber: formData.esicNumber || existingEmployee.esicNumber,
        securityDepositAmount: formData.securityDepositAmount
          ? Number(formData.securityDepositAmount)
          : existingEmployee.securityDepositAmount,
        taxRegime: formData.taxRegime || existingEmployee.taxRegime,
        status: formData.status || existingEmployee.status,
      },
    };

    // Handle academic year data update
    const academicYearIndex = existingEmployee.academicYearDetails.findIndex(
      (ay) => ay.academicYear === academicYear
    );

    if (academicYearIndex >= 0) {
      updateQuery.$set[`academicYearDetails.${academicYearIndex}`] = academicYearUpdate;
    } else {
      updateQuery.$push = {
        academicYearDetails: academicYearUpdate,
      };
    }

    // Perform the update operation
    const updatedEmployee = await EmployeeRegistration.findOneAndUpdate(
      { schoolId, employeeId },
      updateQuery,
      { new: true, runValidators: true, session }
    );

    if (!updatedEmployee) {
      await session.abortTransaction();
      return res.status(500).json({
        hasError: true,
        message: 'Failed to update employee details',
      });
    }

    await session.commitTransaction();

    res.status(200).json({
      hasError: false,
      message: 'Employee details updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating employee details:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        hasError: true,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      hasError: true,
      message: error.message || 'Failed to update employee details',
    });
  } finally {
    session.endSession();
  }
};

export default [employeeUpdateUpload, updateEmployeeDetails];