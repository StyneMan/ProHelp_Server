import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
// const mongoosePaginate = require("mongoose-paginate-v2");
import mongoosePaginate from "mongoose-paginate-v2";

export const JobApplicationSchema = mongoose.Schema(
  {
    jobId: {
      type: String,
    },
    job: {
      type: Object,
    },
    applicant: {
      name: String,
      id: String,
      photo: String,
      email: String,
      phone: String,
    },
    status: {
      type: String,
      enums: ["accepted", "submitted", "declined"],
      default: "submitted",
    },
    resume: {
      type: String,
    },
    answers: [
      { 
        question: { type: String },
        answer: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

JobApplicationSchema.plugin(mongoosePaginate);

JobApplicationSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("JobApplication", JobApplicationSchema);
