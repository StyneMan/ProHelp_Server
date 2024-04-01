import mongoose from 'mongoose'

export const ReviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number
    },
    comment: {
      type: String,
      required: false
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reply: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model('Review', ReviewSchema)
