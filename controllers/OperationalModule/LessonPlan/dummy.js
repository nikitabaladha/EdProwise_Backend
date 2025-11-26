import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import getAPI from "../../../../../../api/getAPI";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../../../ConfirmationDialog";
import { FiDownload } from "react-icons/fi";
import CreatableSelect from "react-select/creatable";

const PlanLessonList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [records, setRecords] = useState([]);
  const [academicYear, setAcademicYear] = useState(
    localStorage.getItem("selectedAcademicYear") || ""
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails"));
    const id = userDetails?.schoolId;
    if (!id) {
      toast.error("School ID not found. Please log in again.");
      return;
    }
    setSchoolId(id);
  }, []);

  useEffect(() => {
    if (!schoolId || !academicYear) return;
    fetchClasses();
    fetchLessonPlans();
  }, [schoolId, academicYear]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
      fetchLessonPlans();
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getAPI(
        `/get-class-and-section-by-year/${schoolId}/${academicYear}`
      );
      if (!res.data.hasError) {
        const classOptions = res.data.data.map((classItem) => ({
          value: classItem.className,
          label: classItem.className,
          sections: classItem.sections,
        }));
        setClasses(classOptions);
      } else {
        toast.error("Failed to fetch classes");
      }
    } catch (error) {
      toast.error("Error fetching classes");
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = () => {
    if (selectedClass) {
      const selectedClassData = classes.find(
        (c) => c.value === selectedClass.value
      );
      if (selectedClassData && selectedClassData.sections) {
        const sectionOptions = selectedClassData.sections.map((section) => ({
          value: section.name,
          label: section.name,
        }));
        setSections(sectionOptions);
      }
    }
  };

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      let query = `?schoolId=${schoolId}&academicYear=${academicYear}`;
      if (selectedClass) query += `&className=${selectedClass.value}`;
      if (selectedSection) query += `&sectionName=${selectedSection.value}`;

      const res = await getAPI(`/get-lesson-plan${query}`, true);
      console.log("get lesson plan", res);

      if (!res.data.hasError) {
        setRecords(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to fetch lesson plans");
        setRecords([]);
      }
    } catch (error) {
      toast.error("Error fetching lesson plans");
      console.error("Error fetching lesson plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAdd = (event) => {
    event.preventDefault();
    navigate(
      `/school-dashboard/operational-service/other-management/lesson-plan/add-lesson-plan`,
      { state: { schoolId, academicYear } }
    );
  };

  const navigateToView = (record) => {
    navigate(
      `/school-dashboard/operational-service/other-management/lesson-plan/view-lesson-plan`,
      { state: { record } }
    );
  };

  const navigateToUpdate = (record) => {
    navigate(
      `/school-dashboard/operational-service/other-management/lesson-plan/update-lesson-plan`,
      { state: { record } }
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-end me-3 mb-2 gap-2 align-items-center">
        <Link
          onClick={(event) => navigateToAdd(event)}
          className="btn btn-sm btn-primary"
        >
          Add Lesson Plan
        </Link>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="card m-2">
            <div className="card-body custom-heading-padding">
              <div className="container">
                <div className="card-header d-flex flex-wrap align-items-center">
                  <h4 className="card-title flex-grow-1 text-center">
                    Lesson Plan
                  </h4>
                  <select
                    className="form-select form-select-sm me-2 w-auto"
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value);
                    }}
                  >
                    <option disabled>Select Academic Year</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>

                  <CreatableSelect
                    isClearable
                    name="class"
                    options={classes}
                    placeholder="Select Class"
                    className="email-select form-select-sm text-nowrap"
                    value={selectedClass}
                    onChange={(option) => {
                      setSelectedClass(option);
                      setSelectedSection(null);
                      setSections([]);
                    }}
                    isLoading={loading}
                  />

                  <CreatableSelect
                    isClearable
                    name="section"
                    options={sections}
                    placeholder="Select Section"
                    className="email-select form-select-sm"
                    value={selectedSection}
                    onChange={setSelectedSection}
                    isDisabled={!selectedClass}
                    isLoading={loading}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered text-center">
                  <thead className="bg-light-subtle">
                    <tr className="payroll-table-header">
                      <th>
                        <div className="form-check ms-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="customCheck1"
                          />
                        </div>
                      </th>
                      <th className="text-nowrap">Name of Teacher</th>
                      <th className="text-nowrap">Subject</th>
                      <th className="text-nowrap">Progress</th>
                      <th className="text-nowrap">Completed Perc.</th>
                      <th className="text-nowrap">Status</th>
                      <th className="text-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((plan) => (
                        <tr key={plan._id}>
                          <td>
                            <div className="form-check ms-1">
                              <input
                                type="checkbox"
                                className="form-check-input"
                              />
                            </div>
                          </td>
                          <td>{plan.staffName}</td>
                          <td>{plan.subjectName}</td>
                          <td>{plan.subjectProgress || "On Track"}</td>
                          <td>{plan.completedPercentage || "0"}%</td>
                          <td>{plan.subjectStatus || "Pending"}</td>
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <Link
                                className="btn btn-light btn-sm"
                                // onClick={() => navigateToView(plan)}
                              >
                                <iconify-icon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Link>
                              <Link
                                className="btn btn-soft-primary btn-sm"
                                // onClick={() => navigateToUpdate(plan)}
                              >
                                <iconify-icon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Link>
                              <Link className="btn btn-soft-danger btn-sm">
                                <iconify-icon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Link>
                              <button className="btn btn-primary btn-sm">
                                <FiDownload className="align-middle fs-18" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No lesson plans found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanLessonList;
