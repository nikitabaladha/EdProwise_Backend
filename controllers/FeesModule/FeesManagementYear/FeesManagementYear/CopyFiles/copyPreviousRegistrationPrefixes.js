import RegistartionPrefix from "../../../../../models/FeesModule/RegistrationPrefix.js";


export const copyPreviousRegistrationPrefixes = async (schoolId, academicYear, prevAcademicYear, session) => {
  const previousRegistrationPrefixes = await RegistartionPrefix.find({
    schoolId,
    academicYear: prevAcademicYear,
  }).session(session);

  const newRegistrationPrefixes = previousRegistrationPrefixes.map((prefix) => ({
    schoolId,
    academicYear,
    type: prefix.type,
    value: prefix.value,
    prefix: prefix.prefix,
    number: prefix.number,
  }));

  if (newRegistrationPrefixes.length > 0) {
    await RegistartionPrefix.insertMany(newRegistrationPrefixes, { session });
  }

  return newRegistrationPrefixes.length;
};