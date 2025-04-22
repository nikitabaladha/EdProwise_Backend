
  // import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
  // import FeesType from "../../../../models/FeesModule/FeesType.js";
  // import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
  // import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
  // import Fine from "../../../../models/FeesModule/Fine.js";

  // export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  //   try {
  //     const { classId, sectionIds, schoolId, admissionNumber } = req.query;
  
  //     if (!classId || !sectionIds || !schoolId || !admissionNumber) {
  //       return res.status(400).json({
  //         message: "classId, sectionIds, schoolId, and admissionNumber are required",
  //       });
  //     }
  
  //     const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];
  //     const feeTypes = await FeesType.find();
  //     const feeTypeMap = feeTypes.reduce((acc, type) => {
  //       acc[type._id.toString()] = type.name;
  //       return acc;
  //     }, {});
  
  //     const feesStructures = await FeesStructure.find({
  //       schoolId,
  //       classId,
  //       sectionIds: { $in: sectionIdArray },
  //     }).lean();
  
  //     if (!feesStructures.length) {
  //       return res.status(404).json({ message: "No fee structure found." });
  //     }
  
  //     const concessionForm = await ConcessionFormModel.findOne({
  //       AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
  //     });
  
  //     const admissionData = await AdmissionForm.findOne({ AdmissionNumber: admissionNumber }).lean();
  //     const fineData = await Fine.findOne({ schoolId });
  
  //     const today = new Date();
  //     let totalFeesAmount = 0;
  //     let totalConcession = 0;
  //     let totalFine = 0;
  //     let totalFeesPayable = 0;
  //     const feeInstallments = [];
  
  //     for (const structure of feesStructures) {
  //       for (const inst of structure.installments) {
  //         for (const fee of inst.fees) {
  //           const feeAmount = fee.amount || 0;
  //           let concessionAmount = 0;
  //           let fineAmount = 0;
  
   
  //           if (concessionForm?.concessionDetails?.length) {
  //             const concessionMatch = concessionForm.concessionDetails.find(
  //               (c) =>
  //                 c.installmentName === inst.name &&
  //                 c.feesType.toString() === fee.feesTypeId.toString()
  //             );
  //             if (concessionMatch) {
  //               concessionAmount = concessionMatch.concessionAmount || 0;
  //             }
  //           }
  
     
  //           const dueDate = new Date(inst.dueDate);
  //           if (today > dueDate && fineData) {
  //             const { feeType, frequency, value, maxCapFee } = fineData;
  
  //             const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
  
  //             let multiplier = 0;
  //             const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  //             const monthsLate =
  //               today.getMonth() - dueDate.getMonth() + 12 * (today.getFullYear() - dueDate.getFullYear());
  //             const yearsLate = today.getFullYear() - dueDate.getFullYear();
  
  //             switch (frequency) {
  //               case "Daily":
  //                 multiplier = daysLate;
  //                 break;
  //               case "Monthly":
  //                 multiplier = monthsLate;
  //                 break;
  //               case "Annually":
  //                 multiplier = yearsLate;
  //                 break;
  //               case "Fixed":
  //                 multiplier = 1;
  //                 break;
  //             }
  
  //             fineAmount = base * multiplier;
  //             if (maxCapFee) {
  //               fineAmount = Math.min(fineAmount, maxCapFee);
  //             }
  //           }
  
  //           totalFeesAmount += feeAmount;
  //           totalConcession += concessionAmount;
  //           totalFine += fineAmount;
  //           totalFeesPayable += feeAmount - concessionAmount + fineAmount;
  
  //           feeInstallments.push({
  //             feesTypeId: {
  //               _id: fee.feesTypeId,
  //               name: feeTypeMap[fee.feesTypeId.toString()],
  //             },
  //             installmentName: inst.name,
  //             dueDate: inst.dueDate,
  //             amount: feeAmount,
  //             concessionAmount,
  //             fineAmount,
  //           });
  //         }
  //       }
  //     }
  
  //     res.status(200).json({
  //       data: {
  //         admissionDetails: {
  //           firstName: admissionData?.firstName,
  //           lastName: admissionData?.lastName,
  //           applicationDate: admissionData?.applicationDate,
  //           AdmissionNumber: admissionData?.AdmissionNumber,
  //         },
  //         feeInstallments,
  //         finePolicy: fineData || null,
  //         concession: concessionForm || null,
  //         totals: {
  //           totalFeesAmount,
  //           totalConcession,
  //           totalFine,
  //           totalFeesPayable,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // };
  

  // export default getAllFeesInstallmentsWithConcession;



  import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
  import FeesType from "../../../../models/FeesModule/FeesType.js";
  import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
  import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
  import Fine from "../../../../models/FeesModule/Fine.js";
  import SchoolFees from "../../../../models/FeesModule/SchoolFees.js";
  
  export const getAllFeesInstallmentsWithConcession = async (req, res) => {
    try {
      const { classId, sectionIds, schoolId, admissionNumber } = req.query;
  
    
      if (!classId || !sectionIds || !schoolId || !admissionNumber) {
        return res.status(400).json({
          message: "classId, sectionIds, schoolId, and admissionNumber are required",
        });
      }
  
 
      const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];
  

      const feeTypes = await FeesType.find();
      const feeTypeMap = feeTypes.reduce((acc, type) => {
        acc[type._id.toString()] = type.name;
        return acc;
      }, {});
  

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId,
        sectionIds: { $in: sectionIdArray },
      }).lean();
  
      if (!feesStructures.length) {
        return res.status(404).json({ message: "No fee structure found." });
      }

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
      });
  

      const admissionData = await AdmissionForm.findOne({ AdmissionNumber: admissionNumber }).lean();
  

      const fineData = await Fine.findOne({ schoolId });
  
      const today = new Date();
  
      let totalFeesAmount = 0;
      let totalConcession = 0;
      let totalFine = 0;
      let totalFeesPayable = 0;
      const feeInstallments = [];
  
   
      const paidFeesData = await SchoolFees.findOne({ schoolId, studentAdmissionNumber: admissionNumber }).lean();
  
   
  

      for (const structure of feesStructures) {
        for (let i = 0; i < structure.installments.length; i++) {
          const inst = structure.installments[i];
          const instNumber = inst.number ?? (i + 1); 
  
     
          for (const fee of inst.fees) {
            const feeAmount = fee.amount || 0;
            let concessionAmount = 0;
            let fineAmount = 0;
  

            if (concessionForm?.concessionDetails?.length) {
              const concessionMatch = concessionForm.concessionDetails.find(
                (c) =>
                  c.installmentName === inst.name &&
                  c.feesType.toString() === fee.feesTypeId.toString()
              );
              if (concessionMatch) {
                concessionAmount = concessionMatch.concessionAmount || 0;
              }
            }
  
            const dueDate = new Date(inst.dueDate);
            if (today > dueDate && fineData) {
              const { feeType, frequency, value, maxCapFee } = fineData;
  
              const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
  
              let multiplier = 0;
              const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
              const monthsLate =
                today.getMonth() - dueDate.getMonth() + 12 * (today.getFullYear() - dueDate.getFullYear());
              const yearsLate = today.getFullYear() - dueDate.getFullYear();
  
              switch (frequency) {
                case "Daily":
                  multiplier = daysLate;
                  break;
                case "Monthly":
                  multiplier = monthsLate;
                  break;
                case "Annually":
                  multiplier = yearsLate;
                  break;
                case "Fixed":
                  multiplier = 1;
                  break;
              }
  
              fineAmount = base * multiplier;
              if (maxCapFee) {
                fineAmount = Math.min(fineAmount, maxCapFee);
              }
            }
  
 
            const paidAmount = paidFeesData?.installments
              ?.find(instData => instData.number === instNumber) 
              ?.feeItems
              ?.find(feeItem => feeItem.feeTypeId.toString() === fee.feesTypeId.toString())?.paid || 0;
  
  
      
            const balanceAmount = feeAmount - concessionAmount + fineAmount - paidAmount;
  
          
  
            totalFeesAmount += feeAmount;
            totalConcession += concessionAmount;
            totalFine += fineAmount;
            totalFeesPayable += balanceAmount;
  
            if (balanceAmount <= 0) continue; 
            feeInstallments.push({
              feesTypeId: {
                _id: fee.feesTypeId,
                name: feeTypeMap[fee.feesTypeId.toString()],
              },
              installmentName: inst.name,
              dueDate: inst.dueDate,
              amount: feeAmount,
              concessionAmount,
              fineAmount,
              paidAmount,
              balanceAmount,
            });
          }
        }
      }
  
 
      res.status(200).json({
        data: {
          admissionDetails: {
            firstName: admissionData?.firstName,
            lastName: admissionData?.lastName,
            applicationDate: admissionData?.applicationDate,
            AdmissionNumber: admissionData?.AdmissionNumber,
          },
          feeInstallments,
          finePolicy: fineData || null,
          concession: concessionForm || null,
          totals: {
            totalFeesAmount,
            totalConcession,
            totalFine,
            totalFeesPayable,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export default getAllFeesInstallmentsWithConcession;
  
  
  
