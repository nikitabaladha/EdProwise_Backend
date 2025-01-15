import registrationRoutes from "./registration.js";
import loginSignupRoutes from "./login-signup.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";
import schoolProfileRoutes from "./SchoolRoutes/school-profile.js";

import userRoutes from "./AdminRoutes/user.js";
import subscriptionRoutes from "./AdminRoutes/subscriptionRoutes.js";

export default (app) => {
  app.use("/api", loginSignupRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
  app.use("/api", userRoutes);
  app.use("/api", subscriptionRoutes);
  app.use("/api", schoolProfileRoutes);
};
