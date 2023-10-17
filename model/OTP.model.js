import mongoose from "mongoose";
// import mongoosePaginate from "mongoose-paginate-v2";

export const OTPSchema = mongoose.Schema(
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

export default mongoose.model("OTP", OTPSchema);
