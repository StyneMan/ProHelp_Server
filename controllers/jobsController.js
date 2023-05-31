// import { v4 } from "uuid";
import { sendJobEmail } from "./mailer.js";
import User from "../model/User.model.js";
import Job from "../model/Job.model.js";
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

export async function postJob(req, res) {
  try {
    const { hasPayment } = req.body;
    const { email } = req.params;

    const em = await User.findOne({ email });

    if (em?.jobsPostingPlan) {
      if (!em?.jobsPostingPlan?.totalPosted > 5 && !hasPayment)
        return res.status(400).json({
          success: false,
          message: "You have exceeded your free job posting quota!",
        });
    }

    const jobData = new Job({
      jobTitle: req.body?.jobTitle,
      company: req.body?.company,
      workplaceType: req.body?.workplaceType,
      jobLocation: req.body?.jobLocation,
      jobType: req.body?.jobType,
      description: req.body?.description,
      screeningQuestions: req.body?.screeningQuestions,
      recruiter: req.body?.recruiter,
    });

    // return save result as a response
    jobData
      .save()
      .then(async (result) => {
        //Save job to user profile
        console.log("RESF", result?._id);
        console.log("RESF 2", result?._id?.toString());

        const usr = await User.findOneAndUpdate(
          { email: email },
          { $push: { myJobs: result?._id?.toString() } },
          {
            new: true,
          }
        );

        //Now send email here
        sendJobEmail(email, req.body?.jobTitle, em?.bio?.fullname).then(
          (val) => {
            res.status(200).send({
              success: true,
              message: "Job has been posted successfully ",
              data: result,
            });
          }
        );
      })
      .catch((error) =>
        res
          .status(500)
          .send({ success: false, message: "error msg =>> " + error })
      );
  } catch (error) {
    console.log("MERROR ", error);
    return res
      .status(404)
      .send({ success: false, message: "Authentication error" });
  }
}

export async function getJobsByUser(req, res) {
  try {
    const { userId } = req.query;
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const jobs = await Job.aggregate([
      { $match: { "recruiter.id": userId } },
      { $sort: { updatedAt: -1 } },
      // pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { updatedAt: 1 } },
    ]);

    return res.status(200).send({
      success: true,
      message: "",
      data: jobs,
    });
  } catch (error) {
    console.log("ERROR", error);
    throw new Error(error);
  }
}

export async function getRecommendedJobs(req, res) {
  try {
    const { userId } = req.query;
    const usr = User.findOne({ _id: userId });

    if (!usr) {
      return res
        .status(404)
        .send({ success: false, message: "user does not exist" });
    }

    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const jobs = await Job.aggregate([
      { $match: { jobTitle: usr?.profession } },
      { $sort: { updatedAt: -1 } },
      // pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { updatedAt: 1 } },
    ]);

    return res.status(200).send({
      success: true,
      message: "",
      data: jobs,
    });
  } catch (error) {
    console.log("ERROR", error);
    throw new Error(error);
  }
}

export async function getAllJobs(req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }
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

    const jobs = await Job.paginate(query, options);

    res.status(200).send(jobs);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
}
