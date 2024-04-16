import { Router } from "express";
const router = Router();

/** import all controllers */
import * as controller from '../controllers/authController.js';
import * as appController from '../controllers/appController.js';
import * as chatController from '../controllers/chatController.js';
import * as messageController from '../controllers/messageController.js';
import * as jobController from '../controllers/jobsController.js';
import * as adminController from '../controllers/adminController.js';
import * as professionController from '../controllers/professionController.js';
import * as cmsController from "../controllers/cmsController.js"
import * as connectionController from "../controllers/connectionController.js"
import * as userController from "../controllers/userController.js"
import * as transactionController from "../controllers/transactionController.js"
import * as paymentController from "../controllers/paymentController.js"

// import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables, verifyAdmin, verifyCookie } from '../middleware/auth.js';

 
                        // ***** AUTHENTICATION ***** //
router.route('/register').post(controller.register); // register user
router.route('/login').post(controller.login); // login in app
router.route('/forgotPassword').post(controller.forgotPassword); // forgot password send email
router.route('/auth/google').post(controller.getGoogleParams);
router.route('/auth/google/web').post(controller.getGoogleParamsWeb);
router.route('/verifyOTP').get(controller.verifyOTP) // verify generated OTP
router.route('/resendOTP').get(controller.resendOTP, ) // verify generated OTP
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword); // use to reset password



                        // ***** CHAT ***** //
router.route('/chat/init/:email').put(Auth, chatController.accessChat); 
// router.route('/chat/allChats/:email').get(Auth, chatController.fetchChats); 
router.route('/chat/allChats/:email').get(Auth, chatController.getChats); 
router.route('/chat/messages/:email/:chatId').get(Auth, messageController.getChatMessages); 
router.route('/chat/message/post/:email').post(Auth, messageController.sendMessage); 




                        // ***** ACCOUNT ***** //
router.route('/users').get(controller.getAllUsers)
router.route('/user/:email').get(Auth, controller.getUser) // user with email
router.route('/freelancers/').get(appController.getAllProfessionals) // freelancer with email
router.route('/freelancers/:profession').get(appController.getAllProfessionalsByProfession) // freelancer with email
router.route('/recruiters/:email').get(Auth, appController.getAllRecruiters) // freelancer with email
router.route('/createResetSession').get(controller.createResetSession) // reset all the variables
router.route('/logout/:email').get(Auth, controller.logout); //Log user out
router.route('/updateuser/:email').put(Auth, controller.updateUser); // is use to update the user profile
router.route('/likeUser/:email').put(Auth, appController.saveWishlist); // Like/Unlike user
router.route('/users/savedPros/:email').get(Auth, appController.getSavedPros); //get saved pros/recruiters for user
router.route('/review/create/:email').post(Auth, appController.saveReview); //save a new review
router.route('/review/delete/:email').put(Auth, appController.deleteReview); //Delete/Take down a review
router.route('/review/byUser/:email').get(Auth, appController.getReviewsByUser); //get all user's reviews
router.route('/review/reply/:email').put(Auth, appController.replyReview); //reply a specific review
router.route('/alerts/all/:email').get(Auth, appController.getAlerts); //Get all alerts
router.route('/alerts/byUser/:email').get(Auth, userController.getUserAlerts); //Get all alerts by user

router.route('/account/report/:email').post(Auth, userController.reportUser); //reply a specific review
router.route('/account/block/:email').post(Auth, userController.blockUser); //reply a specific review
router.route('/account/unblock/:email').post(Auth, userController.unblockUser); //reply a specific review
router.route('/account/transactions/byUser/:email').get(Auth, transactionController.getAllUserTransactions); //reply a specific review

router.route('/connection/request/accept/:email/:connectionId').put(Auth, connectionController.acceptConnectionRequest); //Add connection after payment
router.route('/connection/request/cancel/:email/:connectionId').put(Auth, connectionController.cancelConnectionRequest); //Add connection after payment
router.route('/connection/request/decline/:email/:connectionId').put(Auth, connectionController.declineConnectionRequest); //Add connection after payment
router.route('/connection/request/disconnect/:email/:connectionId').put(Auth, connectionController.disconnectConnection); //Add connection after payment
router.route('/connection/byUser/all/:email').get(Auth, connectionController.getUserConnections); //get all user's reviewsc
router.route('/connection/past/byUser/all/:email').get(Auth, connectionController.getUserPastConnections); //get all user's reviewsc
router.route('/connection/byUser/pending-request/received/:email').get(Auth, connectionController.getUserPendingConnectionRequest); //get all user's reviewsc
router.route('/connection/request/:email').post(Auth, connectionController.sendConnectionRequest); //Add connection after payment



 

                        // ***** APPLICATION ***** //
router.route('/search/:key').get(appController.searcher); //Search endpoint 
router.route('/searching/:key').get(appController.searcherAdvanced); //Search endpoint
router.route('/support/:email').post(Auth, appController.addSupport);
router.route('/wallet/topup/:email').put(Auth, appController.topUpWallet);
router.route('/profession/all').get(professionController.allProfession);
router.route('/legal/all').get(appController.getLegal);
router.route('/banners/all').get(cmsController.allBanners);
router.route('/faqs/all').get(cmsController.allFAQs);
router.route('/sections/all').get(cmsController.allSections);
router.route('/payment/init/:email/:transactionType').post(Auth, paymentController.initPayment);
router.route('/payment/verify').post(paymentController.verifyPayment);
router.route('/payment/webhook').post(paymentController.verifyPayment);

 

                        // ***** JOBS ***** //
router.route('/job/post/:email').post(Auth, jobController.postJob);
router.route('/job/all').get(jobController.getAllJobs);
router.route('/job/search/:key').get(jobController.searchJob);
router.route('/job/recommended/:email').get(Auth, jobController.getRecommendedJobs);
router.route('/job/byUser/:email').get(Auth, jobController.getJobsByUser);
router.route('/job/savedJobs/:email').get(Auth, jobController.getSavedJobs);
router.route('/job/delete/:email').put(Auth, jobController.deleteJob);
router.route('/job/update/:email').put(Auth, jobController.updateJob);
router.route('/job/save/:email').put(Auth, jobController.bookmarkJob);
router.route('/job/apply/:email').post(Auth, jobController.applyJob);
router.route('/job/applications/:email').get([verifyAdmin, verifyCookie], jobController.getJobApplications);
router.route('/job/applications/byUser/:email').get(Auth, jobController.getJobApplicationsByUser);
router.route('/job/applications/accept/:email').put(Auth, jobController.acceptJobApplication);
router.route('/job/applications/decline/:email').put(Auth, jobController.declineJobApplication);



                        // ***** ADMIN ***** //
router.route('/admin/create').post(verifyAdmin, adminController.register);
router.route('/admin/new').post([verifyAdmin, verifyCookie], adminController.create);
router.route('/admin/all').get([verifyAdmin, verifyCookie], adminController.getAdmins);
router.route('/admin/login').post(verifyAdmin, adminController.login);
router.route('/admin/logout').post(verifyAdmin, adminController.logout);
router.route('/support/all/').get([verifyAdmin, verifyCookie], appController.getSupports);
router.route('/support/close/').put([verifyAdmin, verifyCookie], appController.closeSupport);
router.route('/admin/profile').get([verifyAdmin, verifyCookie], adminController.profile);
router.route('/applications/all/').get([verifyAdmin, verifyCookie], jobController.getAllApplications);
router.route('/admin/users/all/').get([verifyAdmin, verifyCookie], controller.allUsers);
router.route('/admin/users/update/').put([verifyAdmin, verifyCookie], adminController.updateUser);
router.route('/admin/delete/:id/').delete([verifyAdmin, verifyCookie], adminController.otherAdminsDelete);
router.route('/admin/update/:id/').put([verifyAdmin, verifyCookie], adminController.otherAdminUpdate);
router.route('/admin/profile/update').put([verifyAdmin, verifyCookie], adminController.updateProfile);


router.route('/profession/create').post([verifyAdmin, verifyCookie], professionController.addProfession);
router.route('/profession/delete/:id').delete([verifyAdmin, verifyCookie], professionController.deleteProfession);
router.route('/profession/update/:id').put([verifyAdmin, verifyCookie], professionController.updateProfession);

router.route('/legal/privacy/update').put([verifyAdmin, verifyCookie], cmsController.setPrivacyPolicy);
router.route('/legal/terms/update').put([verifyAdmin, verifyCookie], cmsController.setTermsOfUse);

router.route('/transactions/all').get([verifyAdmin, verifyCookie], transactionController.getAllTranactions);

router.route('/cms/banners/add').post([verifyAdmin, verifyCookie], cmsController.addBanner);
router.route('/cms/banners/update/:bannerId').put([verifyAdmin, verifyCookie], cmsController.updateBanner);
router.route('/cms/banners/delete/:bannerId').delete([verifyAdmin, verifyCookie], cmsController.deleteBanner);
router.route('/cms/faqs/add').post([verifyAdmin, verifyCookie], cmsController.addFAQ);
router.route('/cms/faqs/update/:faqId').put([verifyAdmin, verifyCookie], cmsController.updateFAQ);
router.route('/cms/faqs/delete/:faqId').delete([verifyAdmin, verifyCookie], cmsController.deleteFAQ);
router.route('/cms/sections/add').post([verifyAdmin, verifyCookie], cmsController.addSection);
router.route('/cms/sections/update/:sectionId').put([verifyAdmin, verifyCookie], cmsController.updateSection);
router.route('/cms/sections/delete/:sectionId').delete([verifyAdmin, verifyCookie], cmsController.deleteSection);



export default router;