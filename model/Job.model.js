import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
// const mongoosePaginate = require("mongoose-paginate-v2");
import mongoosePaginate from "mongoose-paginate-v2";

export const JobSchema = mongoose.Schema(
  {
    jobTitle: {
      type: String,
    },
    professoin: {
      type: String,
    },
    company: {
      type: String,
    },
    workplaceType: {
      type: String,
      enums: ["on-site", "remote", "hybrid"],
    },
    jobLocation: {
      state: String,
      city: String,
      country: String,
    },
    screeningQuestions: [],
    requirements: [],
    jobType: {
      type: String,
      enums: ["full-time", "part-time", "contract", "volunteer"],
    },
    minimumQualification: {
      type: String,
    },
    description: {
      type: String,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    jobStatus: {
      type: String,
      enums: ["accepting", "closed", "suspended"],
      default: "accepting",
    },
    recruiter: {
      id: String,
      name: String,
      photo: String,
      email: String,
    },
  },
  { timestamps: true }
);

JobSchema.plugin(mongoosePaginate);

JobSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Job", JobSchema);
