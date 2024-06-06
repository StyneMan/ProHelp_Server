const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const GurantorSchema = mongoose.Schema(
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

module.exports = mongoose.model("Gurantor", GurantorSchema);
