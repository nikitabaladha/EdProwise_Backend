import userRoutes from "./user.js";
import schoolRegistration from "./schoolRegistration.js";

export default (app) => {
  app.use("/api", userRoutes);
  app.use("/api", schoolRegistration);
};
