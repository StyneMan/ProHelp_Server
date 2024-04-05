import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const ConnectionSchema = mongoose.Schema(
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

export default mongoose.model('Connection', ConnectionSchema)
