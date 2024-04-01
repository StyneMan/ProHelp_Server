import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const SavedProfessionalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  { timestamps: true }
)

SavedProfessionalSchema.plugin(mongoosePaginate)

SavedProfessionalSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

export default mongoose.model('SavedProfessional', SavedProfessionalSchema)
