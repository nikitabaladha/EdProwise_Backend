import Fine from "../../../../../models/FeesModule/Fine.js";

export const copyPreviousFines = async (schoolId, academicYear, prevAcademicYear, session) => {
  try {

    const previousFines = await Fine.find({
      schoolId,
      academicYear: prevAcademicYear,
    }).session(session);

    if (!previousFines || previousFines.length === 0) {
      console.log(`No fines found for school ${schoolId} in academic year ${prevAcademicYear}`);
      return 0;
    }

    let copiedFinesCount = 0;


    for (const prevFine of previousFines) {

      if (!prevFine.feeType || !prevFine.frequency || prevFine.value == null) {
        console.warn(
          `Skipping invalid fine: _id=${prevFine._id}, feeType=${prevFine.feeType}, frequency=${prevFine.frequency}, value=${prevFine.value}`
        );
        continue;
      }

    
      const existingFine = await Fine.findOne({
        schoolId,
        academicYear,
        feeType: prevFine.feeType,
        frequency: prevFine.frequency,
        value: prevFine.value,
      }).session(session);

      if (existingFine) {
        console.log(
          `Fine with feeType="${prevFine.feeType}", frequency="${prevFine.frequency}", value=${prevFine.value} already exists for ${academicYear}, skipping.`
        );
        continue;
      }

      const newFine = new Fine({
        schoolId,
        academicYear,
        feeType: prevFine.feeType,
        frequency: prevFine.frequency,
        value: prevFine.value,
        maxCapFee: prevFine.maxCapFee,
      });

      await newFine.save({ session });
      console.log(
        `Copied fine: _id=${newFine._id}, feeType=${newFine.feeType}, frequency=${newFine.frequency}, value=${newFine.value}`
      );
      copiedFinesCount++;
    }

    console.log(`Copied ${copiedFinesCount} fines for school ${schoolId} in academic year ${academicYear}`);
    return copiedFinesCount;
  } catch (error) {
    console.error("Error copying previous fines:", error);
    throw error; 
  }
};