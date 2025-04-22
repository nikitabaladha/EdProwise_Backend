import ContactForm from "../../models/ContactForm.js";

async function deleteContactForm(req, res) {
  try {
    const { id } = req.params;

    // Check if the contact form submission exists
    const existingSubmission = await ContactForm.findById(id);
    if (!existingSubmission) {
      return res.status(404).json({
        hasError: true,
        message: "Contact form submission not found.",
      });
    }

    // Delete the submission
    await ContactForm.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Contact form submission deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting contact form submission:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default deleteContactForm;
