import Subscription from "../../../models/Subscription.js";
import SubscriptionValidator from "../../../validators/AdminUser/SubscriptionValidator.js";
import School from "../../../models/School.js";

import AdminUser from "../../../models/AdminUser.js";

import { NotificationService } from "../../../notificationService.js";
import mongoose from "mongoose";

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } =
      SubscriptionValidator.SubscriptionCreateValidator.validate(req.body);

    if (error?.details?.length) {
      await session.abortTransaction();
      session.endSession();
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

    const schoolExists = await School.findOne({ schoolId }).session(session);

    if (!schoolExists) {
      await session.abortTransaction();
      session.endSession();
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
    })
      .sort({ subscriptionEndDate: -1 })
      .session(session);

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

    await newSubscription.save({ session });

    const senderId = req.user.id;

    const relevantEdprowise = await AdminUser.find({});

    const formatDate = (date) =>
      date.toDateString() + " " + date.toTimeString().split(" ")[0];

    await NotificationService.sendNotification(
      "SCHOOL_SUbCRPTION_BY_EDPROWISE",
      relevantEdprowise.map((admin) => ({
        id: admin._id.toString(),
        type: "edprowise",
      })),
      {
        schoolName: schoolExists.schoolName,
        schoolId: schoolId,
        subscriptionFor: newSubscription.subscriptionFor,
        subscriptionStartDate: formatDate(
          newSubscription.subscriptionStartDate
        ),
        subscriptionEndDate: formatDate(newSubscription.subscriptionEndDate),
        entityId: newSubscription._id,
        entityType: "School Subscription",
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          subscriptionId: newSubscription._id,
          type: "school_subscription",
        },
      }
    );

    await NotificationService.sendNotification(
      "SCHOOL_SUbCRPTION",
      [
        {
          id: schoolExists.schoolId.toString(),
          type: "school",
        },
      ],
      {
        schoolName: schoolExists.schoolName,
        schoolId: schoolId,
        subscriptionFor: newSubscription.subscriptionFor,
        subscriptionStartDate: formatDate(
          newSubscription.subscriptionStartDate
        ),
        subscriptionEndDate: formatDate(newSubscription.subscriptionEndDate),
        entityId: newSubscription._id,
        entityType: "School Subscription",
        senderType: "edprowise",
        senderId: senderId,
        metadata: {
          subscriptionId: newSubscription._id,
          type: "school_subscription",
        },
      }
    );

    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
    console.error("Error submitting Subscription Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default create;
