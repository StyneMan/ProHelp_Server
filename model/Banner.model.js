const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const BannerSchema = new mongoose.Schema(
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


module.exports = mongoose.model("Banner", BannerSchema);
