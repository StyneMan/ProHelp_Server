import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const SupportSchema = mongoose.Schema(
  {
    purpose: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      fullname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      id: {
        type: String,
        required: true,
      },
      image: { type: String, required: false },
    },
    ticket: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    }
  },
  { timestamps: true }
);

SupportSchema.plugin(mongoosePaginate);

SupportSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Support", SupportSchema);
