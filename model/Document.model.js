const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const DocumentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
    extension: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)

DocumentSchema.plugin(mongoosePaginate)

DocumentSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('Document', DocumentSchema)
