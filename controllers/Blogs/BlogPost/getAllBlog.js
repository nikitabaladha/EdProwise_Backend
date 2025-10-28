import Blogs from "../../../models/Blog/Blogs.js";

const getRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blogs.find({ status: true }) // only active blogs
      .populate("categories", "categoryName")
      .populate("tags", "tagName")
      .sort({ createdAt: -1 })
      .limit(3);

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found",
      });
    }

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recent blogs",
    });
  }
};

export default getRecentBlogs;
