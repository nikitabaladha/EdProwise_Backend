import FeesStructure from "../../../../../models/FeesModule/FeesStructure.js";
import ClassAndSection from "../../../../../models/FeesModule/Class&Section.js";
import FeesType from "../../../../../models/FeesModule/FeesType.js";

export const copyPreviousFeesStructure = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {

    const previousFeesStructures = await FeesStructure.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousFeesStructures || previousFeesStructures.length === 0) {
      console.log(`No fee structures found for school ${schoolId} in academic year ${prevAcademicYear}`);
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

    let copiedFeesStructureCount = 0;

    for (const prevStructure of previousFeesStructures) {
      // Map classId
      const newClassId = classIdMap.get(prevStructure.classId.toString());
      if (!newClassId) {
        console.warn(
          `Skipping fee structure for classId ${prevStructure.classId} as no matching class found in ${academicYear}`
        );
        continue;
      }

    
      const newSectionIds = prevStructure.sectionIds
        .map((sectionId) => sectionIdMap.get(sectionId.toString()))
        .filter((sectionId) => sectionId != null);

      if (newSectionIds.length === 0) {
        console.warn(
          `Skipping fee structure for classId ${prevStructure.classId} as no valid sections found in ${academicYear}`
        );
        continue;
      }

      
      const newInstallments = prevStructure.installments
        .map((installment) => {
          const newFees = installment.fees
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

          if (newFees.length === 0) {
            console.warn(
              `Skipping installment ${installment.name} for classId ${prevStructure.classId} as no valid fees found`
            );
            return null;
          }

          return {
            name: installment.name,
            dueDate: new Date(
              new Date(installment.dueDate).setFullYear(
                new Date(installment.dueDate).getFullYear() + 1
              )
            ), 
            fees: newFees,
          };
        })
        .filter((installment) => installment != null);

      if (newInstallments.length === 0) {
        console.warn(
          `Skipping fee structure for classId ${prevStructure.classId} as no valid installments found in ${academicYear}`
        );
        continue;
      }


      const existingFeesStructure = await FeesStructure.findOne({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: { $all: newSectionIds },
      }).session(session);

      if (existingFeesStructure) {
        console.log(
          `Fee structure for classId ${newClassId} and sections already exists for ${academicYear}, skipping.`
        );
        continue;
      }

     
      const newFeesStructure = new FeesStructure({
        schoolId,
        academicYear,
        classId: newClassId,
        sectionIds: newSectionIds,
        installments: newInstallments,
      });

      await newFeesStructure.save({ session });
      console.log(`Copied fee structure: _id=${newFeesStructure._id}, classId=${newClassId}`);
      copiedFeesStructureCount++;
    }

    console.log(`Copied ${copiedFeesStructureCount} fee structures for school ${schoolId} in academic year ${academicYear}`);
    return copiedFeesStructureCount;
  } catch (error) {
    console.error("Error copying previous fee structures:", error);
    throw error;
  }
};