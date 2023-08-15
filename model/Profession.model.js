import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const ProfessionSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    skills: [],
    description: {
      type: String,
    }
  },
  { timestamps: true }
);

ProfessionSchema.plugin(mongoosePaginate);

ProfessionSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Profession", ProfessionSchema);
