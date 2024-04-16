import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const GurantorSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

GurantorSchema.plugin(mongoosePaginate);

GurantorSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Gurantor", GurantorSchema);
