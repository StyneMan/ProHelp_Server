const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const FAQSchema = new mongoose.Schema(
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


module.exports = mongoose.model("FAQ", FAQSchema);
