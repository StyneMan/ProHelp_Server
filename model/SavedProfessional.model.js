const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const SavedProfessionalSchema = mongoose.Schema(
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

module.exports = mongoose.model('SavedProfessional', SavedProfessionalSchema)
