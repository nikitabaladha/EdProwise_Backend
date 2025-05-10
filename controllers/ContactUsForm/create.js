import ContactForm from "../../models/ContactForm.js";
import ContactFormValidator from "../../validators/ContactUsValidation.js";

async function create(req, res) {
  try {
    // Validate request body (excluding service validation)
    const { error } = ContactFormValidator.contactFormValidation.validate(
      req.body
    );
    if (error) {
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message,
      });
    }

    // Proceed with saving to database
    const newContactSubmission = new ContactForm(req.body);
    const savedSubmission = await newContactSubmission.save();

    return res.status(201).json({
      hasError: false,
      message: "Thank you! Your message has been sent.",
      data: savedSubmission,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      hasError: true,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
}

export default create;
