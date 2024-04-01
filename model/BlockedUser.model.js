import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const BlockedUserSchema = mongoose.Schema(
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

export default mongoose.model('BlockedUser', BlockedUserSchema)
