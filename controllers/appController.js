import Support from "../model/Support.model.js";
import { v4 } from "uuid";
import { sendSupportEmail } from "./mailer.js";
import User from "../model/User.model.js";
import Alert from "../model/Alert.model.js";
import Review from "../model/Review.model.js";
// import SupportModel from "../model/Support.model";

/** middleware for verify user */
export async function verifyUser(req, res, next) {
  try {
    const { email } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await User.findOne({ email });
    if (!exist)
      return res
        .status(404)
        .send({ success: false, message: "Can not find user!" });
    next();
  } catch (error) {
    console.log("MERROR ", error);
    return res
      .status(404)
      .send({ success: false, message: "Authentication error" });
  }
}

export async function addSupport(req, res) {
  try {
    const { purpose, message, user } = req.body;
    const { email } = user;

    const em = await User.findOne({ email }); // check if a user with the same email exists in the database

    if (!em)
      return res.status(404).json({
        success: false,
        message: "The user does not exist on this platform!",
      });
    //Generate a ticket number
    const ticketId = v4();
    const support = new Support({
      purpose: purpose,
      message: message,
      user: user,
      ticket: ticketId,
    });

    // return save result as a response
    support
      .save()
      .then(async (result) => {
        //Now send email here
        sendSupportEmail(user, ticketId, purpose).then((val) => {
          res.status(200).send({
            success: true,
            message: "Request received! Check your email for your ticket ID ",
          });
        });
      })
      .catch((error) =>
        res.status(500).send({ success: false, message: error })
      );
  } catch (error) {
    console.log("MERROR ", error);
    return res
      .status(404)
      .send({ success: false, message: "Authentication error" });
  }
}

export async function addAlert(type, message, userId, user) {
  try {
    const em = await User.findOne({ _id: userId }); // check if a user exists in the database

    if (!em)
      return res.status(404).json({
        success: false,
        message: "Account does not exist on this platform!",
      });

    const alert = new Alert({
      type: type,
      message: message,
      user: user,
      userId: userId,
    });

    // return save result as a response
    alert
      .save()
      .then(async (result) => {
        console.log("Alert added successfully");
        // res.status(200).send({
        // 	success: true,
        // 	message:
        // 		"Request rerceived. check your email for your ticket ID ",
        // });
      })
      .catch((error) =>
        res.status(500).send({ success: false, message: error })
      );
  } catch (error) {
    console.log("MERROR ", error);
    return res
      .status(404)
      .send({ success: false, message: "Authentication error" });
  }
}

export async function getAllFreelancers(req, res) {
  // const { email } = req.params;
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
        accountType: {
          $eq: "freelancer",
        },
      };
    } else {
      query = {
        accountType: {
          $eq: "freelancer",
        },
      };
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const users = await User.paginate(query, options);

    res.status(200).send(users);

    // if (!email)
    //   return res
    //     .status(404)
    //     .send({ success: false, message: "User does not exist" });

    // User.findOne({ email: email }).then((user) => {
    //   if (user.accountType === "freelancer") {
    //     User.find({ accountType: "freelancer", email: { $ne: email } })
    //       .then((val) => {
    //         let emptArr = [];

    //         val.forEach((element) => {
    //           const { password, ...rest } = Object.assign({}, element.toJSON());
    //           emptArr.push(rest);
    //         });

    //         res.status(200).send({
    //           success: true,
    //           message: "Operation successful",
    //           data: emptArr,
    //         });
    //       })
    //       .catch((error) => {
    //         console.log("ERROR LOOg >> ", error);
    //         res.status(500).send({
    //           success: false,
    //           message: "An error occurred",
    //         });
    //       });
    //   } else {
    //     User.find({ accountType: "freelancer" })
    //       .then((val) => {
    //         let emptArr = [];

    //         val.forEach((element) => {
    //           const { password, ...rest } = Object.assign({}, element.toJSON());
    //           emptArr.push(rest);
    //         });

    //         res.status(200).send({
    //           success: true,
    //           message: "Operation successful",
    //           data: emptArr,
    //         });
    //       })
    //       .catch((error) => {
    //         console.log("ERROR LOOg >> ", error);
    //         res.status(500).send({
    //           success: false,
    //           message: "An error occurred",
    //         });
    //       });
    //   }
    // });
  } catch (error) {
    console.log("ERROR OCCURED >. ", error);
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}

export async function getAllRecruiters(req, res) {
  const { email } = req.params;
  try {
    if (!email)
      return res
        .status(404)
        .send({ success: false, message: "User does not exist" });

    User.findOne({ email: email }).then((user) => {
      if (user.accountType === "recruiter") {
        User.find({ accountType: "recruiter", email: { $ne: email } })
          .then((val) => {
            let emptArr = [];

            val.forEach((element) => {
              const { password, ...rest } = Object.assign({}, element.toJSON());
              emptArr.push(rest);
            });

            res.status(200).send({
              success: true,
              message: "Operation successful",
              data: emptArr,
            });
          })
          .catch((error) => {
            console.log("ERROR LOOg >> ", error);
            res.status(500).send({
              success: false,
              message: "An error occurred",
            });
          });
      } else {
        User.find({ accountType: "recruiter" })
          .then((val) => {
            let emptArr = [];

            val.forEach((element) => {
              const { password, ...rest } = Object.assign({}, element.toJSON());
              emptArr.push(rest);
            });

            res.status(200).send({
              success: true,
              message: "Operation successful",
              data: emptArr,
            });
          })
          .catch((error) => {
            console.log("ERROR LOOg >> ", error);
            res.status(500).send({
              success: false,
              message: "An error occurred",
            });
          });
      }
    });
  } catch (error) {
    console.log("ERROR OCCURED >. ", error);
    return res
      .status(404)
      .send({ success: false, message: "Cannot Find User Data" });
  }
}

export async function saveWishlist(req, res) {
  const { guestId, guestName, userId } = req.body;
  try {
    if (!userId)
      res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    const user = await User.findById(userId);
    const alreadyAdded = user.savedPros.find((id) => id.toString() === guestId);
    if (alreadyAdded) {
      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { savedPros: guestId },
        },
        { new: true }
      );
      return res.status(200).send({
        success: false,
        message: "Successfully unliked " + guestName,
        data: usr,
      });
    } else {
      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $push: { savedPros: guestId },
        },
        { new: true }
      );
      return res.status(200).send({
        success: false,
        message: "Successfully liked " + guestName,
        data: usr,
      });
    }
  } catch (error) {
    console.log("ERROR LIKING >>> ", error);
    throw new Error(error);
  }
}

export async function getLikedUsers(req, res) {
  const { email } = req.params;
  try {
    if (!email)
      res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    User.findOne({ email: email })
      .then((user) => {
        // console.log("STR ARR ", `${user.savedPros}`);
        const stringArray = user.savedPros.map((objectId) =>
          objectId.toString()
        );
        console.log("SAVED PROS  ", user.savedPros.toString());
        console.log("STR ARR ", stringArray);

        User.find({ _id: { $in: stringArray } })
          .then((rs) => {
            // console.log("STR RES ", rs);
            res
              .status(200)
              .send({ success: true, message: "Success", data: rs });
          })
          .catch((error) => console.log("ERR >> ", error));
      })
      .catch((err) => console.log("ERRORRO >> ", err));
  } catch (error) {
    throw new Error(error);
  }
}

export async function searcher(req, res) {
  // const { key } = req.params;
  try {
    let data = await User.find({
      $or: [
        { "bio.fullname": { $regex: req.params.key } },
        { "experience.company": { $regex: req.params.key } },
        { "experience.region": { $regex: req.params.key } },
        { "experience.country": { $regex: req.params.key } },
        { "experience.workType": { $regex: req.params.key } },
        { "experience.role": { $regex: req.params.key } },
        { "education.school": { $regex: req.params.key } },
        { "education.degree": { $regex: req.params.key } },
        { "education.course": { $regex: req.params.key } },
        { "skills.name": { $regex: req.params.key } },
        { "address.state": { $regex: req.params.key } },
        { "address.country": { $regex: req.params.key } },
        { "address.city": { $regex: req.params.key } },
        { profession: { $regex: req.params.key } },
        { accountType: { $regex: req.params.key } },
      ],
    });

    res.status(200).send({
      success: true,
      message: "search success",
      data: data,
    });
  } catch (error) {
    throw new Error(error);
  }
}

export async function saveConnection(req, res) {
  try {
    const { guestId, guestName, userId } = req.body;
    const { email } = req.params;

    const em = await User.findOne({ email });
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    await User.findByIdAndUpdate(
      guestId,
      {
        $push: { connections: userId },
      },
      { new: true }
    );

    console.log("GUEST ID", guestId);

    let usr = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          connections: guestId,
          transactions: {
            type: "connection",
            amount: 200,
            summary: `You connected with ${guestName}`,
            status: "success",
            reference: guestId,
            createdAt: new Date().toISOString(),
          },
        },
        $set: {
          "wallet.balance": em.wallet?.balance - 200,
          "wallet.prevBalance": em?.wallet?.balance,
          "wallet.updatedAt": new Date().toISOString(),
        },
      },
      { new: true }
    );

    const { password, ...rest } = Object.assign({}, usr.toJSON());

    return res.status(200).send({
      success: false,
      message: "Successfully connected to " + guestName,
      data: rest,
    });
  } catch (error) {
    console.log("ERROR LIKING >>> ", error);
    throw new Error(error);
  }
}

export async function getConnections(req, res) {
  const { email } = req.params;
  try {
    if (!email)
      res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    User.findOne({ email: email })
      .then((user) => {
        console.log("STR ARR ", `${user.connections}`);
        const stringArray = user.connections.map((objectId) =>
          objectId.toString()
        );
        console.log("CONNECTIONS  ", user.connections.toString());
        // console.log("STR ARR ", stringArray);

        User.find({ _id: { $in: stringArray } })
          .then((rs) => {
            // console.log("STR RES ", rs);
            res
              .status(200)
              .send({ success: true, message: "Success", data: rs });
          })
          .catch((error) => console.log("ERR >> ", error));
      })
      .catch((err) => console.log("ERRORRO >> ", err));
  } catch (error) {
    throw new Error(error);
  }
}

export async function saveReview(req, res) {
  const { reviewer, comment, userId, rating, email } = req.body;
  try {
    const findReviewer = User.findOne({ email });
    if (!findReviewer) {
      return res.status(404).send({
        success: false,
        message: "User does not exist on our platform",
      });
    }

    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
      return res.status(404).send({
        success: false,
        message:
          "You are trying to review a user that does not exist on our platform",
      });
    }

    const review = await new Review({
      comment: comment,
      rating: rating,
      reviewer: reviewer,
      userId: userId,
    });

    review
      .save()
      .then(async (result) => {
        //Recalculate rating for this user
        var ratingsSum = 0;
        var ratingsVal = 0;

        User.findOne({ _id: userId }).then(async (val) => {
          let existingReviews = val?.reviews;

          console.log("CURRENT REVIEWS ", existingReviews);

          existingReviews?.forEach((elem) => {
            ratingsSum = ratingsSum + elem?.rating;

            console.log("RATING ", elem?.rating);
          });
          let length = existingReviews?.length + 1;
          let netSum = ratingsSum + rating;
          ratingsVal = netSum / length;

          console.log("RATING ", rating);
          console.log("RATING LENGTH ", length);
          console.log("RATING SUM ", netSum);
          console.log("RATING NET VALUE >> ", ratingsVal);

          //Now update user's profile
          let usr = await User.findByIdAndUpdate(
            userId,
            {
              $push: {
                reviews: {
                  _id: result._id,
                  reviewer: reviewer.id,
                  rating: rating,
                },
              },
              $set: {
                rating: ratingsVal,
              },
            },
            { new: true }
          );

          // remove password and return user's profile
          const { password, ...rest } = Object.assign({}, usr.toJSON());

          global.io.in(userId).emit("new-review", {
            message: "Someone just reviewed you",
            data: rest,
          });

          res.status(200).send({
            success: true,
            message: "Your review was successful",
          });
        });
      })
      .catch((error) => {
        console.log("REVIEW ER R>> ", error);
        return res.status(500).send({ success: false, message: error });
      });
  } catch (error) {
    console.log("REVIEW ERR>> ", error);
    return res.status(500).send({ success: false, message: error });
  }
}

export async function deleteReview(req, res) {
  const { userId, reviewerId, reviewId, rating } = req.body;
  const { email } = req.params;

  // console.log("PAYLOAD", reviewerId);
  // console.log("PAYLOAD", userId);
  // console.log("PAYLOAD", reviewId);
  // console.log("PAYLOAD", rating);

  try {
    const findReviewer = User.findOne({ email });
    if (!findReviewer) {
      return res.status(404).send({
        success: false,
        message: "User does not exist on our platform",
      });
    }

    // console.log("USER DATA <<<>>> ", findReviewer);

    Review.deleteOne({
      _id: reviewId,
    }).then((val) => {
      var ratingsSum = 0;
      var ratingsVal = 0;

      // console.log("PAYLOAD", val);

      //Update this users reviews length
      // User.findByIdAndUpdate(
      //   userId,
      //   {
      //     $pull: {
      //       reviews: {
      //         _id: reviewId,
      //         reviewer: reviewerId,
      //         rating: rating,
      //       },
      //     },
      //   },
      //   { new: true }
      // ).then(async (val) => {
      //   let existingReviews = val?.reviews;

      //   console.log("CURRENT REVIEWS ", existingReviews);

      //   existingReviews?.forEach((elem) => {
      //     ratingsSum = ratingsSum + elem?.rating;

      //     console.log("RATING ", elem?.rating);
      //   });

      //   let length = existingReviews?.length;
      //   ratingsVal = ratingsSum / length;

      //   console.log("RATING ", rating);
      //   console.log("RATING LENGTH ", length);
      //   console.log("RATING SUM ", ratingsSum);
      //   console.log("RATING NET VALUE >> ", ratingsVal);

      //   //Now remove review from user's reviews
      //   let usr = await User.findByIdAndUpdate(
      //     { email: val?.email },
      //     { $set: { rating: ratingsVal } },
      //     {
      //       new: true,
      //     }
      //   );

      //   // remove password and return user's profile
      //   const { password, ...rest } = Object.assign({}, usr.toJSON());

      //   global.io.in(userId).emit("review-updated", {
      //     message: "Someone just updated a review about you",
      //     data: rest,
      //   });

      //   res.status(200).send({
      //     success: true,
      //     message: "Review successfully deleted",
      //   });
      // });
    });
  } catch (error) {
    console.log("REVIEW DELETE ERR >> ", error?.message);
    return res.status(500).send({ success: false, message: error });
  }
}

export async function replyReview(req, res) {
  const { reviewId, reviewerId, replyBody } = req.body;

  try {
    const reviewer = await User.findOne({ _id: reviewerId });
    if (!reviewer) {
      return res.status(404).send({
        success: false,
        message: "User does not exist on this platform!",
      });
    }

    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      return res
        .status(404)
        .send({ success: false, message: "Review does not exist!" });
    }

    let rep = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $set: { reply: replyBody } },
      {
        new: true,
      }
    );

    return res.status(200).send({
      success: true,
      message: "Reply sent successfully",
      data: rep,
    });
  } catch (error) {
    console.log("REVIEW REPLY ERROR >> ", error);
    return res.status(500).send({ success: false, message: error });
  }
}

export async function getReviewsByUser(req, res) {
  try {
    const { userId } = req.query;
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User does not exist on our platform!",
      });
    }

    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const reviews = await Review.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },

      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
    ]);

    return res.status(200).send({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.log("REVIEW ERR>> ", error);
    return res.status(500).send({ success: false, message: error });
  }
}

export async function topUpWallet(req, res) {
  try {
    const { userId, amount, value, reference, type, summary, status } =
      req.body;
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    //Create a new transaction
    let usr = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          transactions: {
            type: type,
            reference: reference,
            createdAt: new Date().toISOString(),
            amount: amount,
            summary: summary,
            status: status,
          },
        },
        $set: {
          wallet: {
            balance: user.wallet.balance + value,
            prevBalance: user.wallet.balance,
            updatedAt: new Date().toISOString(),
          },
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .send({ success: true, message: "Wallet topup successful", data: usr });
  } catch (error) {
    console.log("REVIEW ERR>> ", error);
    return res.status(500).send({ success: false, message: error });
  }
}

export async function getSupports(req, res) {
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      query = {};
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const supports = await Support.paginate(query, options);

    res.status(200).send(supports);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
}
