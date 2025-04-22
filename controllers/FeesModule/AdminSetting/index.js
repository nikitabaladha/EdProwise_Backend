import createFeesType from "./FeesType/create.js";
import getAllFeesType from "./FeesType/getAll.js";
import deleteFeesType from "./FeesType/delete.js";
import updateFeesType from "./FeesType/update.js";

import createMasterDefineShift from "./MasterDefineShift/create.js";
import getAllMasterDefineShift from "./MasterDefineShift/getAll.js";
import updateMasterDefineShift from "./MasterDefineShift/update.js";
import deleteMasterDefineShift from "./MasterDefineShift/delete.js";

import createClassAndSection from "./ClassAndSection/create.js";
import getClassAndSection from "./ClassAndSection/getclassandsection.js";
import deleteClassAndSection from "./ClassAndSection/delete.js"
import updateClassAndSection from "./ClassAndSection/update.js"

import createFeesStructure from "./FeesStructure/create.js";
import getFeesStructure from "./FeesStructure/get.js";
import deleteFeesStructure from "./FeesStructure/delete.js"
import updateFeesStructure from "./FeesStructure/update.js";
import getFeesTypeInstallments from "./FeesStructure/fetchinstallment.js";

import createPrefix from "./PrefixSetting/RegistrationPrefix/create.js";
import getPrefixes from "./PrefixSetting/RegistrationPrefix/get.js";
import deletPrefix from "./PrefixSetting/RegistrationPrefix/delete.js"

import createAdmissionPrefix from "./PrefixSetting/AdmissionPrefix/create.js";
import getAdmissionPrefix from "./PrefixSetting/AdmissionPrefix/getAdmissionPrefix.js";
import deletAdmissionPrefix from "./PrefixSetting/AdmissionPrefix/delete.js"

import createFine from "./Fine/create.js";
import getFinesBySchoolId from "./Fine/get.js";
import deleteFineById from "./Fine/delete.js";

export {
  createFeesType,
  getAllFeesType,
  deleteFeesType,
  updateFeesType,
  createMasterDefineShift,
  getAllMasterDefineShift,
  updateMasterDefineShift,
  deleteMasterDefineShift,
  createClassAndSection,
  getClassAndSection,
  deleteClassAndSection,
  updateClassAndSection,
  createFeesStructure,
  getFeesStructure,
  deleteFeesStructure,
  updateFeesStructure,
  getFeesTypeInstallments,
  createPrefix,
  getPrefixes,
  deletPrefix,
  createAdmissionPrefix,
  getAdmissionPrefix,
  deletAdmissionPrefix,
  createFine,
  getFinesBySchoolId,
  deleteFineById
};
