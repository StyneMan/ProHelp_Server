const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    excerpt: {
        type: String,
      },
    content: {
      type: String,
    },
    featuredAsset: {
      type: String,
    },
    page: {
      type: String,
      require: true,
      enums: ["home", "explore", "faq"],
    },
    template: {
      type: String,
      enums: ["oxygen", "full-flex", "testimonial", "call to action"],
    },
    testimonials: [
        {
            name: String,
            image: String,
            message: String,
        }
    ],

  },
  { timestamps: true, versionKey: false }
);

SectionSchema.plugin(mongoosePaginate);

SectionSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Section", SectionSchema);
