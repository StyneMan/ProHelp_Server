// const router = require("express").Router();

/** import all controllers */
const controller = require("../controllers/authController");
const appController = require("../controllers/appController");
const chatController = require("../controllers/chatController.js");
const messageController = require("../controllers/messageController.js");
const jobController = require("../controllers/jobsController.js");
const adminController = require("../controllers/adminController.js");
const professionController = require("../controllers/professionController.js");
const cmsController = require("../controllers/cmsController.js");
const connectionController = require("../controllers/connectionController.js");
const userController = require("../controllers/userController.js");
const transactionController = require("../controllers/transactionController.js");
const paymentController = require("../controllers/paymentController.js");

const {
    Auth,
  localVariables,
  verifyAdmin,
  verifyCookie,
} = require("../middleware/auth.js");


module.exports = (app) => {
  const router = require("express").Router();

  // ***** AUTHENTICATION ***** //
  router.post('/register', controller.signup)
  router.post("/login", controller.login); // login in app
  router.post("/forgotPassword", controller.forgotPassword); // forgot password send email
  router.post("/auth/google", controller.getGoogleParams);
  router.post("/auth/apple", controller.getAppleParams);
  router.post("/auth/google/web", controller.getGoogleParamsWeb);
  router.get("/verifyOTP", controller.verifyOTP); // verify generated OTP
  router.get("/resendOTP", controller.resendOTP); // verify generated OTP
  router
    .put("/resetPassword", controller.verifyUser, controller.resetPassword); // use to reset password

    
  // ***** CHAT ***** //
  router.put("/chat/init/:email", Auth, chatController.accessChat);
  router.get("/chat/allChats/:email", Auth, chatController.getChats);
  router
    .get("/chat/messages/:email/:chatId", Auth, messageController.getChatMessages);
  router
    .post("/chat/message/post/:email", Auth, messageController.sendMessage);


  // ***** ACCOUNT ***** //
  router.get("/users", controller.getAllUsers);
  router.get("/user/:email", Auth, controller.getUser); // user with email
  router.get("/freelancers/", appController.getAllProfessionals); // freelancer with email
  router
    .get("/freelancers/:profession", appController.getAllProfessionalsByProfession); // freelancer with email
  router.get("/recruiters/:email", Auth, appController.getAllRecruiters); // freelancer with email
  router.get("/createResetSession", controller.createResetSession); // reset all the variables
  router.get("/logout/:email", Auth, controller.logout); //Log user out
  router.put("/updateuser/:email", Auth, controller.updateUser); // is use to update the user profile
  router.put("/likeUser/:email", Auth, appController.saveWishlist); // Like/Unlike user
  router.get("/users/savedPros/:email", Auth, appController.getSavedPros); //get saved pros/recruiters for user
  router.post("/review/create/:email", Auth, appController.saveReview); //save a new review
  router.put("/review/delete/:email", Auth, appController.deleteReview); //Delete/Take down a review
  router
    .get("/review/byUser/:email", Auth, appController.getReviewsByUser); //get all user's reviews
  router.put("/review/reply/:email", Auth, appController.replyReview); //reply a specific review
  router.get("/alerts/all/:email", Auth, appController.getAlerts); //Get all alerts
  router.get("/alerts/byUser/:email", Auth, userController.getUserAlerts); //Get all alerts by user

  router.post("/account/report/:email", Auth, userController.reportUser); //reply a specific review
  router.post("/account/block/:email", Auth, userController.blockUser); //reply a specific review
  router
    .post("/account/unblock/:email", Auth, userController.unblockUser); //reply a specific review
  router
    .get("/account/transactions/byUser/:email", Auth, transactionController.getAllUserTransactions); //reply a specific review

  router
    .put("/connection/request/accept/:email/:connectionId", Auth, connectionController.acceptConnectionRequest); //Add connection after payment
  router
    .put("/connection/request/cancel/:email/:connectionId", Auth, connectionController.cancelConnectionRequest); //Add connection after payment
  router
    .put("/connection/request/decline/:email/:connectionId", Auth, connectionController.declineConnectionRequest); //Add connection after payment
  router
    .put("/connection/request/disconnect/:email/:connectionId", Auth, connectionController.disconnectConnection); //Add connection after payment
  router
    .get("/connection/byUser/all/:email", Auth, connectionController.getUserConnections); //get all user's reviewsc
  router
    .get("/connection/past/byUser/all/:email", Auth, connectionController.getUserPastConnections); //get all user's reviewsc
  router
    .get("/connection/byUser/pending-request/received/:email", Auth, connectionController.getUserPendingConnectionRequest); //get all user's reviewsc
  router
    .post("/connection/request/:email", Auth, connectionController.sendConnectionRequest); //Add connection after payment

  // ***** APPLICATION ***** //
  router.get("/search/:key", appController.searcher); //Search endpoint
  router.get("/searching/:key", appController.searcherAdvanced); //Search endpoint
  router.post("/support/:email", Auth, appController.addSupport);
  router.put("/wallet/topup/:email", Auth, appController.topUpWallet);
  router.get("/profession/all", professionController.allProfession);
  router.get("/legal/all", appController.getLegal);
  router.get("/banners/all", cmsController.allBanners);
  router.get("/faqs/all", cmsController.allFAQs);
  router.get("/sections/all", cmsController.allSections);
  router
    .post("/payment/init/:email", Auth, paymentController.initPayment);
  router.post("/payment/verify", paymentController.verifyPayment);
  router.post("/payment/webhook", paymentController.paymentWebHook);

  // ***** JOBS ***** //
  router.post("/job/post/:email", Auth, jobController.postJob);
  router.get("/job/all", jobController.getAllJobs);
  router.get("/job/search/:key", jobController.searchJob);
  router
    .get("/job/recommended/:email", Auth, jobController.getRecommendedJobs);
  router.get("/job/byUser/:email", Auth, jobController.getJobsByUser);
  router.get("/job/savedJobs/:email", Auth, jobController.getSavedJobs);
  router.put("/job/delete/:email", Auth, jobController.deleteJob);
  router.put("/job/update/:email", Auth, jobController.updateJob);
  router.put("/job/save/:email", Auth, jobController.bookmarkJob);
  router.post("/job/apply/:email", Auth, jobController.applyJob);
  router
    .get("/job/applications/:email", Auth, jobController.getJobApplications);
  router
    .get("/admin/job/applications/:email", [verifyAdmin, verifyCookie], jobController.getJobApplications);
  router
    .get("/job/applications/byUser/:email", Auth, jobController.getJobApplicationsByUser);
  router
    .put("/job/applications/accept/:email", Auth, jobController.acceptJobApplication);
  router
    .put("/job/applications/decline/:email", Auth, jobController.declineJobApplication);

  // ***** ADMIN ***** //
  router.post("/admin/create", verifyAdmin, adminController.register);
  router
    .post("/admin/new", [verifyAdmin, verifyCookie], adminController.create);
  router
    .get("/admin/all", [verifyAdmin, verifyCookie], adminController.getAdmins);
  router.post("/admin/login", verifyAdmin, adminController.login);
  router.post("/admin/logout", verifyAdmin, adminController.logout);
  router
    .get("/support/all/", [verifyAdmin, verifyCookie], appController.getSupports);
  router
    .put("/support/close/", [verifyAdmin, verifyCookie], appController.closeSupport);
  router
    .get("/admin/profile", [verifyAdmin, verifyCookie], adminController.profile);
  router
    .get("/applications/all/", [verifyAdmin, verifyCookie], jobController.getAllApplications);
  router
    .get("/admin/users/all/", [verifyAdmin, verifyCookie], controller.allUsers);
  router
    .put("/admin/users/update/", [verifyAdmin, verifyCookie], adminController.updateUser);
  router
    .delete("/admin/delete/:id/", [verifyAdmin, verifyCookie], adminController.otherAdminsDelete);
  router
    .put("/admin/update/:id/", [verifyAdmin, verifyCookie], adminController.otherAdminUpdate);
  router
    .put("/admin/profile/update", [verifyAdmin, verifyCookie], adminController.updateProfile);


  router
    .post("/profession/create", [verifyAdmin, verifyCookie], professionController.addProfession);
  router
    .delete("/profession/delete/:id", [verifyAdmin, verifyCookie], professionController.deleteProfession);
  router
    .put("/profession/update/:id", [verifyAdmin, verifyCookie], professionController.updateProfession);

  router
    .put("/legal/privacy/update", [verifyAdmin, verifyCookie], cmsController.setPrivacyPolicy);
  router
    .put("/legal/terms/update", [verifyAdmin, verifyCookie], cmsController.setTermsOfUse);

  router
    .get("/transactions/all", [verifyAdmin, verifyCookie], transactionController.getAllTranactions);

  router
    .post("/cms/banners/add", [verifyAdmin, verifyCookie], cmsController.addBanner);
  router
    .put("/cms/banners/update/:bannerId", [verifyAdmin, verifyCookie], cmsController.updateBanner);
  router
    .delete("/cms/banners/delete/:bannerId", [verifyAdmin, verifyCookie], cmsController.deleteBanner);
  router
    .post("/cms/faqs/add", [verifyAdmin, verifyCookie], cmsController.addFAQ);
  router
    .put("/cms/faqs/update/:faqId", [verifyAdmin, verifyCookie], cmsController.updateFAQ);
  router
    .delete("/cms/faqs/delete/:faqId", [verifyAdmin, verifyCookie], cmsController.deleteFAQ);
  router
    .post("/cms/sections/add", [verifyAdmin, verifyCookie], cmsController.addSection);
  router
    .put("/cms/sections/update/:sectionId", [verifyAdmin, verifyCookie], cmsController.updateSection);
  router
    .delete("/cms/sections/delete/:sectionId", [verifyAdmin, verifyCookie], cmsController.deleteSection);

  app.use("/api", router);
};
