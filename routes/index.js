import registrationRoutes from "./registration.js";
import loginSignupRoutes from "./login-signup.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";
import schoolProfileRoutes from "./SchoolRoutes/school-profile.js";

import userRoutes from "./AdminRoutes/user.js";
import schoolUserRoutes from "./SchoolRoutes/school-user.js";
import SellerRoutes from "./SellerRoutes/seller-profile.js";
import SellerUserRoutes from "./SellerRoutes/seller-user.js";
import subscriptionRoutes from "./AdminRoutes/subscriptionRoutes.js";
import MainCategoryCategorySubCategoryRoutes from "./AdminRoutes/MainCategoryCategorySubCategory.js";
import EdprowiseProfileRoutes from "./AdminRoutes/edprowiseProfile.js";
import AdminUserRoutes from "./AdminRoutes/admin.js";

export default (app) => {
  app.use("/api", loginSignupRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
  app.use("/api", SellerRoutes);
  app.use("/api", schoolUserRoutes);
  app.use("/api", SellerUserRoutes);
  app.use("/api", userRoutes);
  app.use("/api", subscriptionRoutes);
  app.use("/api", schoolProfileRoutes);
  app.use("/api", MainCategoryCategorySubCategoryRoutes);
  app.use("/api", EdprowiseProfileRoutes);
  app.use("/api", AdminUserRoutes);
};
