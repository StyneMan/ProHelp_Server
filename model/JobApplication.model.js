import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2";

export const JobApplicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }, 
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  { timestamps: true,  versionKey: false, }
);

JobApplicationSchema.plugin(mongoosePaginate);

JobApplicationSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("JobApplication", JobApplicationSchema);
