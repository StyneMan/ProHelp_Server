const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const BlockedUserSchema = mongoose.Schema(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  { timestamps: true }
)

BlockedUserSchema.plugin(mongoosePaginate)

BlockedUserSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('BlockedUser', BlockedUserSchema)
