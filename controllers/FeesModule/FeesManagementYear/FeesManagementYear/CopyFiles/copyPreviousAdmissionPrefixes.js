import AdmissionPrefix from "../../../../../models/FeesModule/AdmissionPrefix.js";


export const copyPreviousAdmissionPrefixes = async (schoolId, academicYear, prevAcademicYear, session) => {
  const previousAdmissionPrefixes = await AdmissionPrefix.find({
    schoolId,
    academicYear: prevAcademicYear,
  }).session(session);

  const newAdmissionPrefixes = previousAdmissionPrefixes.map((prefix) => ({
    schoolId,
    academicYear,
    type: prefix.type,
    value: prefix.value,
    prefix: prefix.prefix,
    number: prefix.number,
  }));

  if (newAdmissionPrefixes.length > 0) {
    await AdmissionPrefix.insertMany(newAdmissionPrefixes, { session });
  }

  return newAdmissionPrefixes.length;
};