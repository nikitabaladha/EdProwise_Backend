// import EmployeeRegistration, { EmployeeIdCounter } from '../../../../models/PayrollModule/Employeer/EmployeeRegistration.js';
// import EmployeeIdSetting from '../../../../models/PayrollModule/AdminSetting/EmployeeIdSetting.js';
// import mongoose from 'mongoose';
// import moment from 'moment'; 

// import nodemailer from "nodemailer";
// import SMTPEmailSetting from "../../../../models/SMTPEmailSetting.js";
// import PayrollSmtpEmailSetting from '../../../../models/PayrollModule/AdminSetting/PayrollSmtpEmailSetting.js';
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// async function sendEmailToEmployee(newEmployee) {
//   let hasError = false;
//   let message = "";
// console.log(newEmployee,"newEmploee");

//   try {
//     // 1. SMTP settings
//     const smtpSettings = await SMTPEmailSetting.findOne();
//     if (!smtpSettings) {
//       console.error("SMTP settings not found");
//       return false;
//     }

//     // 3. Nodemailer setup
//     const transporter = nodemailer.createTransport({
//       host: smtpSettings.mailHost,
//       port: smtpSettings.mailPort,
//       secure: smtpSettings.mailEncryption === "SSL",
//       auth: {
//         user: smtpSettings.mailUsername,
//         pass: smtpSettings.mailPassword,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     const logoImagePath = path.join(
//       __dirname,
//       "../../../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
//     );

//     if (!fs.existsSync(logoImagePath)) {
//       console.error("Logo not found at:", logoImagePath);
//       return { hasError: true, message: "Logo file not found" };
//     }

//     // Read logo as base64 for fallback
//     const logoBase64 = fs.readFileSync(logoImagePath, { encoding: "base64" });
//     const base64Src = `data:image/png;base64,${logoBase64}`;

//     const attachments = [
//       {
//         filename: "logo.png",
//         path: logoImagePath,
//         cid: "edprowiselogo@company", 
//         contentDisposition: "inline",
//         headers: {
//           "Content-ID": "<edprowiselogo@company>",
//         },
//       },
//     ];

//     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//     const loginUrl = `${frontendUrl}/login`;
//      console.log("newEmployee.emailId",newEmployee.emailId);
     
//     // 8. Send email
//     const mailOptions = {
//       from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
//       to: newEmployee.emailId,
//       subject: `Your Employee Account Details - ${newEmployee.employeeId}`,
//       html: `
//               <!DOCTYPE html>
//                 <html>
//                 <head>
//                     <meta charset="UTF-8">
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                     <style type="text/css">
//                         /* Base Styles */
//                         body, html {
//                             margin: 0;
//                             padding: 0;
//                             font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//                             line-height: 1.6;
//                             color: #333333;    
//                         }

//                        .outer-div{
//                           border: 1px solid transparent;
//                           background-color: #f1f1f1;
//                         }

//                         /* Email Container */
//                         .email-container {
//                             max-width: 600px;
//                             margin: 30px auto;
//                             background: #ffffff;
//                             border-radius: 8px;
//                             overflow: hidden;
//                             box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;    
//                         }
                        
//                         /* Header Section */
//                         .header {
//                             background: #c2e7ff;
//                             padding: 20px 20px;
//                             text-align: center;
//                             color: #333333;
//                             box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
//                         }
        
//                         .logo {
//                             width: 250px;
//                             height: auto;
//                             display: block;
//                             margin: 0 auto;
//                             -ms-interpolation-mode: bicubic;
//                         }
                        
//                         .welcome-heading {
//                             font-size: 24px;
//                             font-weight: 600;
//                             margin: 0;
//                             color: black;
//                         }
                        
//                         /* Content Section */
//                         .content {
//                             padding: 30px;
//                         }
                      
//                         .message {
//                             font-size: 16px;
//                             color: #4a5568;
//                         }
                        
//                         /* User Details Box */
//                         .center-text {
//                           text-align: center;
//                         }

//                         .detail-item {
//                             margin-bottom: 12px;
//                             display: flex;
//                         }
                        
//                         .detail-value {
//                             color: #4a5568;
//                         }
                        
//                         /* Credentials Box */
//                         .credentials-box {
//                             background: #f8f9fa;
//                             border: 1px solid #e2e8f0;
//                             border-radius: 6px;
//                             padding: 15px;
//                             margin: 20px 0;
//                         }
                        
//                         .credentials-title {
//                             font-weight: 600;
//                             margin-bottom: 10px;
//                             color: #2d3748;
//                         }
                        
//                         .credentials-item {
//                             margin-bottom: 8px;
//                         }
                        
//                         /* Action Button */
//                         .action-button {
//                             display: inline-block;
//                             background: #04d3d4;
//                             color: white !important;
//                             text-decoration: none;
//                             padding: 12px 30px;
//                             border-radius: 4px;
//                             font-weight: 600;
//                             margin: 5px 0 20px ;
//                             text-align: center;
//                         }
                        
//                         /* Footer */
//                         .footer {
//                             text-align: center;
//                             padding: 20px;
//                             background: #a9fffd;
//                             font-size: 14px;
//                             color: #718096;
//                         }
                        
//                         .signature {
//                             margin-top: 25px;
//                             padding-top: 25px;
//                             border-top: 1px solid #e2e8f0;
//                         }
//                         .contact-text{
//                           color: #0000FF;
//                         }    
//                         .note-email{
//                           font-size: 9px;
//                           color: #4a5568;
//                          }
                        
//                         .note-content{
//                             padding: 0px 30px;
//                             text-align: center;
//                         }
//                         .fw-bold{
//                           font-weight: bold;
//                         }    
                        
//                         /* Responsive */
//                         @media only screen and (max-width: 600px) {
//                             .email-container {
//                                 border-radius: 0;
//                                 margin: 0px auto;
//                             }
//                             .logo {
//                                 width: 200px;
//                             }
//                             .content {
//                                 padding: 20px;
//                             }
//                             .note-content{
//                                padding: 0px 20px;
//                             }
                            
//                         }
//                     </style>
//                 </head>
//                 <body>
//                 <div class="outer-div">
//                     <div class="email-container">
//                         <!-- Header with Logo -->
//                         <div class="header">
//                             <div class="logo-container">
//                                 <img src="cid:edprowiselogo@company" 
//                                     alt="EdProwise Logo" 
//                                     class="logo"
//                                     style="width:250px;height:auto;display:block;">
//                             </div>
//                         </div>
                        
//                         <!-- Main Content -->
//                         <div class="content">
//                             <p class="message fw-bold">Dear ${newEmployee.EmployeeName},</p>
                            
//                             <p class="message">Welcome to our organization! Your employee account has been successfully created.</p>
                            
//                             <p class="message">Here are your login credentials:</p>

//                             <div class="credentials-box">
//                                 <div class="credentials-title">Employee Account Details</div>
//                                 <div class="credentials-item"><strong>Employee ID:</strong> ${newEmployee.employeeId}</div>
//                                 <div class="credentials-item"><strong>Password:</strong> ${newEmployee.password}</div>
//                                 <div class="credentials-item"><strong>Email:</strong> ${newEmployee.emailId}</div>
//                             </div>

//                             <p class="message">For security reasons, we recommend that you change your password after your first login.</p>
                            
//                             <!-- Action Button -->
//                             <p class="message">You can login to your account using the button below:</p>
//                             <div style="text-align: center;">
//                                 <a href="${loginUrl}" class="action-button">Login to Your Account</a>
//                             </div>
                            
//                             <p class="message">If you have any questions or need assistance, please contact your HR department.</p>
                            
//                             <!-- Signature -->
//                             <div class="signature">
//                                 <p>Best regards,</p>
//                                 <p><strong>${smtpSettings.mailFromName} Team</strong></p>
//                             </div>
//                         </div>
                        
//                         <!-- Footer -->
//                         <div class="footer">
//                             <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
//                         </div>
//                         <div class="note-content">
//                           <p class="note-email">This e-mail was sent from a notification-only address that can't accept incoming e-mail. Please don't reply to this message.</p>
//                       </div>
//                     </div>
//                   </div>  
//                 </body>
//                 </html>
//             `,
//       attachments: attachments,
//     };

//     await transporter.sendMail(mailOptions);

//     console.log("Employee registration email sent successfully");
//     return { hasError: false, message: "Email sent successfully." };
//   } catch (error) {
//     console.error("Error sending employee registration email:", error);
//     return {
//       hasError: true,
//       message: "Email is not proper, we cannot send the email.",
//     };
//   }
// }

// const createEmployeeRegistration = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const formData = req.body;
//     const { schoolId, emailId, dateOfBirth, joiningDate, ...monthlyFields } = formData;

//     if (!schoolId || !emailId || !dateOfBirth || !joiningDate) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     // Step 1: Fetch prefix and suffixLength from setting
//     const setting = await EmployeeIdSetting.findOne({ schoolId }).session(session);
//     if (!setting || !setting.prefix || !setting.suffixLength) {
//       throw new Error('Employee ID prefix/suffix setting not configured');
//     }

//     // Step 2: Generate employeeId
//     const counter = await EmployeeIdCounter.findOneAndUpdate(
//       { schoolId },
//       { $inc: { employeeIdSeq: 1 } },
//       { new: true, upsert: true, session }
//     );
//     const paddedNumber = counter.employeeIdSeq.toString().padStart(setting.suffixLength, '0');
//     const generatedEmployeeId = `${setting.prefix}${paddedNumber}`;

//     // Step 3: Format month as YYYY-MM
//     const currentMonth = moment().format('YYYY-MM');

//     // Step 4: Structure data
//     const employeeData = {
//       schoolId,
//       employeeId: generatedEmployeeId,
//       password: generatedEmployeeId, 
//       emailId,
//       dateOfBirth,
//       joiningDate,
//       employeeDetails: {
//         [currentMonth]: monthlyFields
//       }
//     };

//     // Step 5: Save
//     const newEmployee = new EmployeeRegistration(employeeData);
//     await newEmployee.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     // Optional Email
//     await sendEmailToEmployee(newEmployee);

//     res.status(201).json({
//       message: 'Employee registered successfully',
//       employeeId: generatedEmployeeId
//     });

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Registration Error:', err);
//     res.status(500).json({
//       message: 'Failed to register employee',
//       error: err.message
//     });
//   }
// };


// export default createEmployeeRegistration;

import EmployeeRegistration, { EmployeeIdCounter } from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
import EmployeeIdSetting from '../../../../models/PayrollModule/AdminSettings/EmployeeIdSetting.js';
import mongoose from 'mongoose';
import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../../../models/SMTPEmailSetting.js";
// import PayrollSmtpEmailSetting from '../../../../models/PayrollModule/AdminSetting/PayrollSmtpEmailSetting.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function sendEmailToEmployee(newEmployee) {
  let hasError = false;
  let message = "";

  try {
    // 1. SMTP settings
    const smtpSettings = await SMTPEmailSetting.findOne();
    if (!smtpSettings) {
      console.error("SMTP settings not found");
      return false;
    }

    // 3. Nodemailer setup
    const transporter = nodemailer.createTransport({
      host: smtpSettings.mailHost,
      port: smtpSettings.mailPort,
      secure: smtpSettings.mailEncryption === "SSL",
      auth: {
        user: smtpSettings.mailUsername,
        pass: smtpSettings.mailPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const logoImagePath = path.join(
      __dirname,
      "../../../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
    );

    if (!fs.existsSync(logoImagePath)) {
      console.error("Logo not found at:", logoImagePath);
      return { hasError: true, message: "Logo file not found" };
    }

    // Read logo as base64 for fallback
    const logoBase64 = fs.readFileSync(logoImagePath, { encoding: "base64" });
    const base64Src = `data:image/png;base64,${logoBase64}`;

    const attachments = [
      {
        filename: "logo.png",
        path: logoImagePath,
        cid: "edprowiselogo@company", 
        contentDisposition: "inline",
        headers: {
          "Content-ID": "<edprowiselogo@company>",
        },
      },
    ];

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const loginUrl = `${frontendUrl}/login`;
     
    // 8. Send email
    const mailOptions = {
      from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
      to: newEmployee.emailId,
      subject: `Your Employee Account Details - ${newEmployee.employeeId}`,
      html: `
              <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style type="text/css">
                        /* Base Styles */
                        body, html {
                            margin: 0;
                            padding: 0;
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            line-height: 1.6;
                            color: #333333;    
                        }

                       .outer-div{
                          border: 1px solid transparent;
                          background-color: #f1f1f1;
                        }

                        /* Email Container */
                        .email-container {
                            max-width: 600px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;    
                        }
                        
                        /* Header Section */
                        .header {
                            background: #c2e7ff;
                            padding: 20px 20px;
                            text-align: center;
                            color: #333333;
                            box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
                        }
        
                        .logo {
                            width: 250px;
                            height: auto;
                            display: block;
                            margin: 0 auto;
                            -ms-interpolation-mode: bicubic;
                        }
                        
                        .welcome-heading {
                            font-size: 24px;
                            font-weight: 600;
                            margin: 0;
                            color: black;
                        }
                        
                        /* Content Section */
                        .content {
                            padding: 30px;
                        }
                      
                        .message {
                            font-size: 16px;
                            color: #4a5568;
                        }
                        
                        /* User Details Box */
                        .center-text {
                          text-align: center;
                        }

                        .detail-item {
                            margin-bottom: 12px;
                            display: flex;
                        }
                        
                        .detail-value {
                            color: #4a5568;
                        }
                        
                        /* Credentials Box */
                        .credentials-box {
                            background: #f8f9fa;
                            border: 1px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        
                        .credentials-title {
                            font-weight: 600;
                            margin-bottom: 10px;
                            color: #2d3748;
                        }
                        
                        .credentials-item {
                            margin-bottom: 8px;
                        }
                        
                        /* Action Button */
                        .action-button {
                            display: inline-block;
                            background: #04d3d4;
                            color: white !important;
                            text-decoration: none;
                            padding: 12px 30px;
                            border-radius: 4px;
                            font-weight: 600;
                            margin: 5px 0 20px ;
                            text-align: center;
                        }
                        
                        /* Footer */
                        .footer {
                            text-align: center;
                            padding: 20px;
                            background: #a9fffd;
                            font-size: 14px;
                            color: #718096;
                        }
                        
                        .signature {
                            margin-top: 25px;
                            padding-top: 25px;
                            border-top: 1px solid #e2e8f0;
                        }
                        .contact-text{
                          color: #0000FF;
                        }    
                        .note-email{
                          font-size: 9px;
                          color: #4a5568;
                         }
                        
                        .note-content{
                            padding: 0px 30px;
                            text-align: center;
                        }
                        .fw-bold{
                          font-weight: bold;
                        }    
                        
                        /* Responsive */
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                margin: 0px auto;
                            }
                            .logo {
                                width: 200px;
                            }
                            .content {
                                padding: 20px;
                            }
                            .note-content{
                               padding: 0px 20px;
                            }
                            
                        }
                    </style>
                </head>
                <body>
                <div class="outer-div">
                    <div class="email-container">
                        <!-- Header with Logo -->
                        <div class="header">
                            <div class="logo-container">
                                <img src="cid:edprowiselogo@company" 
                                    alt="EdProwise Logo" 
                                    class="logo"
                                    style="width:250px;height:auto;display:block;">
                            </div>
                        </div>
                        
                        <!-- Main Content -->
                        <div class="content">
                            <p class="message fw-bold">Dear ${newEmployee.employeeName},</p>
                            
                            <p class="message">Welcome to our organization! Your employee account has been successfully created.</p>
                            
                            <p class="message">Here are your login credentials:</p>

                            <div class="credentials-box">
                                <div class="credentials-title">Employee Account Details</div>
                                <div class="credentials-item"><strong>Employee ID:</strong> ${newEmployee.employeeId}</div>
                                <div class="credentials-item"><strong>Password:</strong> ${newEmployee.password}</div>
                                <div class="credentials-item"><strong>Email:</strong> ${newEmployee.emailId}</div>
                            </div>

                            <p class="message">For security reasons, we recommend that you change your password after your first login.</p>
                            
                            <!-- Action Button -->
                            <p class="message">You can login to your account using the button below:</p>
                            <div style="text-align: center;">
                                <a href="${loginUrl}" class="action-button">Login to Your Account</a>
                            </div>
                            
                            <p class="message">If you have any questions or need assistance, please contact your HR department.</p>
                            
                            <!-- Signature -->
                            <div class="signature">
                                <p>Best regards,</p>
                                <p><strong>${smtpSettings.mailFromName} Team</strong></p>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <p>All Copyright © ${new Date().getFullYear()} EdProwise Tech PVT LTD. All Rights Reserved.</p>
                        </div>
                        <div class="note-content">
                          <p class="note-email">This e-mail was sent from a notification-only address that can't accept incoming e-mail. Please don't reply to this message.</p>
                      </div>
                    </div>
                  </div>  
                </body>
                </html>
            `,
      attachments: attachments,
    };

    await transporter.sendMail(mailOptions);

    console.log("Employee registration email sent successfully");
    return { hasError: false, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending employee registration email:", error);
    return {
      hasError: true,
      message: "Email is not proper, we cannot send the email.",
    };
  }
}

const createEmployeeRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = req.body;
    const { academicYear } = req.params;
    
    const { schoolId, emailId, dateOfBirth, joiningDate, ...otherFields } = formData;

    if (!schoolId || !emailId || !dateOfBirth || !joiningDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Step 1: Fetch prefix and suffixLength from setting
    const setting = await EmployeeIdSetting.findOne({ schoolId }).session(session);
    if (!setting || !setting.prefix || !setting.suffixLength) {
      throw new Error('Employee ID prefix/suffix setting not configured');
    }

    // Step 2: Generate employeeId
    const counter = await EmployeeIdCounter.findOneAndUpdate(
      { schoolId },
      { $inc: { employeeIdSeq: 1 } },
      { new: true, upsert: true, session }
    );
    const paddedNumber = counter.employeeIdSeq.toString().padStart(setting.suffixLength, '0');
    const generatedEmployeeId = `${setting.prefix}${paddedNumber}`;

    // Step 3: Get current academic year (you may want to make this configurable)
    const currentAcademicYear = academicYear; // Default, can be changed

    // Step 4: Create default password (first 4 letters of name + last 4 digits of phone)
    const defaultPassword = `${formData.employeeName?.slice(0, 4).toLowerCase()}${formData.contactNumber?.slice(-4)}` || generatedEmployeeId;

    // Step 5: Structure data for new model
    const employeeData = {
      schoolId,
      employeeId: generatedEmployeeId,
      password: defaultPassword,
      employeeName: formData.employeeName,
      emailId,
      contactNumber: formData.contactNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender: formData.gender,
      joiningDate: new Date(joiningDate),
      fatherName: formData.fatherName,
      spouseName: formData.spouseName,
      emergencyContactNumber: formData.emergencyContactNumber,
      aadharPassportNumber: formData.aadharPassportNumber,
      panNumber: formData.panNumber,
      uanNumber: formData.uanNumber,
      esicNumber: formData.esicNumber,
      class12Certificate: formData.class12Certificate,
      degreeCertificate: formData.degreeCertificate,
      resume: formData.resume,
      experienceLetter: formData.experienceLetter,
      relievingLetter: formData.relievingLetter,
      securityDepositAmount: formData.securityDepositAmount,
      taxRegime: formData.taxRegime || 'new',
      status: 'On Payroll',
      academicYearDetails: [{
        academicYear: currentAcademicYear,
        categoryOfEmployees: formData.categoryOfEmployees,
        grade: formData.grade,
        jobDesignation: formData.jobDesignation,
        currentAddress: formData.currentAddress,
        nationality: formData.nationality || 'Indian',
        religion: formData.religion,
        maritalStatus: formData.maritalStatus,
        higherQualification: formData.higherQualification,
        physicalHandicap: formData.physicalHandicap || 'No',
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType
      }]
    };

    // Step 5: Save
    const newEmployee = new EmployeeRegistration(employeeData);
    await newEmployee.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Optional Email
    await sendEmailToEmployee(newEmployee);

    res.status(201).json({
      message: 'Employee registered successfully',
      employeeId: generatedEmployeeId,
      password: defaultPassword
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Registration Error:', err);
    res.status(500).json({
      message: 'Failed to register employee',
      error: err.message
    });
  }
};

export default createEmployeeRegistration;