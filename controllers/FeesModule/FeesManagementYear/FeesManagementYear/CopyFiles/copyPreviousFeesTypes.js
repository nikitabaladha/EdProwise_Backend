import FeesType from "../../../../../models/FeesModule/FeesType.js";

export const copyPreviousFeesTypes = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {
    if (!schoolId || typeof schoolId !== "string" || schoolId.trim() === "") {
      throw new Error("Invalid or missing schoolId");
    }
    if (!academicYear || typeof academicYear !== "string" || academicYear.trim() === "") {
      throw new Error("Invalid or missing academicYear");
    }
    if (!prevAcademicYear || typeof prevAcademicYear !== "string" || prevAcademicYear.trim() === "") {
      throw new Error("Invalid or missing prevAcademicYear");
    }

  
    const previousFeesTypes = await FeesType.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousFeesTypes || previousFeesTypes.length === 0) {
      console.log(`No fees types found for school ${schoolId} in academic year ${prevAcademicYear}`);
      return 0;
    }

    let copiedFeesTypesCount = 0;

    for (const prevFeesType of previousFeesTypes) {
      if (!prevFeesType.feesTypeName || typeof prevFeesType.feesTypeName !== "string" || prevFeesType.feesTypeName.trim() === "") {
        console.warn(`Skipping invalid fees type: _id=${prevFeesType._id}, feesTypeName=${prevFeesType.feesTypeName}`);
        continue;
      }


      const existingFeesType = await FeesType.findOne({
        schoolId,
        academicYear,
        feesTypeName: prevFeesType.feesTypeName,
      }).session(session);

      if (existingFeesType) {
        console.log(`Fees type "${prevFeesType.feesTypeName}" already exists for school ${schoolId} in academic year ${academicYear}, skipping.`);
        continue;
      }

 
      const newFeesType = new FeesType({
        schoolId,
        academicYear,
        feesTypeName: prevFeesType.feesTypeName,
        groupOfFees: prevFeesType.groupOfFees,
      });

      try {
        await newFeesType.save({ session });
        console.log(`Copied fees type: _id=${newFeesType._id}, feesTypeName=${newFeesType.feesTypeName}, schoolId=${schoolId}, academicYear=${academicYear}`);
        copiedFeesTypesCount++;
      } catch (saveError) {
        if (saveError.code === 11000) {
          console.log(`Duplicate fees type "${prevFeesType.feesTypeName}" for school ${schoolId} in academic year ${academicYear}, skipping.`);
          continue;
        }
        throw saveError; 
      }
    }

    console.log(`Successfully copied ${copiedFeesTypesCount} fees types for school ${schoolId} in academic year ${academicYear}`);
    return copiedFeesTypesCount;
  } catch (error) {
    console.error(`Error copying fees types for school ${schoolId} from ${prevAcademicYear} to ${academicYear}:`, error);
    throw new Error(`Failed to copy fees types: ${error.message}`);
  }
};