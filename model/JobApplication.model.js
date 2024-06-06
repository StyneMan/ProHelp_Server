const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const JobApplicationSchema = mongoose.Schema(
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

module.exports = mongoose.model("JobApplication", JobApplicationSchema);
