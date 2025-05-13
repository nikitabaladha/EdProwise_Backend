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

  //Edprowise Notifications
  EDPROWISE_QUOTE_REQUESTED_FROM_SCHOOL: {
    type: "quote_requested_by_School",
    title: "New Quote Received",
    message: (schoolName, enquiryNumber) =>
      `${schoolName} has requested for quote, and Enquiry Number is ${enquiryNumber}.`,
    recipientType: "admin",
  },
};
