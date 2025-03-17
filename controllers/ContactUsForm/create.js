import ContactForm from "../../models/ContactForm.js";
import ContactFormValidator from "../../validators/ContactUsValidation.js";

async function create(req, res) {
  try {
    // Validate request body
    const { error } = ContactFormValidator.contactFormValidation.validate(req.body);
    if (error) {
      const errorMessages = error.details.map(err => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: errorMessages
      });
    }

    // Create a new contact form submission
    const newContactSubmission = new ContactForm({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      service: req.body.service,
      note: req.body.note || ""
    });

    // Save to database
    const savedSubmission = await newContactSubmission.save();

    return res.status(201).json({
      hasError: false,
      message: "Contact form submitted successfully!",
      data: savedSubmission
    });

  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later."
    });
  }
}

export default create;
