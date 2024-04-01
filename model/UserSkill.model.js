import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const UserSkillSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: false,
      lowercase: true
    },
    proficiency: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
)

UserSkillSchema.plugin(mongoosePaginate)

UserSkillSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

export default mongoose.model('UserSkill', UserSkillSchema)
