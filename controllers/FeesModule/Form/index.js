import createRegistrationForm from './RegistrationForm/create.js';
import getRegistrationsBySchoolIdandyear from './RegistrationForm/get.js';
import deleteRegistrationbyid from './RegistrationForm/delete.js';
import updateRegistrationForm from './RegistrationForm/update.js';
import getRegistrationsBySchoolId from './RegistrationForm/getBySchoolId.js';
import downloadreceipts from './RegistrationForm/downloadreceipts.js';

import createAdmissionForm from './AdmissionForm/create.js'
import getAdmissionFormsBySchoolId from './AdmissionForm/get.js';
import deleteAdmissionFormById from './AdmissionForm/delete.js';
import updateAdmissionForm from './AdmissionForm/update.js';
import getbySchoolIdandYear from './AdmissionForm/getbyyear.js'


import createTCForm from './TCForm/create.js';
import getTCForm from './TCForm/get.js';
import deleteTCFormById from './TCForm/delete.js';
import updateTCForm from './TCForm/update.js'

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
  downloadreceipts,
  createAdmissionForm,
  getAdmissionFormsBySchoolId,
  deleteAdmissionFormById,
  updateAdmissionForm,
  getbySchoolIdandYear,
  createTCForm,
  getTCForm,
  deleteTCFormById,
  updateTCForm,
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
  getConcessionStatus

};
