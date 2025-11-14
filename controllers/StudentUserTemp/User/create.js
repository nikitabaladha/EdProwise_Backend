import StudentUser from "../../../models/StudentSignupTemp.js";
import saltFunction from "../../../validators/saltFunction.js";

async function addstudenttemp(req, res) {
  try {
    const { schoolId, firstName, lastName, email, phone, password,  academicYear} = req.body;


    if (!schoolId || !firstName || !lastName || !email || !phone || !password || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message:
          "All fields ( firstName, lastName, email, phone, password) are required.",
      });
    }


    let isExistingUser = await StudentUser.findOne({
      schoolId,
      academicYear,
      $or: [{ email }, { phone }],
    });

    if (isExistingUser) {
      const conflictField = isExistingUser.email === email ? "email" : "phone";
      return res.status(400).json({
        hasError: true,
        message: `A student with this ${conflictField} already exists for this school.`,
      });
    }


    const { hashedPassword, salt } = saltFunction.hashPassword(password);


    const user = await StudentUser.create({
      schoolId,
      academicYear,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      salt,
      status: "Active",
    });


    const userData = {
      _id: user.id,
      schoolId: user.schoolId,
      academicYear:user.academicYear,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
    };

    return res.status(200).json({
      hasError: false,
      message: "Student signed up successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error creating new student:", error.message);


    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        hasError: true,
        message: `This ${field} (${value}) is already registered. Please use a different ${field}.`,
        field,
        value,
      });
    }


    return res.status(500).json({
      hasError: true,
      message: "Failed to create new student.",
      error: error.message,
    });
  }
}

export default addstudenttemp;
