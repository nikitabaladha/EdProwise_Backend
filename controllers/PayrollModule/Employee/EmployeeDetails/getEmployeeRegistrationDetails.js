// import EmployeeRegistration from "../../../../models/PayrollModule/Employeer/EmployeeRegistration.js";
// import mongoose from "mongoose";

// // Get employee registration details
// const getEmployeeRegistrationDetails = async (req, res) => {
//   try {
//     const { id: schoolId, employeeId } = req.params;

//     if (!schoolId || !employeeId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "School ID and Employee ID are required",
//       });
//     }

//     const employee = await EmployeeRegistration.findOne({ 
//       schoolId, 
//       employeeId 
//     }).select('-password');
// //  console.log(employee);
 
//     if (!employee) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Employee not found",
//       });
//     }

//     return res.status(200).json({
//       message: "Employee details fetched successfully",
//       data: employee,
//       hasError: false,
//     });

//   } catch (error) {
//     // console.error("Error fetching employee details:", error.message);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to fetch employee details",
//       error: error.message,
//     });
//   }
// };
 
// // Update employee registration details
// // export const updateEmployeeRegistrationDetails = async (req, res) => {
// //   const session = await mongoose.startSession();
// //   session.startTransaction();
  
// //   try {
// //     const { id: schoolId, employeeId } = req.params;
// //     const updateData = req.body;
// //     const files = req.files;

// //     if (!schoolId || !employeeId) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(400).json({
// //         hasError: true,
// //         message: "School ID and Employee ID are required",
// //       });
// //     }

// //     // Handle file paths
// //     if (files) {
// //       Object.keys(files).forEach(field => {
// //         const file = files[field][0];
// //         const isImage = file.mimetype.startsWith("image/");
// //         const basePath = isImage ? "/Images/EmployeeImages" : "/Documents/EmployeeDocuments";
// //         updateData[field] = `${basePath}/${file.filename}`;
// //       });
// //     }

// //     // Handle nested documents
// //     if (updateData.nominationDetails) {
// //       if (files?.nomineeAadharCardOrPassportFile) {
// //         const file = files.nomineeAadharCardOrPassportFile[0];
// //         const isImage = file.mimetype.startsWith("image/");
// //         const basePath = isImage ? "/Images/EmployeeImages" : "/Documents/EmployeeDocuments";
        
// //         if (Array.isArray(updateData.nominationDetails)) {
// //           updateData.nominationDetails[0].nomineeAadharCardOrPassportFile = `${basePath}/${file.filename}`;
// //         } else {
// //           updateData.nominationDetails.nomineeAadharCardOrPassportFile = `${basePath}/${file.filename}`;
// //         }
// //       }
// //     }

// //     // Convert string dates to Date objects
// //     const dateFields = ['dateOfBirth', 'joiningDate'];
// //     dateFields.forEach(field => {
// //       if (updateData[field]) {
// //         updateData[field] = new Date(updateData[field]);
// //       }
// //     });

// //     // Handle experience details dates
// //     if (updateData.experienceDetails) {
// //       const experienceDetails = Array.isArray(updateData.experienceDetails) 
// //         ? updateData.experienceDetails 
// //         : [updateData.experienceDetails];
      
// //       experienceDetails.forEach(exp => {
// //         if (exp.previousSchoolJoiningDate) {
// //           exp.previousSchoolJoiningDate = new Date(exp.previousSchoolJoiningDate);
// //         }
// //         if (exp.previousSchoolLastDate) {
// //           exp.previousSchoolLastDate = new Date(exp.previousSchoolLastDate);
// //         }
// //       });
      
// //       updateData.experienceDetails = experienceDetails;
// //     }

// //     const updatedEmployee = await EmployeeRegistration.findOneAndUpdate(
// //       { schoolId, employeeId },
// //       { $set: updateData },
// //       { new: true, runValidators: true, session }
// //     );

// //     if (!updatedEmployee) {
// //       await session.abortTransaction();
// //       session.endSession();
// //       return res.status(404).json({
// //         hasError: true,
// //         message: "Employee not found",
// //       });
// //     }

// //     await session.commitTransaction();
// //     session.endSession();

// //     return res.status(200).json({
// //       message: "Employee details updated successfully",
// //       data: updatedEmployee,
// //       hasError: false,
// //     });

// //   } catch (error) {
// //     await session.abortTransaction();
// //     session.endSession();

// //     console.error("Error updating employee details:", error.message);
    
// //     if (error.name === 'ValidationError') {
// //       const messages = Object.values(error.errors).map(val => val.message);
// //       return res.status(400).json({
// //         hasError: true,
// //         message: messages.join(', '),
// //       });
// //     }

// //     return res.status(500).json({
// //       hasError: true,
// //       message: "Failed to update employee details",
// //       error: error.message,
// //     });
// //   }
// // };

// export default getEmployeeRegistrationDetails;

// BY MONTH Data
// import EmployeeRegistration from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';

// const getEmployeeRegistrationDetails = async (req, res) => {
//     try {
//         const { schoolId, employeeId, monthKey } = req.params;

//         if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
//             return res.status(400).json({ hasError: true, message: 'Invalid month format (YYYY-MM required)' });
//         }

//         const employee = await EmployeeRegistration.findOne({ schoolId, employeeId });
//         if (!employee) {
//             return res.status(404).json({ hasError: true, message: 'Employee not found' });
//         }

//         const data = {
//             employeeId: employee.employeeId,
//             emailId: employee.emailId,
//             dateOfBirth: employee.dateOfBirth,
//             joiningDate: employee.joiningDate,
//             employeeDetails: employee.employeeDetails.get(monthKey) || {},
//         };

//         res.status(200).json({
//             hasError: false,
//             message: 'Employee details retrieved successfully',
//             data,
//         });
//     } catch (error) {
//         console.error('Error fetching employee details:', error);
//         res.status(500).json({
//             hasError: true,
//             message: error.message || 'Failed to fetch employee details',
//         });
//     }
// };

// export default getEmployeeRegistrationDetails;

// controllers/employee/getEmployeeDetailsByAcademicYear.js
import EmployeeRegistration from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
const getEmployeeRegistrationDetails = async (req, res) => {
    try {
        const { id: schoolId, employeeId } = req.params;
        const { academicYear } = req.query;
            console.log("SchoolID", schoolId);
        console.log("EMployee ID", employeeId);
        console.log("Academic Year", academicYear);
        if (!schoolId || !employeeId || !academicYear) {
            return res.status(400).json({
                hasError: true,
                message: 'schoolId, employeeId, and academicYear are required'
            });
        }
        
        const employee = await EmployeeRegistration.findOne({ 
            schoolId, 
            employeeId 
        });

        if (!employee) {
            return res.status(404).json({
                hasError: true,
                message: 'Employee not found'
            });
        }

        // Find data for the requested academic year
        const academicYearData = employee.academicYearDetails.find(
            ay => ay.academicYear === academicYear
        );

        // If no data for current academic year, find the latest academic year data
        // if (!academicYearData) {
        //     const latestAcademicYearData = [...employee.academicYearDetails]
        //         .sort((a, b) => b.academicYear.localeCompare(a.academicYear))[0];
            
        //     if (latestAcademicYearData) {
        //         // Clone the latest data for the current academic year
        //         const newAcademicYearData = {
        //             ...latestAcademicYearData,
        //             academicYear: academicYear,
        //             _id: undefined // Remove the _id to allow MongoDB to create a new one
        //         };

        //         return res.status(200).json({
        //             hasError: false,
        //             message: 'Using cloned data from previous academic year',
        //             data: {
        //                 ...employee.toObject(),
        //                 academicYearDetails: [...employee.academicYearDetails, newAcademicYearData],
        //                 currentAcademicYearData: newAcademicYearData
        //             },
        //             isCloned: true
        //         });
        //     }
        // }


        if (!academicYearData) {
    const sortedYears = [...employee.academicYearDetails]
        .sort((a, b) => b.academicYear.localeCompare(a.academicYear));

    const latestAcademicYearData = sortedYears[0];

    if (latestAcademicYearData) {
        const plainPrevYear = latestAcademicYearData.toObject ? latestAcademicYearData.toObject() : latestAcademicYearData;

        const newAcademicYearData = {
            ...plainPrevYear,
            academicYear: academicYear,
            _id: undefined
        };

        return res.status(200).json({
            hasError: false,
            message: 'Using cloned data from previous academic year',
            data: {
                ...employee.toObject(),
                academicYearDetails: [...employee.academicYearDetails.map(d => d.toObject ? d.toObject() : d), newAcademicYearData],
                currentAcademicYearData: newAcademicYearData
            },
            isCloned: true
        });
    }
}


        res.status(200).json({
            hasError: false,
            data: {
                ...employee.toObject(),
                currentAcademicYearData: academicYearData
            },
            isCloned: false
        });

    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({
            hasError: true,
            message: error.message || 'Failed to fetch employee details'
        });
    }
};

export default getEmployeeRegistrationDetails;