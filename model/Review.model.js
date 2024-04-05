import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

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
      type: String,
    }
  },
  { timestamps: true } 
)

ReviewSchema.plugin(mongoosePaginate)

export default mongoose.model('Review', ReviewSchema)
