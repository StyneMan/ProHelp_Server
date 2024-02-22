import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String, 
    },
    description: {
      type: String,
    },
    featuredImage: {
      type: String,
    },
    page: {
      type: String,
      enums: ["home", "explore", "faq"],
    },
  },
  { timestamps: true,  versionKey: false, }
);

BannerSchema.plugin(mongoosePaginate);

BannerSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});


export default mongoose.model("Banner", BannerSchema);
