import Notification from "./models/Notification.js";
import { NOTIFICATION_TEMPLATES } from "./notifications.js";
import { getIO } from "./socket.js";

export class NotificationService {
  static async sendNotification(templateKey, recipients, context = {}) {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    const notifications = [];

    for (const recipient of recipients) {
      const message = this.formatMessage(
        template.message(context.schoolName, context.enquiryNumber),
        context
      );

      const notification = new Notification({
        recipientType: template.recipientType,
        recipientId: recipient.id,
        senderType: context.senderType,
        senderId: context.senderId,
        type: template.type,
        title: template.title,
        message: message,
        relatedEntity: context.entityId,
        entityType: context.entityType,
        metadata: context.metadata,
      });

      await notification.save();
      notifications.push(notification);

      // Send real-time notification
      const io = getIO();
      io.to(`${template.recipientType}-${recipient.id}`).emit(
        "notification",
        notification
      );
    }

    return notifications;
  }

  static formatMessage(message, context) {
    return message.replace(/{(\w+)}/g, (match, key) => context[key] || match);
  }

  static async getNotifications(userType, userId) {
    return Notification.find({
      recipientType: userType,
      recipientId: userId,
    }).sort({ createdAt: -1 });
  }
}
