import mongoose from "mongoose";
import ClassAndSection from "../../../../../models/FeesModule/Class&Section.js";
import MasterDefineShift from "../../../../../models/FeesModule/MasterDefineShift.js";



export const copyPreviousClassesAndSections = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {
    const previousClasses = await ClassAndSection.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousClasses || previousClasses.length === 0) {
      return 0; 
    }

    const oldShifts = await MasterDefineShift.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    const newShifts = await MasterDefineShift.find({
      schoolId,
      academicYear,
    }).session(session);


    const shiftIdMap = new Map();
    oldShifts.forEach((oldShift) => {
      if (!oldShift.masterDefineShiftName || typeof oldShift.masterDefineShiftName !== "string" || oldShift.masterDefineShiftName.trim() === "") {
        return;
      }

      const matchingNewShift = newShifts.find((newShift) => {
        if (!newShift.masterDefineShiftName || typeof newShift.masterDefineShiftName !== "string" || newShift.masterDefineShiftName.trim() === "") {
          return false;
        }
        return newShift.masterDefineShiftName.toLowerCase() === oldShift.masterDefineShiftName.toLowerCase();
      });

      if (matchingNewShift) {
        shiftIdMap.set(oldShift._id.toString(), matchingNewShift._id);
      } else {
        console.warn(`No matching shift found for "${oldShift.masterDefineShiftName}" in academic year ${academicYear}`);
      }
    });

    let copiedClassesCount = 0;

 
    for (const prevClass of previousClasses) {
      const newSections = prevClass.sections
        .map((section) => {
          const newShiftId = shiftIdMap.get(section.shiftId.toString());
          if (!newShiftId) {
            console.warn(
              `No matching shift for section "${section.name}" in class "${prevClass.className}". Skipping section.`
            );
            return null;
          }
          return {
            name: section.name,
            shiftId: newShiftId,
          };
        })
        .filter((section) => section !== null);

   
      if (newSections.length === 0) {
        continue;
      }

      const newClass = new ClassAndSection({
        schoolId,
        academicYear,
        className: prevClass.className,
        sections: newSections,
      });

      await newClass.save({ session });
      copiedClassesCount++;
    }

    console.log(`Copied ${copiedClassesCount} classes for school ${schoolId} in academic year ${academicYear}`);
    return copiedClassesCount;
  } catch (error) {
    console.error("Error copying previous classes and sections:", error);
    throw error;
  }
};