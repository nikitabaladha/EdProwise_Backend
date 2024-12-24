import registrationRoutes from "./registration.js";
import adminRoutes from "./admin.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";
import userRoutes from "./AdminRoutes/user.js";
import subscriptionRoutes from "./AdminRoutes/subscriptionRoutes.js";

export default (app) => {
  app.use("/api", adminRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
  app.use("/api", userRoutes);
  app.use("/api", subscriptionRoutes);
};
