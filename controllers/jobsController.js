// import { v4 } from "uuid";
import {
  sendJobApplicationEmail,
  sendJobApplicationEmailNotice,
  sendJobEmail,
} from "./mailer.js";
import User from "../model/User.model.js";
import Job from "../model/Job.model.js";
import JobApplication from "../model/JobApplication.model.js";
import { ObjectId } from "mongodb";
// import SupportModel from "../model/Support.model";

const population = [
  {
    path: "job",
  },
];

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

    if (!em) {
      return res
        .status(404)
        .send({ success: false, message: "User not found!" });
    }

    // if (em?.jobsPostingPlan) {
    //   if (!em?.jobsPostingPlan?.totalPosted > 5 && !hasPayment)
    //     return res.status(400).json({
    //       success: false,
    //       message: "You have exceeded your free job posting quota!",
    //     });
    // }

    const jobData = new Job({
      jobTitle: req.body?.jobTitle,
      company: req.body?.company,
      workplaceType: req.body?.workplaceType,
      jobLocation: req.body?.jobLocation,
      jobType: req.body?.jobType,
      requirements: req.body?.requirements,
      minimumQualification: req.body?.minimumQualification,
      description: req.body?.description,
      screeningQuestions: req.body?.screeningQuestions,
      recruiter: req.body?.recruiter,
      profession: req.body?.profession,
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
          {
            $push: {
              myJobs: result?._id?.toString(),
              transactions: {
                type: "job_posting",
                amount: 200,
                summary: `You posted a new job with the title ${req.body?.jobTitle}`,
                status: "success",
                reference: result?._id?.toString(),
                createdAt: new Date().toISOString(),
              },
            },
            $set: {
              "wallet.balance": em.wallet?.balance - 200,
              "wallet.prevBalance": em?.wallet?.balance,
              "wallet.updatedAt": new Date().toISOString(),
              jobCount: em.jobCount + 1,
            },
          },
          {
            new: true,
          }
        );

        //Now send email here
        sendJobEmail(
          email,
          req.body?.jobTitle,
          `${em?.bio?.firstname} ${em?.bio?.lastname}`
        ).then((val) => {
          global.io.emit("job-posted", {
            message: "New job posted",
          });

          res.status(200).send({
            success: true,
            message: "Job has been posted successfully ",
            data: result,
          });
        });
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
    const { email } = req.params;
    let query;
    const { page = 1, limit = 30 } = req.query;

    console.log("EMAIL  ::: ", email);

    query = {
      "recruiter.email": { $eq: email },
    };

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const jobs = await Job.paginate(query, options);
    res.status(200).send(jobs);
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).send({
      success: false,
      message: error?.message,
    });
  }
}

export async function getRecommendedJobs(req, res) {
  const { email } = req.params;
  const { profession, page = 1, limit = 25 } = req.query;
  let query;
  try {
    const em = await User.findOne({ email });

    if (!em)
      return res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    query = {
      "profession": { $eq: profession },
    };

    const options = {
      sort: { updatedAt: -1 }, 
      page,
      limit,
    };

    const recommendedJobs = await Job.paginate(query, options);

    return res.status(200).send({
      success: true,
      message: "",
      ...recommendedJobs,
    });
  } catch (error) {
    console.log("ERR ", error);
    return res.status(500).send({ success: false, message: error?.message });
  }
}

export async function getAllJobs(req, res) {
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

export async function deleteJob(req, res) {
  try {
    const { jobId } = req.query;
    const job = Job.findOne({ _id: jobId });

    if (!job) {
      return res
        .status(404)
        .send({ success: false, message: "Job not found." });
    }
    const jb = await Job.findByIdAndDelete(jobId);

    return res.status(200).send({
      success: true,
      message: "Successfully deleted job",
      data: jb,
    });

    // return res.status(200).send({success: true, message: ''})
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

export async function updateJob(req, res) {
  try {
    const payload = req.body;
    const { jobId } = req.query;

    const job = Job.findOne({ _id: jobId });

    if (!job) {
      return res
        .status(404)
        .send({ success: false, message: "Job not found." });
    }

    let jb = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: payload,
      },
      { new: true }
    );
    return res.status(200).send({
      success: false,
      message: "Successfully updated job",
      data: jb,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

export async function bookmarkJob(req, res) {
  const { jobId, userId } = req.body;
  try {
    if (!userId)
      res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    const user = await User.findById(userId);
    const alreadyAdded = user.savedJobs.find((id) => id.toString() === jobId);
    if (alreadyAdded) {
      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { savedJobs: jobId },
        },
        { new: true }
      );
      return res.status(200).send({
        success: false,
        message: "Successfully removed job from bookmark ",
        data: usr,
      });
    } else {
      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $push: { savedJobs: jobId },
        },
        { new: true }
      );
      return res.status(200).send({
        success: false,
        message: "Successfully bookmarked job",
        data: usr,
      });
    }
  } catch (error) {
    console.log("ERROR LIKING >>> ", error);
    throw new Error(error);
  }
}

export async function applyJob(req, res) {
  try {
    const { email } = req.params;
    const { job, applicant, jobId } = req.body;
    const { id } = applicant;

    const em = await Job.findOne({ jobId });
    const user = await User.findOne({ id });
    if (!em) {
      return res.status(404).send({ success: false, message: "Job not found" });
    }

    if (em.jobStatus.toLowerCase() !== "accepting") {
      return res
        .status(400)
        .send({ success: false, message: "No longer accepting applications" });
    }

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const application = await new JobApplication({
      job: new ObjectId(req.body?.jobId),
      jobData: req.body?.job,
      jobId: req.body?.jobId,
      applicant: req.body?.applicant,
      resume: req.body?.resume,
      answers: req.body?.answers,
    });

    application.save().then(async (result) => {
      //Save job to user profile
      // console.log("RESF", result?._id);
      // console.log("RESF 2", result?._id?.toString());

      const usr = await User.findOneAndUpdate(
        { email: email },
        {
          $push: {
            myJobApplications: result?._id?.toString(),
            transactions: {
              type: "job_application",
              amount: 200,
              summary: `You applied for a job with the title ${req.body?.job?.jobTitle}`,
              status: "success",
              reference: result?._id?.toString(),
              createdAt: new Date().toISOString(),
            },
          },
          $set: {
            "wallet.balance": user?.wallet?.balance - 200,
            "wallet.prevBalance": user?.wallet?.balance,
            "wallet.updatedAt": new Date().toISOString(),
          },
        },
        {
          new: true,
        }
      );

      const jb = await Job.findOneAndUpdate(
        { _id: req.body?.jobId },
        { $push: { applicants: req.body?.applicant?.id } },
        {
          new: true,
        }
      );

      // console.log("JB LOG .... ", jb);

      global.io.emit("job-application", {
        job: job,
        message: `${req.body?.applicant?.name} just applied`,
      });

      //Now send email here
      sendJobApplicationEmail(
        usr?.email,
        req.body?.job?.jobTitle,
        usr?.bio?.fullname
      )
        .then((val) => {
          sendJobApplicationEmailNotice(
            job?.recruiter?.email,
            req.body?.job?.jobTitle,
            job?.recruiter?.name,
            usr?.bio?.fullname
          )
            .then((resp) => {
              res.status(200).send({
                success: true,
                message: "Your job application was successful",
                data: result,
              });
            })
            .catch((err) => {
              console.log("INNER - ERROR", err);
              return res
                .status(500)
                .send({ success: false, message: error?.message });
            });
        })
        .catch((error) => {
          console.log("ERROR", error);
          return res
            .status(500)
            .send({ success: false, message: error?.message });
        });
    });
  } catch (error) {
    console.log("CATCH - ERROR", error);
    return res.status(500).send({ success: false, message: error?.message });
  }
}

export async function getSavedJobs(req, res) {
  const { email } = req.params;
  try {
    if (!email)
      res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    User.findOne({ email })
      .then((user) => {
        // console.log("STR ARR ", `${user.savedPros}`);
        const stringArray = user.savedJobs.map((objectId) =>
          objectId.toString()
        );
        // console.log("SAVED JOBS  ", user.savedJobs.toString());
        // console.log("STR ARR ", stringArray);

        Job.find({ _id: { $in: stringArray } })
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

export async function getJobApplications(req, res) {
  const { email } = req.params;
  const { jobId, page = 1, limit = 25 } = req.query;
  let query;
  try {
    console.log("JOB ID", jobId);
    if (!email)
      return res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    query = {
      "jobData.id": { $eq: jobId },
    };

    const options = {
      sort: { updatedAt: -1 },
      populate: population,
      page,
      limit,
    };

    const applications = await JobApplication.paginate(query, options);

    return res.status(200).send({
      success: true,
      message: "",
      ...applications,
    });
  } catch (error) {
    console.log("ERR ", error);
    return res.status(500).send({ success: false, message: error?.message });
  }
}

export async function getJobApplicationsByUser(req, res) {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "Account does not exist" });

    // const { userId } = req.query;
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const applications = await JobApplication.aggregate([
      { $match: { "applicant.email": user?.email } },
      // { $sort: { updatedAt: -1 } },
      // pagination
      // { $skip: options.page * options.limit },
      // { $limit: options.limit },
      { $sort: { updatedAt: -1 } },
    ]);

    return res.status(200).send({
      success: true,
      message: "",
      data: applications,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error?.message });
  }
}

export async function acceptJobApplication(req, res) {
  try {
    const { applicationId, jobId } = req.body;

    console.log("APPLICA ID ", applicationId);

    const job = Job.findOne({ jobId });

    if (!job) {
      return res
        .status(404)
        .send({ success: false, message: "Job not found." });
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $set: { status: "accepted" },
      },
      { new: true }
    );

    console.log("APPLICATION DATA LORLO ", application);

    // Trigger socket event
    global.io.emit("job-application-accepted", {
      applicant: application?.applicant,
      message: `Your application for ${application?.jobData?.jobTitle} was accepted`,
    });

    return res.status(200).send({
      success: false,
      message: "Application accepted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: error });
  }
}

export async function getAllApplications(req, res) {
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

    const jobApplications = await JobApplication.paginate(query, options);

    res.status(200).send(jobApplications);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
}

export async function searchJob(req, res) {
  try {
    if (!req.params.key) {
      //Return all jobs by default since nothing is typed yet
      getAllJobs(req, res);
    } else {
      let data = await Job.find({
        $or: [
          { jobType: { $regex: req.params.key } },
          { jobStatus: { $regex: req.params.key } },
          { "jobLocation.country": { $regex: req.params.key } },
          { "jobLocation.city": { $regex: req.params.key } },
          { "jobLocation.state": { $regex: req.params.key } },
          { workplaceType: { $regex: req.params.key } },
          { company: { $regex: req.params.key } },
          { jobTitle: { $regex: req.params.key } },
          { profession: { $regex: req.params.key } },
        ],
      });

      res.status(200).send({
        success: true,
        message: "search success",
        data: data,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
}
