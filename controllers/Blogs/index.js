// Category
import createCategory from "./createCategory.js";
import getCategory from "./getCategory.js";
import deleteCategory from "./deleteCategory.js";
import updateCategory from "./updateCategory.js";

// Tags
import createTags from "./Tags/createTags.js";
import getTags from "./Tags/getTags.js";
import deleteTags from "./Tags/deleteTags.js";
import updateTags from "./Tags/updateTags.js";

// BlogPost
import createBlog from "./BlogPost/createBlog.js";
import getBlog from "./BlogPost/getBlog.js";
import getBlogById from "./BlogPost/getBlogById.js";
import updateBlog from "./BlogPost/updateBlog.js";
import deleteBlog from "./BlogPost/deleteBlog.js";
import getAllBlogs from "./BlogPost/getAllBlog.js";

// find blogs
import getStudentZoneBlogs from "./BlogPost/getStudentZoneBlogs.js";
import getEducatorZoneBlogs from "./BlogPost/getEducatorZoneBlogs.js";
import getBlogsByCategoryAndZone from "./BlogPost/getBlogsByCategoryAndZone.js";
import getBlogsByTagAndZone from "./BlogPost/getBlogsByTagAndZone.js";

export {
  createCategory,
  getCategory,
  deleteCategory,
  updateCategory,

  // Tag
  createTags,
  getTags,
  deleteTags,
  updateTags,

  // Blog Post
  createBlog,
  getBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  getStudentZoneBlogs,
  getEducatorZoneBlogs,
  getBlogsByCategoryAndZone,
  getBlogsByTagAndZone,
  getAllBlogs,
};
