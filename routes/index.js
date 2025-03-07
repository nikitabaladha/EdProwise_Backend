import loginSignupRoutes from "./login-signup.js";

import DashboardRoutes from "./DashboardRoutes/TotalCounts.js";

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

import QuoteRoutes from "./Procurement/quote-request.js";
import PrepareQuoteRoutes from "./Procurement/prepare-quote-by-seller.js";
import SubmitQuoteRoutes from "./Procurement/submit-quote-by-seller.js";
import UpdateVenderStatusRoutes from "./Procurement/update-vender-status.js";
import CartRoutes from "./Procurement/cart-by-school.js";
import OrderFromBuyerRoutes from "./Procurement/order-from-buyer.js";
import QuoteProposalRoutes from "./Procurement/quote-proposal.js";
import PdfMakingRequiredRoutes from "./Procurement/pdf-requirements.js";
import OrderDetailsFromSellerRoutes from "./Procurement/order-details-from-seller.js";
import OrderProgressStatusRoutes from "./Procurement/order-progress-status.js";
import UpdateTDSRoutes from "./Procurement/update-tds.js";

// Umesh Routes
import RequestForDemoRoutes from "./RequestForDemoRoutes/RequestForDemoRoutes.js";
import ContactUsFormRoutes from "./ContactUsFormRoutes/ContactUsFormRoutes.js";

export default (app) => {
  app.use("/api", loginSignupRoutes);
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
  app.use("/api", QuoteRoutes);
  app.use("/api", PrepareQuoteRoutes);
  app.use("/api", SubmitQuoteRoutes);
  app.use("/api", UpdateVenderStatusRoutes);
  app.use("/api", CartRoutes);
  app.use("/api", OrderFromBuyerRoutes);
  app.use("/api", QuoteProposalRoutes);
  app.use("/api", PdfMakingRequiredRoutes);
  app.use("/api", OrderDetailsFromSellerRoutes);
  app.use("/api", OrderProgressStatusRoutes);
  app.use("/api", UpdateTDSRoutes);
  app.use("/api", DashboardRoutes);

  // Umesh Routes

  app.use("/api", RequestForDemoRoutes);
  app.use("/api", ContactUsFormRoutes);
};
