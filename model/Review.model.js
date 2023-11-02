import mongoose from "mongoose";

export const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
    },
    comment: {
      type: String,
      required: false,
    },
    reviewer: {
      name: String,
      id: String,
      photo: String,
      email: String,
    },
    reply: {
      message: String,
      createdAt: String,
    },
    userId: String,
    fullname: String,
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
