import createRegistrationForm from './RegistrationForm/create.js';
import getRegistrationsBySchoolIdandyear from './RegistrationForm/get.js';
import deleteRegistrationbyid from './RegistrationForm/delete.js';
import updateRegistrationForm from './RegistrationForm/update.js';
import getRegistrationsBySchoolId from './RegistrationForm/getBySchoolId.js';
import downloadreceipts from './RegistrationForm/downloadreceipts.js';
import {creatregistrationpayment} from './RegistrationForm/payment.js';
import getstudentbystudentidandreceiptnumber from './RegistrationForm/getbystudentidandreceiptnum.js';
import {handlePaymentSuccess} from './RegistrationForm/payment.js'
import {handlePaymentFailure} from './RegistrationForm/payment.js'


import createAdmissionForm from './AdmissionForm/create.js'
import getAdmissionFormsBySchoolId from './AdmissionForm/get.js';
import deleteAdmissionFormById from './AdmissionForm/delete.js';
import updateAdmissionForm from './AdmissionForm/update.js';
import getbySchoolIdandYear from './AdmissionForm/getbyyear.js'
import getAdmissionFormsByAcdemicHistoryYear from './AdmissionForm/getbyacdemichistoryYear.js';
import updatebyAcdemicHistory from './AdmissionForm/updateacdemichistory.js';
import updateTCinactiveStatus from './AdmissionForm/tcstatusupdate.js';
import getDataForStudentLedger from './AdmissionForm/getforledger.js';
import getstudentforcount from './AdmissionForm/getstudentforcount.js';
import getbySchoolIdandYearCpy from './AdmissionForm/getbyyearCpy.js';
import createadmissionpayment from './AdmissionForm/payment.js';
import getadmissionbystudentidandreceiptnumber from './AdmissionForm/getbystudentidandreceiptnum.js'


import createTCForm from './TCForm/create.js';
import getTCForm from './TCForm/get.js';
import deleteTCFormById from './TCForm/delete.js';
import updateTCForm from './TCForm/update.js'
import creattcpayment from './TCForm/payment.js';
import gettcstudentbystudentidandreceiptnumber from './TCForm/getbystudentidandreceiptnum.js'

import createConcessionForm from './ConcessionForm/create.js';
import getConcessionFormsBySchoolId from './ConcessionForm/get.js';
import deleteConcessionFormById from './ConcessionForm/delete.js';
import updateConcessionForm from './ConcessionForm/update.js';

import getbyadmissionId from './ConcessionForm/getbyADMId.js';
import updatestatus from './RegistrationForm/updatestatus.js';
import updateadmissionstatus from './AdmissionForm/upadatestatus.js';
import updateConcessionStatus from './ConcessionForm/updatestatus.js';
import updateTCstatus from './TCForm/Updatestatus.js';

import getRegistrationStatus from './RegistrationForm/getstatus.js';
import getAdmissionStatus from './AdmissionForm/getstatus.js';
import getTCStatus from './TCForm/getstatus.js';
import getConcessionStatus from './ConcessionForm/getstatus.js';

export {
  createRegistrationForm,
  getRegistrationsBySchoolId,
  deleteRegistrationbyid,
  updateRegistrationForm, 
  getRegistrationsBySchoolIdandyear,
  creatregistrationpayment,
  handlePaymentSuccess,
  handlePaymentFailure,

  getstudentbystudentidandreceiptnumber,
  downloadreceipts,
  createAdmissionForm,
  getAdmissionFormsBySchoolId,
  deleteAdmissionFormById,
  updateAdmissionForm,
  getbySchoolIdandYear,
  getAdmissionFormsByAcdemicHistoryYear,
  getbySchoolIdandYearCpy,
  createadmissionpayment,
  getadmissionbystudentidandreceiptnumber,
  updatebyAcdemicHistory,
  updateTCinactiveStatus,
  createTCForm,
  getTCForm,
  deleteTCFormById,
  updateTCForm,
  creattcpayment,
  gettcstudentbystudentidandreceiptnumber ,
  createConcessionForm,
  getConcessionFormsBySchoolId,
  deleteConcessionFormById,
  updateConcessionForm,
  getbyadmissionId,
  updatestatus,
  updateadmissionstatus,
  updateConcessionStatus,
  updateTCstatus,
  getRegistrationStatus,
  getAdmissionStatus,
  getTCStatus,
  getConcessionStatus,
  getDataForStudentLedger ,
  getstudentforcount


};
