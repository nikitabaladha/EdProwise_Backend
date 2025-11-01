

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
import DateWiseFeeSDataWithConcession from './Reports/DateWiseFeeWithConcession.js'
import StudentwiseFeesData from './Reports/StudentwiseFeesCollection.js';
import StudentwiseFeesDataWithConcession from './Reports/StudentwiseFeesCollectionWithConcession.js';
import SchoolFees from './Reports/SchoolFees.js';
import FeeStructure from './Reports/FeesStructure.js'
import LateFeeandExcessFees from './Reports/LateandExcessFees.js';
import DateWiseConcessionReport from './Reports/DateWiseConcessionReport.js';
import StudentWiseConcessionReport from './Reports/StudentWiseConcessionReport.js';
import FeesRefundReport from './Reports/Refund.js';
import FeesCancelledReport from './Reports/getcancelleddata.js'
import FeesChequeReturn from './Reports/getChequeReturndata.js'
import lossoffeeduetoleftstudent from './AdvancedReport/leftstudentfeedata.js';
import lossoffeeduetoLateAdmission from './AdvancedReport/leftstudentfeedataLateAdmission.js';
import Defaulterfees from './AdvancedReport/defaulterFees.js'
import ArrearFeesReport from './AdvancedReport/ArrearFeesReport.js';
import FeesReconHeadwise from './ReconFees/headwise.js';
import AdvancedFeesReport from './AdvancedReport/AdvancedFeesReport.js';
import OpeningAndClosingAdvancedReport from './AdvancedReport/OpeningAndClosingAdvancedReport.js'
import FeesvsFinanacereport from './ReconFees/FeesVsFinance.js'
import FeesreconFeeswise from './ReconFees/FeesReconFeeswise.js'
import SchoolFeesPaidAndConcession from "./ReconFees/SchoolFees.js"
import FeesReconStudentWise from './ReconFees/FeesReconStudentWise.js'
import SchoolFeesINCConcession from './Reports/SchoolFeesINConcession.js'
import SchoolFeesEXCConcession from './Reports/SchoolFeesEXCConcession.js'
import ArrearFeesArchive from './AdvancedReport/getArreararchivedata.js';
import StudentWiseFeesDue from './AdvancedReport/studentWiseFeesDue.js';
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
DateWiseFeeSDataWithConcession,
StudentwiseFeesData,
StudentwiseFeesDataWithConcession,
SchoolFees,
FeeStructure,
LateFeeandExcessFees,
DateWiseConcessionReport,
StudentWiseConcessionReport,
FeesRefundReport,
FeesCancelledReport,
FeesChequeReturn,
lossoffeeduetoleftstudent,
lossoffeeduetoLateAdmission,
Defaulterfees,
ArrearFeesReport,
FeesReconHeadwise,
AdvancedFeesReport,
OpeningAndClosingAdvancedReport,
FeesvsFinanacereport,
FeesreconFeeswise,
SchoolFeesPaidAndConcession,
FeesReconStudentWise,
SchoolFeesINCConcession,
SchoolFeesEXCConcession,
ArrearFeesArchive,
StudentWiseFeesDue
};
