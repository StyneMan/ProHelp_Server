const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const TransactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enums: ['fund_wallet', 'job_posting', 'job_application', 'connection']
    },
    reference: {
      type: String
    },
    amount: {
      type: Number
    },
    summary: String,
    status: {
      type: String
    }
  },
  { timestamps: true }
)

TransactionSchema.plugin(mongoosePaginate)

TransactionSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

module.exports = mongoose.model('Transaction', TransactionSchema)
