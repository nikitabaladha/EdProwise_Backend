export const NOTIFICATION_TEMPLATES = {
  // School Notifications
  SCHOOL_QUOTE_REQUESTED: {
    type: "quote_requested",
    title: "Quote Request Submitted",
    recipientType: "school",
    message: (context) =>
      `${context.schoolName}, your quote request has been successfully submitted to relevant sellers, and Your Enquiry Number is ${context.enquiryNumber}.`,
  },

  SCHOOL_QUOTE_RECEIVED_FROM_EDPROWISE: {
    type: "quote_received_from_edprowise",
    title: "Prepared Quote",
    message: (context) =>
      `You have received Quote Proposal from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "school",
  },

  SCHOOL_REJECTED_QUOTE: {
    type: "quote_rejected_by_school",
    title: "Rejected Quote",
    message: (context) =>
      `You have rejected Quote Proposal from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "school",
  },

  SCHOOL_RECEIVED_UPDATED_QUOTE_FROM_EDPROWISE: {
    type: "quote_updated_from_edprowise",
    title: "Updated Quote From Edprowise",
    message: (context) =>
      `You have received updated Quote Proposal from Edprowise for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "school",
  },

  SCHOOL_RECEIVED_UPDATED_QUOTE_FROM_SELLER: {
    type: "quote_updated_from_seller",
    title: "Updated Quote From Seller",
    message: (context) =>
      `You have received updated Quote Proposal from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "school",
  },

  SCHOOL_PLACED_ORDER: {
    type: "school_placed_order",
    title: "Order Placed",
    message: (context) =>
      `You have placed order from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Order Number ${context.orderNumber}.`,
    recipientType: "school",
  },

  SCHOOL_TDS_UPDATED: {
    type: "tds_updated_by_edprowise",
    title: "TDS Updated",
    message: (context) =>
      `TDS has been updated for Order Number ${context.orderNumber} from Edprowise.`,
    recipientType: "school",
  },

  EDPROWISE_CANCELLED_ORDER_FOR_SCHOOL: {
    type: "order_cancelled_by_edprowise",
    title: "Edprowise Cancelled Order",
    message: (context) =>
      `Your order has beed cancelled for ${context.companyName} for Order Number ${context.orderNumber} by Edprowise.`,
    recipientType: "school",
  },

  SCHOOL_CANCELLED_ORDER_FOR_SCHOOL: {
    type: "order_cancelled_by_school",
    title: "School Cancelled Order",
    message: (context) =>
      `You have cancelled order from ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "school",
  },

  SCHOOL_REQUESTED_FOR_ORDER_CANCELL_FOR_SCHOOL: {
    type: "order_cancel_request_by_school",
    title: "School Order Cancel Request",
    message: (context) =>
      `You have requested for order cancellation from ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "school",
  },

  SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_SCHOOL: {
    type: "order_cancel_request_by_seller",
    title: "Seller Order Cancel Request",
    message: (context) =>
      `Your order has been requested for cancellation from ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "school",
  },

  SELLER_DELIVERY_DATE_CHANGED_FOR_SCHOOL: {
    type: "delivery_date_changed_by_seller",
    title: "Delivery Date Changed",
    message: (context) =>
      `Delivery date has been changed for Order Number ${context.orderNumber} from ${context.companyName}.`,
    recipientType: "school",
  },

  ORDER_PROGRESS_BY_SELLER_FOR_SCHOOL: {
    type: "order_progress_by_seller",
    title: "Order Progress",
    message: (context) =>
      `Order progressed status is changed to ${context.status} by ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "school",
  },

  SCHOOL_SUbCRPTION: {
    type: "school_subscription",
    title: "Subscription Added",
    message: (context) =>
      `You subscription has been added by Edprowise for ${context.subscriptionFor} which is starting from ${context.subscriptionStartDate} till ${context.subscriptionEndDate}.`,
    recipientType: "school",
  },

  // Seller Notifications
  SELLER_QUOTE_RECEIVED: {
    type: "quote_received",
    title: "Quote Request",
    recipientType: "seller",
    message: (context) =>
      `You have received a Quote request from ${context.schoolName}, which has Enquiry Number ${context.enquiryNumber}.`,
  },

  SELLER_QUOTE_PREPARED: {
    type: "quote_prepared",
    title: "Quote Prepared",
    message: (context) =>
      `You have successfully prepared quote for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "seller",
  },

  SELLER_RECEIVE_REJECTED_QUOTE_FROM_SCHOOL: {
    type: "quote_rejected_by_school",
    title: "Rejected Quote From School",
    message: (context) =>
      `${context.schoolName} has rejected your Quote Proposal which has Enquiry Number ${context.enquiryNumber} and Quote Number ${context.quoteNumber}.`,
    recipientType: "seller",
  },

  SELLER_RECEIVED_UPDATED_QUOTE_FROM_EDPROWISE: {
    type: "quote_updated_from_edprowise",
    title: "Updated Quote From Edprowise",
    message: (context) =>
      `Your Quote Proposal has beed updated by Edprowise for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}`,
    recipientType: "seller",
  },

  SELLER_RECEIVED_UPDATED_QUOTE_BY_OWN: {
    type: "quote_updated_from_seller",
    title: "Updated Quote By Own",
    message: (context) =>
      `Your have updated Quote Proposal for ${context.schoolName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}`,
    recipientType: "seller",
  },

  SELLER_RECEIVED_ORDER: {
    type: "seller_received_order",
    title: "Order Received",
    message: (context) =>
      `You have received order from ${context.schoolName} for Enquiry Number ${context.enquiryNumber} which has Order Number ${context.orderNumber}.`,
    recipientType: "seller",
  },

  SELLER_TDS_UPDATED: {
    type: "tds_updated_by_edprowise",
    title: "TDS UPDATED",
    message: (context) =>
      `TDS has been updated for Order Number ${context.orderNumber} from Edprowise.`,
    recipientType: "seller",
  },

  EDPROWISE_CANCELLED_ORDER_FOR_SELLER: {
    type: "order_cancelled_by_edprowise",
    title: "Edprowise Cancelled Order",
    message: (context) =>
      `Your Order has beed cancelled for ${context.schoolName} for Order Number ${context.orderNumber} by Edprowise.`,
    recipientType: "seller",
  },

  SCHOOL_CANCELLED_ORDER_FOR_SELLER: {
    type: "order_cancelled_by_school",
    title: "School Cancelled Order",
    message: (context) =>
      `Your order has been cancelled by ${context.schoolName} for Order Number ${context.orderNumber}.`,
    recipientType: "seller",
  },

  SCHOOL_REQUESTED_FOR_ORDER_CANCELL_FOR_SELLER: {
    type: "order_cancel_request_by_school",
    title: "School Order Cancel Request",
    message: (context) =>
      `Your order has been requested for cancellation from ${context.schoolName} for Order Number ${context.orderNumber}.`,
    recipientType: "seller",
  },

  SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_SELLER: {
    type: "order_cancel_request_by_seller",
    title: "Seller Order Cancel Request",
    message: (context) =>
      `You have requested for order cancellation for ${context.schoolName} for Order Number ${context.orderNumber}.`,
    recipientType: "seller",
  },

  SELLER_DELIVERY_DATE_CHANGED_FOR_SELLER: {
    type: "delivery_date_changed_by_seller",
    title: "Delivery Date Changed",
    message: (context) =>
      `You have changed delivery date for Order Number ${context.orderNumber} for ${context.schoolName}.`,
    recipientType: "seller",
  },

  ORDER_PROGRESS_BY_SELLER_FOR_SELLER: {
    type: "order_progress_by_seller",
    title: "Order Progress",
    message: (context) =>
      `Order progressed status is changed to ${context.status} for Order Number ${context.orderNumber} for ${context.schoolName}.`,
    recipientType: "seller",
  },
  //Edprowise Notifications
  EDPROWISE_QUOTE_REQUESTED_FROM_SCHOOL: {
    type: "quote_received",
    title: "Quote Request",
    message: (context) =>
      `${context.schoolName} has requested for quote, and Enquiry Number is ${context.enquiryNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_QUOTE_RECEIVED_FROM_SELLER: {
    type: "quote_received_from_seller",
    title: "Prepared Quote",
    message: (context) =>
      `You have Quote Proposal from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_ACCEPTED_QUOTE: {
    type: "quote_accepted_from_edprowise",
    title: "Quote Accepted",
    message: (context) =>
      `You have accepted Quote Proposal from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which Quote Number ${context.quoteNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_RECEIVE_REJECTED_QUOTE_FROM_SCHOOL: {
    type: "quote_rejected_by_school",
    title: "Rejected Quote From School",
    message: (context) =>
      `${context.schoolName} has rejected quote from ${context.companyName} which has Enquiry Number ${context.enquiryNumber} and Quote Number ${context.quoteNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_UPDATED_QUOTE: {
    type: "quote_updated_from_edprowise",
    title: "Updated Quote From Edprowise",
    message: (context) =>
      `You have updated Quote Proposal for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_RECEIVED_UPDATED_QUOTE: {
    type: "quote_updated_from_seller",
    title: "Updated Quote From Seller",
    message: (context) =>
      `You have received updated Quote Proposal from ${context.companyName} for ${context.schoolName} for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_RECEIVED_ORDER: {
    type: "edprowise_received_order",
    title: "Order Placed",
    message: (context) =>
      `${context.schoolName} has placed order from ${context.companyName} for Enquiry Number ${context.enquiryNumber} which has Order Number ${context.orderNumber}.`,
    recipientType: "edprowise",
  },

  EDPROWISE_TDS_UPDATED: {
    type: "tds_updated_by_edprowise",
    title: "TDS UPDATED",
    message: (context) =>
      `TDS has been updated for Order Number ${context.orderNumber} from Edprowise.`,
    recipientType: "edprowise",
  },

  EDPROWISE_CANCELLED_ORDER: {
    type: "order_cancelled_by_edprowise",
    title: "Edprowise Cancelled Order",
    message: (context) =>
      `You has cancelled order of ${context.companyName} for  ${context.schoolName} of Order Number ${context.orderNumber}.`,
    recipientType: "edprowise",
  },

  SCHOOL_CANCELLED_ORDER_FOR_EDPROWISE: {
    type: "order_cancelled_by_school",
    title: "School Cancelled Order",
    message: (context) =>
      `The order has been cancelled by School ${context.schoolName} from Seller ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "edprowise",
  },

  SCHOOL_REQUESTED_FOR_ORDER_CANCELL_FOR_EDPROWISE: {
    type: "order_cancel_request_by_school",
    title: "School Order Cancel Request",
    message: (context) =>
      `The order has been requested cancellation from ${context.schoolName} from ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "edprowise",
  },

  SELLER_REQUESTED_FOR_ORDER_CANCEL_FOR_EDPROWISE: {
    type: "order_cancel_request_by_seller",
    title: "Seller Order Cancel Request",
    message: (context) =>
      `The order has been requested cancellation from ${context.companyName} for ${context.companyName} for Order Number ${context.orderNumber}.`,
    recipientType: "edprowise",
  },

  SELLER_DELIVERY_DATE_CHANGED_FOR_EDPROWISE: {
    type: "delivery_date_changed_by_seller",
    title: "Delivery Date Changed",
    message: (context) =>
      `Delivery date has been changed for Order Number ${context.orderNumber} from ${context.companyName}.`,
    recipientType: "edprowise",
  },
  ORDER_PROGRESS_BY_SELLER_FOR_EDPROWISE: {
    type: "order_progress_by_seller",
    title: "Order Progress",
    message: (context) =>
      `Order progressed status is changed to ${context.status} for Order Number ${context.orderNumber} from ${context.companyName}.`,
    recipientType: "edprowise",
  },

  NEW_SCHOOL_REGISTERED: {
    type: "school_registered",
    title: "School Registered",
    message: (context) =>
      `New school ${context.schoolName} has been registered which has SchoolId ${context.schoolId}.`,
    recipientType: "edprowise",
  },

  NEW_SELLER_REGISTERED: {
    type: "seller_registered",
    title: "Seller Registered",
    message: (context) =>
      `New seller ${context.companyName} has been registered which has SellerlId ${context.randomId}.`,
    recipientType: "edprowise",
  },

  SCHOOL_SUbCRPTION_BY_EDPROWISE: {
    type: "school_subscription",
    title: "Subscription Added",
    message: (context) =>
      `You have added subscription for ${context.schoolName} for ${context.subscriptionFor} whose schoolId is ${context.schoolId} which is starting from ${context.subscriptionStartDate} till ${context.subscriptionEndDate}.`,
    recipientType: "edprowise",
  },
};
