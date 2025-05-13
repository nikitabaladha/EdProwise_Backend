export const NOTIFICATION_TEMPLATES = {
  // School Notifications
  SCHOOL_QUOTE_REQUESTED: {
    type: "quote_requested",
    title: "Quote Request Submitted",
    message: (enquiryNumber) =>
      `Your quote request has been successfully submitted to relevant sellers, and Your Enquiry Number is ${enquiryNumber}.`,
    recipientType: "school",
  },

  // Seller Notifications
  SELLER_QUOTE_RECEIVED: {
    type: "quote_received",
    title: "New Quote Request",
    message: (schoolName, enquiryNumber) =>
      `You have received a new quote request from ${schoolName}, and Enquiry Number is ${enquiryNumber}.`,
    recipientType: "seller",
  },

  SELLER_QUOTE_PREPARED: {
    type: "quote_prepared",
    title: "Prepared Quote Submitted",
    message: (schoolName) =>
      `Your prepared quote has been successfully submitted to ${schoolName}.`,
    recipientType: "school",
  },

  //Edprowise Notifications
  EDPROWISE_QUOTE_REQUESTED_FROM_SCHOOL: {
    type: "quote_requested_by_School",
    title: "New Quote Received",
    message: (schoolName, enquiryNumber) =>
      `${schoolName} has requested for quote, and Enquiry Number is ${enquiryNumber}.`,
    recipientType: "admin",
  },

  EDPROWISE_QUOTE_RECEIVED_FROM_SELLER: {
    type: "quote_received_from_seller",
    title: "New Prepared Quote Received",
    message: (companyName) =>
      `You have received a new prepared quote from ${companyName}`,
    recipientType: "admin",
  },
};
