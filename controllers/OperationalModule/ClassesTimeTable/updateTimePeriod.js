import TimePeriod from "../../../models/OperationalModule/TimePeriod.js";

const updateTimePeriod = async (req, res) => {
  try {
    const { parentId } = req.params;

    const updated = await TimePeriod.findByIdAndUpdate(parentId, req.body, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ hasError: true, message: "Record not found" });
    }

    res.json({
      hasError: false,
      message: "TimePeriod updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating TimePeriod:", error);
    res.status(500).json({ hasError: true, message: "Internal server error" });
  }
};

// ✅ Update a Single TimePeriodDetail
// export const updateTimePeriodDetail = async (req, res) => {
//   try {
//     const { parentId, detailId } = req.params;

//     const updated = await TimePeriod.findOneAndUpdate(
//       { _id: parentId, "timePeriodDetails._id": detailId },
//       { $set: { "timePeriodDetails.$": req.body } },
//       { new: true }
//     );

//     if (!updated) {
//       return res
//         .status(404)
//         .json({ hasError: true, message: "Detail not found" });
//     }

//     res.json({
//       hasError: false,
//       message: "TimePeriod detail updated successfully",
//       data: updated,
//     });
//   } catch (error) {
//     console.error("Error updating TimePeriod detail:", error);
//     res.status(500).json({ hasError: true, message: "Internal server error" });
//   }
// };

export default updateTimePeriod;