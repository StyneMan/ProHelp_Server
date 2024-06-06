const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const SavedJobSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
  },
  { timestamps: true }
)

SavedJobSchema.plugin(mongoosePaginate)

SavedJobSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('SavedJob', SavedJobSchema)
