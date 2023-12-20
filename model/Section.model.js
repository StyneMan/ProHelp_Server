import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const SectionSchema = new mongoose.Schema(
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

export default mongoose.model("Section", SectionSchema);
