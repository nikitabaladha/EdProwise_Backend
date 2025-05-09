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

import getbyadmissionId from './ConcessionForm/getbyADMId.js'

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
  getbyadmissionId 
};
