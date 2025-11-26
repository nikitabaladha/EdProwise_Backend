import StudentHealthDetail from "../../../models/OperationalModule/StudentHealthDetail.js";
export const updateStudentHealthRecord = async (req, res) => {
  try {
    const { id, healthDetailId } = req.params; 
    const updateData = req.body;

    console.log("id",id);
    console.log("healthDetailId", healthDetailId);
    
    
    const updatedDoc = await StudentHealthDetail.findOneAndUpdate(
      { _id: id, "healthDetails._id": healthDetailId },
      {
        $set: {
          "healthDetails.$.academicYear": updateData.academicYear,
          "healthDetails.$.class": updateData.class,
          "healthDetails.$.section": updateData.section,
          "healthDetails.$.age": updateData.age,
          "healthDetails.$.height": updateData.height,
          "healthDetails.$.weight": updateData.weight,
          "healthDetails.$.bmi": updateData.bmi,
          "healthDetails.$.bloodGroup": updateData.bloodGroup,
          "healthDetails.$.chronic": updateData.chronic,
          "healthDetails.$.physicalDisability": updateData.physicalDisability,
          "healthDetails.$.surgery": updateData.surgery,
        },
      },
      { new: true }
    );

    if (!updatedDoc) {
      return res
        .status(404)
        .json({ hasError: true, message: "Health record not found" });
    }

    res.json({
      hasError: false,
      message: "Health record updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating health record:", error);
    res.status(500).json({
      hasError: true,
      message: "Server error",
      error: error.message,
    });
  }
};

export default updateStudentHealthRecord;