const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const LegalSchema = mongoose.Schema(
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

module.exports = mongoose.model("Legal", LegalSchema);
