import registrationRoutes from "./registration.js";
import userRoutes from "./user.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";

export default (app) => {
  app.use("/api", userRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
};
