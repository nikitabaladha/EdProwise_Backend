import EmployeeRegistration, { EmployeeIdCounter } from '../../../../models/PayrollModule/Employer/EmployeeRegistration.js';
import EmployeeIdSetting from '../../../../models/PayrollModule/AdminSettings/EmployeeIdSetting.js';
import mongoose from 'mongoose';

const deleteEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmployeeRegistration.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ hasError: true, message: 'Employee not found' });
    }

    return res.status(200).json({ hasError: false, message: 'Employee deleted successfully' });
  } catch (error) {
    return res.status(500).json({ hasError: true, message: 'Delete failed', error });
  }
};

export default deleteEmployeeById;
