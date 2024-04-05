import User from '../model/User.model.js'
import Alert from '../model/Alert.model.js'
import Admin from '../model/Admin.model.js'
import Transaction from '../model/Transaction.model.js'

const population = {
  path: 'user',
  select: '-password' // Exclude the password field
}

export async function getAllTranactions (req, res) {
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

export async function getAllUserTransactions (req, res) {
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
    console.log("TRANSACTIONS RESPONSE HERE  ::::: ", transactions);
    return res.status(200).send(transactions)
  } catch (error) {
    return res.status(500).send({ success: false, message: error?.message })
  }
}
