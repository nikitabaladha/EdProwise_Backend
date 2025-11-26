
// import ReportsTabSettings from "../../../../models/FeesModule/ReportsTabSettings.js";

// async function create(req, res) {
//   try {
//     const { tabType, inFields, outFields } = req.body;


//     if (!tabType || typeof tabType !== "string") {
//       return res.status(400).json({
//         hasError: true,
//         message: "tabType is required and must be a string.",
//       });
//     }


//     if (!inFields || !Array.isArray(inFields)) {
//       return res.status(400).json({
//         hasError: true,
//         message: "inFields is required and must be an array.",
//       });
//     }


//     if (!outFields || !Array.isArray(outFields)) {
//       return res.status(400).json({
//         hasError: true,
//         message: "outFields is required and must be an array.",
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


//     for (const field of outFields) {
//       if (!field.id || typeof field.id !== "string") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each outFields object must have a valid id (string).",
//         });
//       }
//       if (!field.label || typeof field.label !== "string") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each outFields object must have a valid label (string).",
//         });
//       }
//       if (typeof field.isDefault !== "boolean") {
//         return res.status(400).json({
//           hasError: true,
//           message: "Each outFields object must have a valid isDefault (boolean).",
//         });
//       }
//     }


//     const allFieldIds = [...inFields.map(f => f.id), ...outFields.map(f => f.id)];
//     const uniqueFieldIds = new Set(allFieldIds);
//     if (uniqueFieldIds.size !== allFieldIds.length) {
//       return res.status(400).json({
//         hasError: true,
//         message: "Field IDs must be unique across inFields and outFields.",
//       });
//     }

//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: "Access denied: You do not have permission to create Reports Tab Settings.",
//       });
//     }

//     const existingSettings = await ReportsTabSettings.findOne({
//       schoolId,
//       tabType,
//     });
//     if (existingSettings) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Reports Tab Settings for tabType "${tabType}" already exists for this school.`,
//       });
//     }

//     const reportsTabSettings = new ReportsTabSettings({
//       schoolId,
//       tabType,
//       inFields,
//       outFields,
//     });

//     await reportsTabSettings.save();

//     return res.status(201).json({
//       hasError: false,
//       message: "Reports Tab Settings created successfully.",
//       data: reportsTabSettings,
//     });
//   } catch (error) {
//     console.error("Error creating Reports Tab Settings:", error);
//     if (error.code === 11000) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Reports Tab Settings for tabType "${req.body.tabType}" already exists for this school.`,
//       });
//     }
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to create Reports Tab Settings.",
//       error: error.message,
//     });
//   }
// }

// export default create;


import ReportsTabSettings from "../../../../models/FeesModule/ReportsTabSettings.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";

async function create(req, res) {
  try {
    const { tabType, inFields, outFields } = req.body;

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


    const allFieldIds = [...inFields.map(f => f.id), ...outFields.map(f => f.id)];
    const uniqueFieldIds = new Set(allFieldIds);
    if (uniqueFieldIds.size !== allFieldIds.length) {
      return res.status(400).json({
        hasError: true,
        message: "Field IDs must be unique across inFields and outFields.",
      });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to create Reports Tab Settings.",
      });
    }


    const existingSettings = await ReportsTabSettings.findOne({
      schoolId,
      tabType,
    });
    if (existingSettings) {
      return res.status(400).json({
        hasError: true,
        message: `Reports Tab Settings for tabType "${tabType}" already exists for this school.`,
      });
    }

    const schoolFeesTypes = await FeesType.find({
      schoolId,
      groupOfFees: "School Fees",
    }).select("feesTypeName academicYear");

    const existingFeeNames = new Set([
      ...inFields.map(f => f.id),
      ...outFields.map(f => f.id),
    ]);

    const additionalOutFields = [];
    for (const fee of schoolFeesTypes) {
      const feeName = fee.feesTypeName.toLowerCase().replace(/\s+/g, "");
      const suffixes = ["Due", "Paid", "Concession"];
      for (const suffix of suffixes) {
        const fieldId = `${feeName}${suffix}`;
        if (!existingFeeNames.has(fieldId)) {
          additionalOutFields.push({
            id: fieldId,
            label: `${fee.feesTypeName} (${suffix})`,
            isDefault: false,
          });
          existingFeeNames.add(fieldId); 
        }
      }
    }


    const finalOutFields = [...outFields, ...additionalOutFields];

    const reportsTabSettings = new ReportsTabSettings({
      schoolId,
      tabType,
      inFields,
      outFields: finalOutFields,
    });

    await reportsTabSettings.save();

    return res.status(201).json({
      hasError: false,
      message: "Reports Tab Settings created successfully.",
      data: reportsTabSettings,
    });
  } catch (error) {
    console.error("Error creating Reports Tab Settings:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: `Reports Tab Settings for tabType "${req.body.tabType}" already exists for this school.`,
      });
    }
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Reports Tab Settings.",
      error: error.message,
    });
  }
}

export default create;