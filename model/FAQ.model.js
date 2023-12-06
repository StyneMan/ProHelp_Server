import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String, 
    },
    answer: {
      type: String,
    },
  },
  { timestamps: true,  versionKey: false, }
);

FAQSchema.plugin(mongoosePaginate);

FAQSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});


export default mongoose.model("FAQ", FAQSchema);
