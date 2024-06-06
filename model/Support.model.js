const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const SupportSchema = mongoose.Schema(
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

module.exports = mongoose.model("Support", SupportSchema);
