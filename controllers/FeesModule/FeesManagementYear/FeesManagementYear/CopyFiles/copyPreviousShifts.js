import MasterDefineShift from "../../../../../models/FeesModule/MasterDefineShift.js";


export const copyPreviousShifts = async (schoolId, academicYear, prevAcademicYear, session) => {
  const previousShifts = await MasterDefineShift.find({
    schoolId,
    academicYear: prevAcademicYear,
  }).session(session);

  const newShifts = previousShifts.map((shift) => ({
    schoolId,
    masterDefineShiftName: shift.masterDefineShiftName,
    startTime: shift.startTime,
    endTime: shift.endTime,
    academicYear,
  }));

  if (newShifts.length > 0) {
    await MasterDefineShift.insertMany(newShifts, { session });
  }

  return newShifts.length;
};