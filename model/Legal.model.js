import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const LegalSchema = mongoose.Schema(
  {
    privacy: {
      type: String,
    },
    cookies: {
      type: String,
    },
    terms: {
      type: String,
    },
  },
  { timestamps: true }
);

LegalSchema.plugin(mongoosePaginate);

LegalSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Legal", LegalSchema);
