import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import StudentUser from "../../../models/StudentSignupTemp.js";
import saltFunction from "../../../validators/saltFunction.js";
import Joi from "joi";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION;

async function studentLogin(req, res) {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                "string.empty": "Email is required",
                "string.email": "Invalid email format",
            }),
            password: Joi.string().min(6).required().messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 6 characters",
            }),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ hasError: true, message: error.details[0].message });
        }

        const { email, password } = req.body;

        const user = await StudentUser.findOne({ email });

        if (!user) {
            return res.status(401).json({ hasError: true, message: "User does not exist" });
        }

        const isPasswordValid = await saltFunction.validatePassword(
            password,
            user.password,
            user.salt
        );

        if (!isPasswordValid) {
            return res.status(401).json({ hasError: true, message: "Invalid Password" });
        }


        const token = jwt.sign(
            {
                id: user._id,
                  schoolId: user.schoolId,
                academicYear:user.academicYear,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            jwtSecret,
            { expiresIn: jwtExpiration }
        );

        return res.status(200).json({
            token,
            userDetails: {
                schoolId: user.schoolId,
                academicYear:user.academicYear,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                status: user.status,
                registrationFormId:user.registrationFormId
            },
            hasError: false,
            message: "Login Successful",
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

export default studentLogin;
