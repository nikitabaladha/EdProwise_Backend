import mongoose from 'mongoose';
import PrefixSetting from '../../../../../models/FeesModule/RegistrationPrefix.js';
import validatePrefixSetting from '../../../../../validators/FeesModule/PrefixSetting.js';

export const createprefix = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: You do not have permission to create prefix setting.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } = validatePrefixSetting(req.body);
    if (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message,
      });
    }

    const { type, value, prefix, number, academicYear } = req.body;

    if (!academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Academic year is required.",
      });
    }


    const existing = await PrefixSetting.findOne({ schoolId, academicYear }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Prefix already exists for this school and academic year.",
      });
    }

    const payload = {
      schoolId,
      academicYear,
      type,
    };

    if (type === 'numeric') {
      payload.value = value;
    } else if (type === 'alphanumeric') {
      payload.prefix = prefix;
      payload.number = number;
    }

    const newPrefix = new PrefixSetting(payload);
    newPrefix.$session(session);
    await newPrefix.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Prefix saved successfully.",
      data: newPrefix,
    });

  } catch (err) {
    console.error("Prefix creation failed:", err);
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      hasError: true,
      message: "Server error while saving prefix setting.",
    });
  }
};

export default createprefix;
