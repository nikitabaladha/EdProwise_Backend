import registrationRoutes from "./registration.js";
import adminRoutes from "./admin.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";
import subscriptionRoutes from "./AdminRoutes/subscriptionRoutes.js"
import productRequestRoutes from "./Buyer/ProductRequest.js";
export default (app) => {
  app.use("/api", adminRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api", schoolRoutes);
  app.use("/api", subscriptionRoutes);
  app.use("/api", productRequestRoutes);
};