const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const ReportedUserSchema = mongoose.Schema(
  {
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    },
    reportee: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    },
    reason: {
      type: String,
    }
  },
  { timestamps: true }
);

ReportedUserSchema.plugin(mongoosePaginate);

ReportedUserSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("ReportedUser", ReportedUserSchema);
