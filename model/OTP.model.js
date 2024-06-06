const mongoose = require("mongoose");

const OTPSchema = mongoose.Schema(
  {
    user: {
      type: String,
    },
    emailAddress: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  { timestamps: true }
);

// OTPSchema.plugin(mongoosePaginate);

OTPSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("OTP", OTPSchema);
