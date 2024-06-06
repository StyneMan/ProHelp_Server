const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PortfolioSchema = mongoose.Schema(
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

module.exports = mongoose.model('Portfolio', PortfolioSchema)
