const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const ProfessionSchema = mongoose.Schema(
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

module.exports = mongoose.model("Profession", ProfessionSchema);
