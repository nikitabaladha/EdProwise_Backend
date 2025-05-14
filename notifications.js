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

  SELLER_RECEIVED_UPDATED_QUOTE_FROM_EDPROWISE: {
    type: "quote_updated_from_edprowise",
    title: "Updated Quote From Edprowise",
    message: (context) =>
      `Your Quote Proposal has beed updated by Edprowise for Enquiry Number ${context.enquiryNumber} which has Quote Number ${context.quoteNumber}`,
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
};
