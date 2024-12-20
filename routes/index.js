import registrationRoutes from "./registration.js";
import adminRoutes from "./admin.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";

export default (app) => {
  app.use("/api", adminRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
};
