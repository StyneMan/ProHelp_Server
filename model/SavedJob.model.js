import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const SavedJobSchema = mongoose.Schema(
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

export default mongoose.model('SavedJob', SavedJobSchema)
