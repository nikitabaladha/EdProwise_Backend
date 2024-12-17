import registrationRoutes from "./registration.js";
import userRoutes from "./user.js";

export default (app) => {
  app.use("/api", userRoutes);
  app.use("/api", registrationRoutes);
};
