

import getall from './StudentLedger/getall.js';
import createtab from './TabSettings/create.js';
import gettab from './TabSettings/gettab.js';
import updatetab from './TabSettings/updatetabsetting.js';
import RegistrationData from './Reports/Registartion.js';
import AdmissionData from './Reports/AdmissionFees.js';
import TCData from './Reports/TCFees.js';
import BoardRegistrationData from './Reports/BoardRegistrationFees.js';
import BoardExamData from './Reports/BoardExamFees.js';
import DatewiseFeesData from './Reports/DatewiseFees.js';
import StudentwiseFeesData from './Reports/StudentwiseFeesCollection.js';
import SchoolFees from './Reports/SchoolFees.js'
import LateFeeandExcessFees from './Reports/LateandExcessFees.js';
import DateWiseConcessionReport from './Reports/DateWiseConcessionReport.js';
import StudentWiseConcessionReport from './Reports/StudentWiseConcessionReport.js'

export {
getall,
createtab,
gettab,
updatetab,
RegistrationData,
AdmissionData,
TCData,
BoardRegistrationData,
BoardExamData,
DatewiseFeesData,
StudentwiseFeesData,
SchoolFees,
LateFeeandExcessFees,
DateWiseConcessionReport,
StudentWiseConcessionReport
};
