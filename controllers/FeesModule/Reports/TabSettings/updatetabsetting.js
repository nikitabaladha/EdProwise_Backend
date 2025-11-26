// import ReportsTabSettings from "../../../../models/FeesModule/ReportsTabSettings.js";

// async function update(req, res) {
//   try {
//     const { tabType, inFields } = req.body;
//     const schoolId = req.user?.schoolId;

 
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: "Access denied: You do not have permission to update Reports Tab Settings.",
//       });
//     }


//     if (!tabType || typeof tabType !== "string") {
//       return res.status(400).json({
//         hasError: true,
//         message: "tabType is required and must be a string.",
//       });
//     }


//     if (!inFields || !Array.isArray(inFields) || inFields.length === 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: "inFields is required, must be a non-empty array.",
//       });
//     }

//     for (const field of inFields) {
//       if (!field.id || typeof field.id !== "string") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each inFields object must have a valid id (string).",
//         });
//       }
//       if (!field.label || typeof field.label !== "string") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each inFields object must have a valid label (string).",
//         });
//       }
//       if (typeof field.isDefault !== "boolean") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each inFields object must have a valid isDefault (boolean).",
//         });
//       }
//     }


//     const updatedSettings = await ReportsTabSettings.findOneAndUpdate(
//       { schoolId, tabType },
//       { inFields, updatedAt: new Date() },
//       { new: true, runValidators: true }
//     );

//     if (!updatedSettings) {
//       return res.status(404).json({
//         hasError: true,
//         message: `Reports Tab Settings for tabType "${tabType}" not found for this school.`,
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "Reports Tab Settings updated successfully.",
//       data: updatedSettings,
//     });
//   } catch (error) {
//     console.error("Error updating Reports Tab Settings:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to update Reports Tab Settings.",
//       error: error.message,
//     });
//   }
// }

// export default update;



import ReportsTabSettings from "../../../../models/FeesModule/ReportsTabSettings.js";

async function update(req, res) {
  try {
    const { tabType, inFields, outFields } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to update Reports Tab Settings.",
      });
    }

    if (!tabType || typeof tabType !== "string") {
      return res.status(400).json({
        hasError: true,
        message: "tabType is required and must be a string.",
      });
    }

    if (!inFields || !Array.isArray(inFields)) {
      return res.status(400).json({
        hasError: true,
        message: "inFields is required and must be an array.",
      });
    }

    if (!outFields || !Array.isArray(outFields)) {
      return res.status(400).json({
        hasError: true,
        message: "outFields is required and must be an array.",
      });
    }

    for (const field of inFields) {
      if (!field.id || typeof field.id !== "string") {
        return res.status(400).json({
          hasError: true,
          message: "Each inFields object must have a valid id (string).",
        });
      }
      if (!field.label || typeof field.label !== "string") {
        return res.status(400).json({
          hasError: true,
          message: "Each inFields object must have a valid label (string).",
        });
      }
      if (typeof field.isDefault !== "boolean") {
        return res.status(400).json({
          hasError: true,
          message: "Each inFields object must have a valid isDefault (boolean).",
        });
      }
    }

    for (const field of outFields) {
      if (!field.id || typeof field.id !== "string") {
        return res.status(400).json({
          hasError: true,
          message: "Each outFields object must have a valid id (string).",
        });
      }
      if (!field.label || typeof field.label !== "string") {
        return res.status(400).json({
          hasError: true,
          message: "Each outFields object must have a valid label (string).",
        });
      }
      if (typeof field.isDefault !== "boolean") {
        return res.status(400).json({
          hasError: true,
          message: "Each outFields object must have a valid isDefault (boolean).",
        });
      }
    }

    // Check for duplicate field IDs
    const allFieldIds = [...inFields.map(f => f.id), ...outFields.map(f => f.id)];
    const uniqueFieldIds = new Set(allFieldIds);
    if (uniqueFieldIds.size !== allFieldIds.length) {
      return res.status(400).json({
        hasError: true,
        message: "Field IDs must be unique across inFields and outFields.",
      });
    }

    const updatedSettings = await ReportsTabSettings.findOneAndUpdate(
      { schoolId, tabType },
      { inFields, outFields, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedSettings) {
      return res.status(404).json({
        hasError: true,
        message: `Reports Tab Settings for tabType "${tabType}" not found for this school.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Reports Tab Settings updated successfully.",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating Reports Tab Settings:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Reports Tab Settings.",
      error: error.message,
    });
  }
}

export default update;