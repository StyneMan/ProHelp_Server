import Support from '../model/Support.model.js'
import { v4 } from 'uuid'
import { sendConnectionRequestEmailNotice, sendSupportEmail } from './mailer.js'
import User from '../model/User.model.js'
import Alert from '../model/Alert.model.js'
import ReportedUser from '../model/ReportedUser.model.js'
import BlockedUser from '../model/BlockedUser.model.js'
import Admin from '../model/Admin.model.js'

const population = {
  path: 'user',
  select: '-password' // Exclude the password field
}

const population2 = [
  {
    path: 'user',
    select: '-password' // Exclude the password field
  },
  {
    path: 'professional',
    select: '-password' // Exclude the password field
  }
]

/** middleware for verify user */
export async function verifyUser (req, res, next) {
  try {
    const { email } = req.method == 'GET' ? req.query : req.body

    // check the user existance
    let exist = await User.findOne({ email })
    if (!exist)
      return res
        .status(404)
        .send({ success: false, message: 'Can not find user!' })
    next()
  } catch (error) {
    console.log('MERROR ', error)
    return res
      .status(404)
      .send({ success: false, message: 'Authentication error' })
  }
}

export async function reportUser (req, res) {
  try {
    const { userId, reason } = req.body
    const { email } = req.params

    const em = await User.findOne({ email })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    const user = await User.findOne({ _id: userId })
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: 'User account not found' })
    }

    await new ReportedUser({
      blockedBy: em?.id,
      reportee: userId,
      reason: reason
    }).save()

    await new Alert({
      type: 'connection',
      message: `You reported ${user?.bio?.firstname}  ${user?.bio?.lastname}'s account to admin management`,
      user: em?.id
    }).save()
  } catch (error) {
    console.log('REPORTING ERR:: ', error)
    return res.status(500).send(error)
  }
}

export async function blockUser (req, res) {
  try {
    const { userId } = req.body
    const { email } = req.params

    const em = await User.findOne({ email })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    const user = await User.findOne({ _id: userId })
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: 'User account not found' })
    }

    await new BlockedUser({
      blockedBy: em?.id,
      user: userId
    }).save()

    await User.findByIdAndUpdate(
      em?.id,
      {
        $push: {
          blockedUsers: userId
        }
      },
      {
        new: true
      }
    );

    await new Alert({
      type: 'connection',
      message: `You reported ${user?.bio?.firstname}  ${user?.bio?.lastname}'s account to admin management`,
      user: em?.id
    }).save()
  } catch (error) {}
}


