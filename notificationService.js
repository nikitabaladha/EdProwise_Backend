// EdProwise_Backend\notificationService.js
import Notification from "./models/Notification.js";
import { NOTIFICATION_TEMPLATES } from "./notifications.js";
import { getIO } from "./socket.js";

export class NotificationService {
  static async sendNotification(templateKey, recipients, context = {}) {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    const notifications = [];
    const io = getIO();

    console.log("Active socket rooms:", io.sockets.adapter.rooms);

    for (const recipient of recipients) {
      const room = `${template.recipientType}-${recipient.id}`;
      console.log(`Emitting to room: ${room}`);

      const message = template.message(context);

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

      const roomExists = io.sockets.adapter.rooms.has(room);
      console.log(`Room ${room} exists: ${roomExists}`);

      if (roomExists) {
        io.to(room).emit("notification", notification);
        console.log(`Notification emitted to ${room}`);
      } else {
        console.warn(`Room ${room} does not exist - no clients connected`);
      }
    }

    return notifications;
  }
}
