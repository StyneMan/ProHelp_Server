const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const AlertSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enums: ["auth", "wallet", "job", "connection", "profile"], 
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

AlertSchema.plugin(mongoosePaginate);
AlertSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Alert", AlertSchema);
