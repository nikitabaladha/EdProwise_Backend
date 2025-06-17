import BlogCategory from '../../models/Blog/BlogCategory.js';

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if the contact form submission exists
    const existingSubmission = await BlogCategory.findById(id);
    if (!existingSubmission) {
      return res.status(404).json({
        hasError: true,
        message: "Category not found.",
      });
    }

    // Delete the category
    await BlogCategory.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Blog category deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default deleteCategory;
