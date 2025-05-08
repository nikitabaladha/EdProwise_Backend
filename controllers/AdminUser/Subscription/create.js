// import Subscription from "../../../models/Subscription.js";
// import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
// import School from "../../../models/School.js";

// async function create(req, res) {
//   try {
// const { error } =
//   SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);

// if (error) {
//   const errorMessages = error.details.map((err) => err.message).join(", ");
//   return res.status(400).json({
//     hasError: true,
//     message: "id ",
//     errorMessages,
//   });
// }

//     const {
//       schoolId,
//       subscriptionFor,
//       subscriptionStartDate,
//       subscriptionNoOfMonth,
//       monthlyRate,
//     } = req.body;

//     const schoolExists = await School.findOne({ schoolId });
//     if (!schoolExists) {
//       return res.status(404).json({
//         hasError: true,
//         message: "school not found.",
//       });
//     }

//     // i want to add subscriptionEndDate accrding to start date and subscriptionNoOfMonth
//     // for example if start date is 07-05-2025 and number of months are 12 at that time the stored end date must be stored like
//     // 07-05-2025 automatically
//     // and  i also want like for example if same subscriptionFor come at that time if user type subscriptionStartDate then you need to check like what is end date
//     // and from databse find what is the endDate if user typed start date is lower than endDate at that time user must be given message like
//     // "you alredy have suscription till "end date" if want to buy new one then buy after "end date" ,
//     // for exmple school has suscription fro fees and it is till 01-12-2025 at that if same school buy another suscription for same fees module
//     // for date 01-11-2025  at that time there  should be message like "you alredy have suscription till "01-12-2025" if want to buy new one then buy after "01-12-2025"
//     const newSubscription = new Subscription({
//       schoolId,
//       subscriptionFor,
//       subscriptionStartDate,
//       subscriptionNoOfMonth,
//       monthlyRate,
//     });

//     await newSubscription.save();

//     return res.status(201).json({
//       hasError: false,
//       message: "Subscription created successfully.",
//       data: newSubscription,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         hasError: true,
//         message:
//           "This Subscription Details already exists for same school on same date.",
//       });
//     }

//     console.error("Error submitting Subscription Details:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error. Please try again later.",
//     });
//   }
// }

// export default create;

// see this api works but i want little modification like for example if same school buys same subscription but he type startDate
// smaller than endDate at that time i want to store startDate one day after the already existing end date for that perticular suscription
// and endDate according to count of numberOf munth
// for example alredy existing subsription is 07-05-2025 to 07-05-2026 for fees and if user takes another subscription for
//  01-11-2025 and number of month is 12 at that time by default in database it must store like startdate 08-12-2026 and date 08-12-2027
// and the message should be display like "You already have an active subscription till 07-12-2026 your new suscrioption will be start from
// 08-12-2026."
// import Subscription from "../../../models/Subscription.js";
// import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
// import School from "../../../models/School.js";

// async function create(req, res) {
//   try {
//     const { error } =
//       SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);

//     if (error?.details?.length) {
//       const errorMessages = error.details[0].message;
//       return res.status(400).json({ message: errorMessages });
//     }

//     const {
//       schoolId,
//       subscriptionFor,
//       subscriptionStartDate,
//       subscriptionNoOfMonth,
//       monthlyRate,
//     } = req.body;

//     const schoolExists = await School.findOne({ schoolId });
//     if (!schoolExists) {
//       return res.status(404).json({
//         hasError: true,
//         message: "School not found.",
//       });
//     }

//     // Calculate subscription end date
//     const startDate = new Date(subscriptionStartDate);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + subscriptionNoOfMonth);

//     // Check for existing active subscription
//     const existingSubscription = await Subscription.findOne({
//       schoolId,
//       subscriptionFor,
//       subscriptionStartDate: { $lte: endDate },
//       $expr: {
//         $gte: [
//           {
//             $dateAdd: {
//               startDate: "$subscriptionStartDate",
//               unit: "month",
//               amount: "$subscriptionNoOfMonth",
//             },
//           },
//           startDate,
//         ],
//       },
//     });

//     if (existingSubscription) {
//       const existingEndDate = new Date(
//         existingSubscription.subscriptionStartDate
//       );
//       existingEndDate.setMonth(
//         existingEndDate.getMonth() + existingSubscription.subscriptionNoOfMonth
//       );

//       return res.status(400).json({
//         hasError: true,
//         message: `You already have an active subscription till ${
//           existingEndDate.toISOString().split("T")[0]
//         }. Please buy a new subscription after this date.`,
//       });
//     }

//     const newSubscription = new Subscription({
//       schoolId,
//       subscriptionFor,
//       subscriptionStartDate: startDate,
//       subscriptionNoOfMonth,
//       monthlyRate,
//       subscriptionEndDate: endDate,
//     });

//     await newSubscription.save();

//     return res.status(201).json({
//       hasError: false,
//       message: "Subscription created successfully.",
//       data: newSubscription,
//     });
//   } catch (error) {
//     console.error("Error submitting Subscription Details:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Internal server error. Please try again later.",
//     });
//   }
// }

// export default create;

import Subscription from "../../../models/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
import School from "../../../models/School.js";

async function create(req, res) {
  try {
    const { error } =
      SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);

    if (error?.details?.length) {
      const errorMessages = error.details[0].message;
      return res.status(400).json({ message: errorMessages });
    }

    const {
      schoolId,
      subscriptionFor,
      subscriptionStartDate,
      subscriptionNoOfMonth,
      monthlyRate,
    } = req.body;

    const schoolExists = await School.findOne({ schoolId });
    if (!schoolExists) {
      return res.status(404).json({
        hasError: true,
        message: "School not found.",
      });
    }

    let startDate = new Date(subscriptionStartDate);
    let endDate = new Date(startDate);

    // CORRECT way to add months
    endDate.setFullYear(
      endDate.getFullYear() + Math.floor(subscriptionNoOfMonth / 12),
      endDate.getMonth() + (subscriptionNoOfMonth % 12),
      endDate.getDate()
    );

    let datesAdjusted = false;

    const existingSubscription = await Subscription.findOne({
      schoolId,
      subscriptionFor,
    }).sort({ subscriptionEndDate: -1 });

    if (existingSubscription) {
      const existingEndDate = new Date(
        existingSubscription.subscriptionStartDate
      );
      existingEndDate.setFullYear(
        existingEndDate.getFullYear() +
          Math.floor(existingSubscription.subscriptionNoOfMonth / 12),
        existingEndDate.getMonth() +
          (existingSubscription.subscriptionNoOfMonth % 12),
        existingEndDate.getDate()
      );

      if (startDate < existingEndDate) {
        datesAdjusted = true;
        startDate = new Date(existingEndDate);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setFullYear(
          endDate.getFullYear() + Math.floor(subscriptionNoOfMonth / 12),
          endDate.getMonth() + (subscriptionNoOfMonth % 12),
          endDate.getDate()
        );
      }
    }

    const newSubscription = new Subscription({
      schoolId,
      subscriptionFor,
      subscriptionStartDate: startDate,
      subscriptionNoOfMonth,
      monthlyRate,
      subscriptionEndDate: endDate,
    });

    await newSubscription.save();

    return res.status(201).json({
      hasError: false,
      message: datesAdjusted
        ? `Subscription dates were adjusted to avoid overlap. New subscription runs from ${
            startDate.toISOString().split("T")[0]
          } to ${endDate.toISOString().split("T")[0]}`
        : "Subscription created successfully.",
      data: newSubscription,
      datesAdjusted,
    });
  } catch (error) {
    console.error("Error submitting Subscription Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default create;
