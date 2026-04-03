import Blog from "../../../models/Blog/Blogs.js";
import Category from "../../../models/Blog/BlogCategory.js";
import Tag from "../../../models/Blog/BlogTags.js";
import { blogImageUpload } from "../../UploadFiles/BlogImage.js";
import fs from "fs";
import path from "path";

const getBlog = async (req, res) => {
  try {
    // Simple filtering (optional)
    const filter = {};
    // if (req.query.status) filter.status = req.query.status === 'true';
    if (req.query.blogFor) filter.blogFor = req.query.blogFor;

    const blogs = await Blog.find(filter)
      .populate("categories", "categoryName")
      .populate("tags", "tagName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export default getBlog;
