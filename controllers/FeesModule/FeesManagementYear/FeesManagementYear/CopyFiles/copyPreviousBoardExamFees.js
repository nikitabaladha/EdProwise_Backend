import BoardExamFees from "../../../../../models/FeesModule/BoardExamFee.js";
import ClassAndSection from "../../../../../models/FeesModule/Class&Section.js";

export const copyPreviousBoardExamFees = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {
    const previousBoardExamFees = await BoardExamFees.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousBoardExamFees || previousBoardExamFees.length === 0) {
      console.log(`No board exam fees found for school ${schoolId} in academic year ${prevAcademicYear}`);
      return 0;
    }
    const oldClasses = await ClassAndSection.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    const newClasses = await ClassAndSection.find({
      schoolId,
      academicYear,
    }).session(session);

    const classIdMap = new Map();
    oldClasses.forEach((oldClass) => {
      const matchingNewClass = newClasses.find(
        (newClass) => newClass.className === oldClass.className
      );
      if (matchingNewClass) {
        classIdMap.set(oldClass._id.toString(), matchingNewClass._id);
      }
    });

    const sectionIdMap = new Map();
    oldClasses.forEach((oldClass) => {
      oldClass.sections.forEach((oldSection) => {
        const matchingNewClass = newClasses.find(
          (newClass) => newClass.className === oldClass.className
        );
        if (matchingNewClass) {
          const matchingNewSection = matchingNewClass.sections.find(
            (newSection) => newSection.name === oldSection.name
          );
          if (matchingNewSection) {
            sectionIdMap.set(oldSection._id.toString(), matchingNewSection._id);
          }
        }
      });
    });

    let copiedBoardExamFeesCount = 0;

    for (const prevBoardExamFee of previousBoardExamFees) {
      const newClassId = classIdMap.get(prevBoardExamFee.classId.toString());
      if (!newClassId) {
        console.warn(
          `Skipping board exam fees for classId ${prevBoardExamFee.classId} as no matching class found in ${academicYear}`
        );
        continue;
      }

      const newSectionIds = prevBoardExamFee.sectionIds
        .map((sectionId) => sectionIdMap.get(sectionId.toString()))
        .filter((sectionId) => sectionId != null);

      if (newSectionIds.length === 0) {
        console.warn(
          `Skipping board exam fees for classId ${prevBoardExamFee.classId} as no valid sections found in ${academicYear}`
        );
        continue;
      }

      const existingBoardExamFees = await BoardExamFees.findOne({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: { $all: newSectionIds },
      }).session(session);

      if (existingBoardExamFees) {
        console.log(
          `Board exam fees for classId ${newClassId} and sections already exists for ${academicYear}, skipping.`
        );
        continue;
      }

      const newBoardExamFees = new BoardExamFees({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: newSectionIds,
        amount: prevBoardExamFee.amount,
      });

      await newBoardExamFees.save({ session });
      console.log(`Copied board exam fees: _id=${newBoardExamFees._id}, classId=${newClassId}`);
      copiedBoardExamFeesCount++;
    }

    console.log(`Copied ${copiedBoardExamFeesCount} board exam fees for school ${schoolId} in academic year ${academicYear}`);
    return copiedBoardExamFeesCount;
  } catch (error) {
    console.error("Error copying previous board exam fees:", error);
    throw error;
  }
};