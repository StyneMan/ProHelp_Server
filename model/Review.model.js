const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ReviewSchema = mongoose.Schema(
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

module.exports = mongoose.model('Review', ReviewSchema)
