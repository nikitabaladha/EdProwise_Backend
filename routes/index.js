import loginSignupRoutes from "./login-signup.js";

import DashboardRoutes from "./DashboardRoutes/TotalCounts.js";
import schoolRoutes from "./AdminRoutes/schoolRegistration.js";
import schoolProfileRoutes from "./SchoolRoutes/school-profile.js";
import userRoutes from "./AdminRoutes/user.js";
import schoolUserRoutes from "./SchoolRoutes/school-user.js";
import SellerRoutes from "./SellerRoutes/seller-profile.js";
import SellerUserRoutes from "./SellerRoutes/seller-user.js";
import subscriptionRoutes from "./AdminRoutes/subscriptionRoutes.js";
import EdprowiseProfileRoutes from "./AdminRoutes/edprowiseProfile.js";
import AdminUserRoutes from "./AdminRoutes/admin.js";
import NewAdminRoutes from "./AdminRoutes/NewAdmin.js";

// ======================Procurement Services==================
import PDFRoutes from "./ProcurementService/pdf-for-frontend.js";
import MainCategoryCategorySubCategoryRoutes from "./ProcurementService/maincategory-category-subcategory.js";
import EdprowiseBankDetailRoutes from "./ProcurementService/bank-detail.js";
import QuoteRoutes from "./ProcurementService/quote-request.js";
import PrepareQuoteRoutes from "./ProcurementService/prepare-quote-by-seller.js";
import SubmitQuoteRoutes from "./ProcurementService/submit-quote-by-seller.js";
import UpdateVenderStatusRoutes from "./ProcurementService/update-vender-status.js";
import CartRoutes from "./ProcurementService/cart-by-school.js";
import OrderFromBuyerRoutes from "./ProcurementService/order-from-buyer.js";
import QuoteProposalRoutes from "./ProcurementService/quote-proposal.js";
import OrderDetailsFromSellerRoutes from "./ProcurementService/order-details-from-seller.js";
import OrderProgressStatusRoutes from "./ProcurementService/order-progress-status.js";
import UpdateTDSRoutes from "./ProcurementService/update-tds.js";
import CancelOrder from "./ProcurementService/order-cancel.js";
import FeedBackAndRating from "./ProcurementService/feedback-and-rating.js";
import GlobalSearchRoutes from "./global-search.js";

import Notification from "./notification.js";

// ====================Fees Module===================

import AdminSettingRoutes from "./FeesModule/AdminSetting.js";
import FormRoutes from "./FeesModule/Form.js";
import FeesReceiptsRoutes from "./FeesModule/FeesReceipts.js";
import FeesManagementYearRoutes from "./FeesModule/FeesManagementYear.js";

// Umesh Routes
import RequestForDemoRoutes from "./RequestForDemoRoutes/RequestForDemoRoutes.js";
import ContactUsFormRoutes from "./ContactUsFormRoutes/ContactUsFormRoutes.js";

// ==================Email Routes =========================
import SMTPEmailSettings from "./AdminRoutes/SMTPEmailSettings.js";
import SignUPTemplatesRoutes from "./EmailTemplatesRoutes/SignUPTemplatesRoutes.js";
import SellerEmailTemplateRoutes from "./EmailTemplatesRoutes/SellerEmailTemplateRoutes.js";
import PasswordUpdateEmailTemplateRoutes from "./EmailTemplatesRoutes/PasswordUpdateEmailTemplateRoutes.js";
import ForgotPasswordRoutes from "./ForgotPasswordRoutes/ForgotPasswordRoutes.js";

import sitemap from "./sitemap.js";

export default (app) => {
  // PDF Routes
  app.use("/api", PDFRoutes);
  // ==================Email Routes =========================

  app.use("/api", SMTPEmailSettings);
  app.use("/api", SignUPTemplatesRoutes);
  app.use("/api", SellerEmailTemplateRoutes);
  app.use("/api", PasswordUpdateEmailTemplateRoutes);
  app.use("/api", ForgotPasswordRoutes);

  // ===================Login/Signup ==================
  app.use("/api", loginSignupRoutes);

  // ====================School/Seller/Edprowise Routes==========
  app.use("/api", schoolRoutes);
  app.use("/api", SellerRoutes);
  app.use("/api", schoolUserRoutes);
  app.use("/api", SellerUserRoutes);
  app.use("/api", userRoutes);
  app.use("/api", subscriptionRoutes);
  app.use("/api", schoolProfileRoutes);
  app.use("/api", EdprowiseProfileRoutes);
  app.use("/api", AdminUserRoutes);
  app.use("/api", NewAdminRoutes);

  //=====================Procurement Routes===============
  app.use("/api", MainCategoryCategorySubCategoryRoutes);
  app.use("/api", EdprowiseBankDetailRoutes);

  app.use("/api", QuoteRoutes);
  app.use("/api", PrepareQuoteRoutes);
  app.use("/api", SubmitQuoteRoutes);
  app.use("/api", UpdateVenderStatusRoutes);
  app.use("/api", CartRoutes);
  app.use("/api", OrderFromBuyerRoutes);
  app.use("/api", QuoteProposalRoutes);
  app.use("/api", OrderDetailsFromSellerRoutes);
  app.use("/api", OrderProgressStatusRoutes);
  app.use("/api", UpdateTDSRoutes);
  app.use("/api", CancelOrder);
  app.use("/api", FeedBackAndRating);

  app.use("/api", DashboardRoutes);

  app.use("/api", Notification);

  //=====================Globar search for dashboard routes===============
  app.use("/api", GlobalSearchRoutes);

  // ================Fees Module====================
  app.use("/api", AdminSettingRoutes);
  app.use("/api", FormRoutes);
  app.use("/api", FeesReceiptsRoutes);
  app.use("/api", FeesManagementYearRoutes);

  // Umesh Routes

  app.use("/api", RequestForDemoRoutes);
  app.use("/api", ContactUsFormRoutes);

  app.use("/", sitemap);
};
