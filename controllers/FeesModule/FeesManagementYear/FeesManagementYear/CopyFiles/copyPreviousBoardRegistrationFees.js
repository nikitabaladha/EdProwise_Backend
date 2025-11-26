import BoardRegistrationFees from "../../../../../models/FeesModule/BoardRegistrationFees.js";
import ClassAndSection from "../../../../../models/FeesModule/Class&Section.js";

export const copyPreviousBoardRegistrationFees = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {
    const previousBoardRegistrationFees = await BoardRegistrationFees.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousBoardRegistrationFees || previousBoardRegistrationFees.length === 0) {
      console.log(`No board registration fees found for school ${schoolId} in academic year ${prevAcademicYear}`);
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

    let copiedBoardRegistrationFeesCount = 0;

    for (const prevBoardRegistrationFee of previousBoardRegistrationFees) {
      const newClassId = classIdMap.get(prevBoardRegistrationFee.classId.toString());
      if (!newClassId) {
        console.warn(
          `Skipping board registration fees for classId ${prevBoardRegistrationFee.classId} as no matching class found in ${academicYear}`
        );
        continue;
      }


      const newSectionIds = prevBoardRegistrationFee.sectionIds
        .map((sectionId) => sectionIdMap.get(sectionId.toString()))
        .filter((sectionId) => sectionId != null);

      if (newSectionIds.length === 0) {
        console.warn(
          `Skipping board registration fees for classId ${prevBoardRegistrationFee.classId} as no valid sections found in ${academicYear}`
        );
        continue;
      }

      const existingBoardRegistrationFees = await BoardRegistrationFees.findOne({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: { $all: newSectionIds },
      }).session(session);

      if (existingBoardRegistrationFees) {
        console.log(
          `Board registration fees for classId ${newClassId} and sections already exists for ${academicYear}, skipping.`
        );
        continue;
      }

      const newBoardRegistrationFees = new BoardRegistrationFees({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: newSectionIds,
        amount: prevBoardRegistrationFee.amount,
      });

      await newBoardRegistrationFees.save({ session });
      console.log(`Copied board registration fees: _id=${newBoardRegistrationFees._id}, classId=${newClassId}`);
      copiedBoardRegistrationFeesCount++;
    }

    console.log(`Copied ${copiedBoardRegistrationFeesCount} board registration fees for school ${schoolId} in academic year ${academicYear}`);
    return copiedBoardRegistrationFeesCount;
  } catch (error) {
    console.error("Error copying previous board registration fees:", error);
    throw error;
  }
};