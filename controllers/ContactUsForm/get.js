import ContactUsForm from "../../models/ContactForm.js";

// GET all contact form submissions
async function get(req, res) {
  try {
    // Fetch all contact forms from the database
    const contactForms = await ContactUsForm.find();

    // If no contact forms are found
    if (contactForms.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: "No contact form submissions found.",
      });
    }

    // Return all contact form submissions
    return res.status(200).json({
      hasError: false,
      message: "Contact form submissions retrieved successfully.",
      data: contactForms,
    });
  } catch (error) {
    console.error("Error fetching contact forms:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default get;
