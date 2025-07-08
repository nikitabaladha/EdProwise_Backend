import mongoose from "mongoose";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import ClassAndSectionValidator from "../../../../validators/FeesModule/ClassandSection.js";

const createClassAndSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create class and section.",
      });
    }

    const { error } = ClassAndSectionValidator.ClassAndSectionCreate.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      await session.abortTransaction();
      session.endSession();
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { className, sections, academicYear } = req.body;


    const existingClass = await ClassAndSection.findOne({
      schoolId,
      className,
      academicYear,
    }).session(session);

    if (existingClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        hasError: true,
        message: `Class '${className}' already exists for academic year ${academicYear}.`,
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

    const newClass = new ClassAndSection({
      schoolId,
      className,
      academicYear,
      sections,
    });

    await newClass.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Class and sections created successfully.",
      data: newClass,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Class Error:", err);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create class and sections.",
      error: err.message,
    });
  }
};

export default createClassAndSection;