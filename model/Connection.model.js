const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ConnectionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'disconnected'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

ConnectionSchema.plugin(mongoosePaginate)

ConnectionSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('Connection', ConnectionSchema)
