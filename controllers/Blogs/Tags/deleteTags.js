import BlogTags from '../../../models/Blog/BlogTags.js';

async function deleteTags(req, res) {
  try {
    const { id } = req.params;

    // Check if the contact form submission exists
    const existingSubmission = await BlogTags.findById(id);
    if (!existingSubmission) {
      return res.status(404).json({
        hasError: true,
        message: "Tag not found.",
      });
    }

    // Delete the category
    await BlogTags.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Blog tags deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting blog tag :", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default deleteTags;
