import { Router } from "express";
const router = Router();

/** import all controllers */
import * as controller from '../controllers/authController.js';
import * as appController from '../controllers/appController.js';
import * as chatController from '../controllers/chatController.js';
import * as chat2Controller from '../controllers/chat2Controller.js';
import * as messageController from '../controllers/messageController.js';
import * as jobController from '../controllers/jobsController.js';
import * as adminController from '../controllers/adminController.js';
import * as professionController from '../controllers/professionController.js';

// import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables, verifyAdmin, verifyCookie } from '../middleware/auth.js';

 
                        // ***** AUTHENTICATION ***** //
router.route('/register').post(controller.register); // register user
router.route('/login').post(controller.login); // login in app
router.route('/forgotPassword').post(controller.forgotPassword); // forgot password send email
router.route('/auth/google').post(controller.getGoogleParams);
router.route('/verifyOTP').get(controller.verifyUser, controller.verifyOTP) // verify generated OTP
router.route('/resendOTP').get(controller.resendOTP, ) // verify generated OTP
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword); // use to reset password



                        // ***** CHAT ***** //
router.route('/chat/initiate/:email').post(Auth, chatController.initiateChat);
router.route('/chat/all/:email').get(Auth, chatController.getChatsByUser);
router.route('/chat/message/new/:email').post(Auth, chatController.postMessage)
router.route('/chat/message/all/:email').get(Auth, chatController.getConversationByRoomId)
router.route('/chat/message/delete/:email').put(Auth, chatController.deleteMessage); //Set mark as read

router.route('/chat/init/:email').put(Auth, chat2Controller.accessChat); 
router.route('/chat/allChats/:email').get(Auth, chat2Controller.fetchChats); 
router.route('/chat/messages/:email/:chatId').get(Auth, messageController.allMessages); 
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
router.route('/connection/:email').put(Auth, appController.saveConnection); //Add connection after payment
router.route('/users/savedPros/:email').get(Auth, appController.getLikedUsers); //get saved pros/recruiters for user
router.route('/users/connections/:email').get(Auth, appController.getConnections); //get all connections of a user
router.route('/review/create/:email').post(Auth, appController.saveReview); //save a new review
router.route('/review/delete/:email').put(Auth, appController.deleteReview); //Delete/Take down a review
router.route('/review/byUser/:email').get(Auth, appController.getReviewsByUser); //get all user's reviews
router.route('/review/reply/:email').put(Auth, appController.replyReview); //reply a specific review

 

                        // ***** APPLICATION ***** //
router.route('/search/:key').get(appController.searcher); //Search endpoint 
router.route('/searching/:key').get(appController.searcherAdvanced); //Search endpoint
router.route('/support/:email').post(Auth, appController.addSupport);
router.route('/wallet/topup/:email').put(Auth, appController.topUpWallet);
router.route('/profession/all').get(professionController.allProfession);
router.route('/legal/all').get(appController.getLegal);

 

                        // ***** JOBS ***** //
// router.route('/search/:key').get(appController.searcher); //Search endpoint
router.route('/job/post/:email').post(Auth, jobController.postJob);
router.route('/job/all/').get(jobController.getAllJobs);
router.route('/job/search/:key').get(jobController.searchJob);
router.route('/job/recommended/:email').get(Auth, jobController.getRecommendedJobs);
router.route('/job/byUser/:email').get(Auth, jobController.getJobsByUser);
router.route('/job/savedJobs/:email').get(Auth, jobController.getSavedJobs);
router.route('/job/delete/:email').put(Auth, jobController.deleteJob);
router.route('/job/update/:email').put(Auth, jobController.updateJob);
router.route('/job/save/:email').put(Auth, jobController.bookmarkJob);
router.route('/job/apply/:email').post(Auth, jobController.applyJob);
router.route('/job/applications/:email').get(jobController.getJobApplications);
router.route('/job/applications/byUser/:email').get(Auth, jobController.getJobApplicationsByUser);
router.route('/job/applications/accept/:email').put(Auth, jobController.acceptJobApplication);



                        // ***** ADMIN ***** //
router.route('/admin/create').post(verifyAdmin, adminController.register);
router.route('/admin/login').post(verifyAdmin, adminController.login);
router.route('/support/all/').get([verifyAdmin, verifyCookie], appController.getSupports);
router.route('/admin/profile').get([verifyAdmin, verifyCookie], adminController.profile);
router.route('/job/all/').get([verifyAdmin, verifyCookie], jobController.getAllJobs);
router.route('/applications/all/').get([verifyAdmin, verifyCookie], jobController.getAllApplications);
router.route('/admin/users/all/').get([verifyAdmin, verifyCookie], controller.allUsers);
router.route('/profession/create').post([verifyAdmin, verifyCookie], professionController.addProfession);
router.route('/profession/delete').put([verifyAdmin, verifyCookie], professionController.deleteProfession);
router.route('/profession/update').put([verifyAdmin, verifyCookie], professionController.updateProfession);
router.route('/legal/privacy/update').put([verifyAdmin, verifyCookie], adminController.setPrivacyPolicy);
router.route('/legal/terms/update').put([verifyAdmin, verifyCookie], adminController.setTermsOfUse);



export default router;