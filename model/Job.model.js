import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const JobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
    },
    profession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profession",
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

JobSchema.plugin(mongoosePaginate);

JobSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Job", JobSchema);
