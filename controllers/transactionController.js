const User = require('../model/User.model.js')
// const Alert from '../model/Alert.model.js'
const Admin = require('../model/Admin.model.js')
const Transaction = require('../model/Transaction.model.js')

const population = {
  path: 'user',
  select: '-password' // Exclude the password field
}

exports.getAllTranactions = async function  (req, res) {
  const { page = 1, limit = 25 } = req.query
  let query

  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ email: req.decoded.userId })

    query = {}

    const options = {
      sort: { updatedAt: -1 },
      populate: population,
      page,
      limit
    }

    const transactions = await Transaction.paginate(query, options)

    return res.status(200).send(transactions)
  } catch (error) {
    return res.status(500).send({ success: false, message: error?.message })
  }
}

exports.getAllUserTransactions = async function  (req, res) {
  const { email } = req.params
  const { page = 1, limit = 25 } = req.query
  let query

  // console.log("JONN APPLICATION BODY ::: ", req?.params);
  try {
    const user = await User.findOne({ email: email })

    if (!user)
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    query = {
      user: { $eq: user?._id }
    }

    const options = {
      sort: { updatedAt: -1 },
      populate: population,
      page,
      limit
    }

    const transactions = await Transaction.paginate(query, options)
    // console.log("TRANSACTIONS RESPONSE HERE  ::::: ", transactions);
    return res.status(200).send(transactions)
  } catch (error) {
    return res.status(500).send({ success: false, message: error?.message })
  }
}
