import mongoose from "mongoose";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import ClassAndSectionValidator from "../../../../validators/FeesModule/ClassandSection.js";

const updateClassAndSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { error } = ClassAndSectionValidator.ClassAndSectionUpdate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }


    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update class and section.",
      });
    }

    const { id } = req.params;
    const { className, sections, academicYear } = req.body;


    const classData = await ClassAndSection.findOne({ _id: id, schoolId }).session(session);
    if (!classData) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Class and section data not found.",
      });
    }


    const sectionNames = sections.map((section) => section.name);
    const uniqueSectionNames = new Set(sectionNames);
    if (sectionNames.length !== uniqueSectionNames.size) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Duplicate section names are not allowed within the same class.",
      });
    }


    const existingClass = await ClassAndSection.findOne({
      className,
      schoolId,
      academicYear,
      _id: { $ne: id },
    }).session(session);

    if (existingClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        hasError: true,
        message: `Class '${className}' already exists for academic year ${academicYear}.`,
      });
    }


    classData.className = className;
    classData.academicYear = academicYear;
    classData.sections = sections;

    await classData.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: "Class and sections updated successfully.",
      data: classData,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update class and sections.",
      error: err.message,
    });
  }
};

export default updateClassAndSection;
