import OneTimeFees from "../../../../../models/FeesModule/OneTimeFees.js";
import ClassAndSection from "../../../../../models/FeesModule/Class&Section.js";
import FeesType from "../../../../../models/FeesModule/FeesType.js";

export const copyPreviousOneTimeFees = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {
    const previousOneTimeFees = await OneTimeFees.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousOneTimeFees || previousOneTimeFees.length === 0) {
      console.log(`No one-time fees found for school ${schoolId} in academic year ${prevAcademicYear}`);
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

    const oldFeesTypes = await FeesType.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    const newFeesTypes = await FeesType.find({
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

    const feesTypeIdMap = new Map();
    oldFeesTypes.forEach((oldFeesType) => {
      const matchingNewFeesType = newFeesTypes.find(
        (newFeesType) => newFeesType.feesTypeName === oldFeesType.feesTypeName
      );
      if (matchingNewFeesType) {
        feesTypeIdMap.set(oldFeesType._id.toString(), matchingNewFeesType._id);
      }
    });

    let copiedOneTimeFeesCount = 0;

    for (const prevOneTimeFees of previousOneTimeFees) {
      const newClassId = classIdMap.get(prevOneTimeFees.classId.toString());
      if (!newClassId) {
        console.warn(
          `Skipping one-time fees for classId ${prevOneTimeFees.classId} as no matching class found in ${academicYear}`
        );
        continue;
      }

      const newSectionIds = prevOneTimeFees.sectionIds
        .map((sectionId) => sectionIdMap.get(sectionId.toString()))
        .filter((sectionId) => sectionId != null);

      if (newSectionIds.length === 0) {
        console.warn(
          `Skipping one-time fees for classId ${prevOneTimeFees.classId} as no valid sections found in ${academicYear}`
        );
        continue;
      }

      const newOneTimeFees = prevOneTimeFees.oneTimeFees
        .map((fee) => {
          const newFeesTypeId = feesTypeIdMap.get(fee.feesTypeId.toString());
          if (!newFeesTypeId) {
            console.warn(
              `Skipping fee with feesTypeId ${fee.feesTypeId} as no matching fees type found in ${academicYear}`
            );
            return null;
          }
          return {
            feesTypeId: newFeesTypeId,
            amount: fee.amount,
          };
        })
        .filter((fee) => fee != null);

      if (newOneTimeFees.length === 0) {
        console.warn(
          `Skipping one-time fees for classId ${prevOneTimeFees.classId} as no valid fees types found in ${academicYear}`
        );
        continue;
      }

      const existingOneTimeFees = await OneTimeFees.findOne({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: { $all: newSectionIds },
      }).session(session);

      if (existingOneTimeFees) {
        console.log(
          `One-time fees for classId ${newClassId} and sections already exists for ${academicYear}, skipping.`
        );
        continue;
      }

      const newRecord = new OneTimeFees({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: newSectionIds,
        oneTimeFees: newOneTimeFees,
      });

      await newRecord.save({ session });
      console.log(`Copied one-time fees: _id=${newRecord._id}, classId=${newClassId}`);
      copiedOneTimeFeesCount++;
    }

    console.log(`Copied ${copiedOneTimeFeesCount} one-time fees for school ${schoolId} in academic year ${academicYear}`);
    return copiedOneTimeFeesCount;
  } catch (error) {
    console.error("Error copying previous one-time fees:", error);
    throw error;
  }
};