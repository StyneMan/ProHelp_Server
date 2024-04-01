import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const PortfolioSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
    assets: [
      {
        type: String,
        required: false
      }
    ]
  },
  { timestamps: true }
)

PortfolioSchema.plugin(mongoosePaginate)

PortfolioSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

export default mongoose.model('Portfolio', PortfolioSchema)
