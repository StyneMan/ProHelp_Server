import Support from '../model/Support.model.js'
import { v4 } from 'uuid'
import { sendConnectionRequestEmailNotice, sendSupportEmail } from './mailer.js'
import User from '../model/User.model.js'
import Alert from '../model/Alert.model.js'
import Review from '../model/Review.model.js'
import Legal from '../model/Legal.model.js'
import Job from '../model/Job.model.js'
import Admin from '../model/Admin.model.js'
import SavedProfessional from '../model/SavedProfessional.model.js'

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

export async function addSupport (req, res) {
  try {
    const { purpose, message, user } = req.body
    const { email } = user

    const em = await User.findOne({ email }) // check if a user with the same email exists in the database

    if (!em)
      return res.status(404).json({
        success: false,
        message: 'The user does not exist on this platform!'
      })
    //Generate a ticket number
    const ticketId = v4()
    const support = new Support({
      purpose: purpose,
      message: message,
      user: user,
      ticket: ticketId
    })

    // return save result as a response
    support
      .save()
      .then(async result => {
        try {
          await new Alert({
            type: 'profile',
            message: 'New support ticket opened ',
            user: user?.id
          }).save()
          //Now send email here
          return sendSupportEmail(user, ticketId, purpose).then(val => {
            res.status(200).send({
              success: true,
              message: 'Request received! Check your email for your ticket ID '
            })
          })
        } catch (error) {
          return res.status(404).send({ success: false, message: error })
        }
      })
      .catch(error => res.status(500).send({ success: false, message: error }))
  } catch (error) {
    console.log('MERROR ', error)
    return res
      .status(404)
      .send({ success: false, message: 'Authentication error' })
  }
}

export async function getAllProfessionals (req, res) {
  // const { email } = req.params;
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    // console.log('JKDBJHd ', req.user)

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        },
        accountType: {
          $eq: 'professional'
        }
      }
    } else {
      query = {
        accountType: {
          $eq: 'professional'
        }
      }
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit
    }

    const users = await User.paginate(query, options)
    // console.log("PROS :: ", users);
    res.status(200).send(users)
  } catch (error) {
    console.log('ERROR OCCURED >. ', error)
    return res.status(404).send({ error: 'Cannot Find User Data' })
  }
}

function calculateAge (dateOfBirth) {
  // Parse the date of birth into a Date object
  const dob = new Date(dateOfBirth)

  // Get the current date
  const currentDate = new Date()

  // Calculate the difference in milliseconds
  const ageDiff = currentDate - dob

  // Convert the difference to years
  const ageDate = new Date(ageDiff)
  const years = ageDate.getUTCFullYear() - 1970

  return years
}

export async function getAllProfessionalsByProfession (req, res) {
  const { profession } = req.params
  try {
    let query
    const {
      page = 1,
      range,
      limit = 25,
      location,
      skills,
      age,
      maritalStatus
    } = req.query

    // console.log('LOCATION :: ', location)
    // console.log('SKILLS :: ', skills)
    // console.log('AGE:: ', age)
    // console.log('MARITAL STATUS :: ', maritalStatus)

    // console.log("AGE :: ", calculateAge(age));

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        },
        accountType: {
          $eq: 'professional'
        },
        profession: { $eq: profession }
      }
    } else {
      if (location && skills && maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            { 'address.state': { $eq: location } },
            { 'bio.maritalStatus': { $eq: maritalStatus } },
            {
              skills: {
                $elemMatch: {
                  name: { $in: skills }
                }
              }
            }
          ]
        }
      } else if (location && !skills && !maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            { 'address.state': { $eq: location } }
          ]
        }
      } else if (!location && skills && maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            { 'bio.maritalStatus': { $eq: maritalStatus } },
            {
              skills: {
                $elemMatch: {
                  name: { $in: skills }
                }
              }
            }
          ]
        }
      } else if (!location && skills && !maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            {
              skills: {
                $elemMatch: {
                  name: { $in: skills }
                }
              }
            }
          ]
        }
      } else if (!location && !skills && maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            { 'bio.maritalStatus': { $eq: maritalStatus } }
          ]
        }
      } else if (location && !skills && maritalStatus) {
        query = {
          $and: [
            { profession: { $eq: profession } },
            { 'address.state': { $eq: location } },
            { 'bio.maritalStatus': { $eq: maritalStatus } }
          ]
        }
      } else {
        query = {
          profession: { $eq: profession }
        }
        console.log('THIS CASE')
      }
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit
    }

    const users = await User.paginate(query, options)
    // console.log("FOUND USERS :: ", users);
    res.status(200).send(users)
  } catch (error) {
    console.log('ERROR OCCURED >. ', error)
    return res.status(404).send({ error: 'Cannot Find User Data' })
  }
}

export async function getAllRecruiters (req, res) {
  const { email } = req.params
  try {
    if (!email)
      return res
        .status(404)
        .send({ success: false, message: 'User does not exist' })

    User.findOne({ email: email }).then(user => {
      if (user.accountType === 'recruiter') {
        User.find({ accountType: 'recruiter', email: { $ne: email } })
          .then(val => {
            let emptArr = []

            val.forEach(element => {
              const { password, ...rest } = Object.assign({}, element.toJSON())
              emptArr.push(rest)
            })

            res.status(200).send({
              success: true,
              message: 'Operation successful',
              data: emptArr
            })
          })
          .catch(error => {
            console.log('ERROR LOOg >> ', error)
            res.status(500).send({
              success: false,
              message: 'An error occurred'
            })
          })
      } else {
        User.find({ accountType: 'recruiter' })
          .then(val => {
            let emptArr = []

            val.forEach(element => {
              const { password, ...rest } = Object.assign({}, element.toJSON())
              emptArr.push(rest)
            })

            res.status(200).send({
              success: true,
              message: 'Operation successful',
              data: emptArr
            })
          })
          .catch(error => {
            console.log('ERROR LOOg >> ', error)
            res.status(500).send({
              success: false,
              message: 'An error occurred'
            })
          })
      }
    })
  } catch (error) {
    console.log('ERROR OCCURED >. ', error)
    return res
      .status(404)
      .send({ success: false, message: 'Cannot Find User Data' })
  }
}

export async function saveWishlist (req, res) {
  const { guestId, guestName, userId } = req.body
  try {
    if (!userId)
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    console.log('JKJD ::: ', req.body)

    const user = await User.findById(userId)
    const savedPros = await SavedProfessional.findOne({ user: userId })
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: 'Not does not exist' })
    }

    const alreadyAdded = savedPros?.professional?.toString() === guestId
    if (alreadyAdded) {
      await SavedProfessional.findOneAndDelete({
        user: userId,
        professional: guestId
      })

      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { savedPros: guestId }
        },
        { new: true }
      )

      return res.status(200).send({
        success: false,
        message: 'Successfully unliked ' + guestName,
        data: usr
      })
    } else {
      await new SavedProfessional({
        user: userId,
        professional: guestId
      }).save()

      let usr = await User.findByIdAndUpdate(
        userId,
        {
          $push: { savedPros: guestId }
        },
        { new: true }
      )

      return res.status(200).send({
        success: true,
        message: 'Successfully liked ' + guestName,
        data: usr
      })
    }
  } catch (error) {
    console.log('ERROR LIKING >>> ', error)
    throw new Error(error)
  }
}

export async function getLikedUsers (req, res) {
  const { email } = req.params
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    console.log(req.user)

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      }
    } else {
      query = {
        applicant: { $eq: user?._id }
      }
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit
    }

    const savedProfessionals = await SavedProfessional.paginate(query, options)

    res.status(200).send(savedProfessionals)
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error
    })
  }
}

export async function getSavedPros (req, res) {
  const { email } = req.params
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    console.log(req.user)

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      }
    } else {
      query = {
        user: { $eq: req?.user?._id }
      }
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
      populate: population2
    }

    const savedProfessionals = await SavedProfessional.paginate(query, options)

    res.status(200).send(savedProfessionals)
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error
    })
  }
}

export async function searcher (req, res) {
  // const { key } = req.params;
  try {
    let data = await User.find({
      $or: [
        { 'bio.fullname': { $regex: req.params.key } },
        { 'bio.firstname': { $regex: req.params.key } },
        { 'bio.lastname': { $regex: req.params.key } },
        { 'bio.middlename': { $regex: req.params.key } },
        { 'experience.company': { $regex: req.params.key } },
        { 'experience.region': { $regex: req.params.key } },
        { 'experience.country': { $regex: req.params.key } },
        { 'experience.workType': { $regex: req.params.key } },
        { 'experience.role': { $regex: req.params.key } },
        { 'education.school': { $regex: req.params.key } },
        { 'education.degree': { $regex: req.params.key } },
        { 'education.course': { $regex: req.params.key } },
        // { "skills.name": { $regex: req.params.key } },
        { 'address.state': { $regex: req.params.key } },
        { 'address.country': { $regex: req.params.key } },
        { 'address.city': { $regex: req.params.key } },
        { profession: { $regex: req.params.key } },
        { accountType: { $regex: req.params.key } }
      ]
    })

    res.status(200).send({
      success: true,
      message: 'search success',
      data: data
    })
  } catch (error) {
    throw new Error(error)
  }
}

export async function searcherAdvanced (req, res) {
  const { key } = req.params
  const { location } = req.query
  try {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // console.log('LOCATION:: :: ', location)

    if (location) {
      //Add location filtering here
      let data = await User.find({
        $and: [
          {
            $or: [
              {
                'bio.firstname': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'bio.lastname': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'bio.lastname': {
                  $regex: new RegExp(String(req.params.key.split(' ')[1]), 'i')
                }
              },
              {
                'experience.company': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'experience.region': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'experience.country': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'experience.workType': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'experience.role': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'education.school': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'education.degree': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'education.course': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              // {
              //   "skills.name": {
              //     $regex: new RegExp(String(req.params.key), "i"),
              //   },
              // },
              {
                'address.state': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'address.country': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                'address.city': {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              },
              {
                profession: { $regex: new RegExp(String(req.params.key), 'i') }
              }
            ]
          },
          {
            accountType: { $ne: 'recruiter' }
          }
        ],
        $or: [
          { 'address.state': { $regex: new RegExp(String(location), 'i') } },
          { 'address.city': { $regex: new RegExp(String(location), 'i') } },
          { 'address.country': { $regex: new RegExp(String(location), 'i') } }
        ]
      })

      let jobData = await Job.find({
        $and: [
          {
            $or: [
              { company: { $regex: new RegExp(String(req.params.key), 'i') } },
              { jobType: { $regex: new RegExp(String(req.params.key), 'i') } },
              { jobTitle: { $regex: new RegExp(String(req.params.key), 'i') } },
              {
                workplaceType: {
                  $regex: new RegExp(String(req.params.key), 'i')
                }
              }
            ]
          },
          {
            jobStatus: { $eq: 'accepting' }
          }
        ],
        $or: [
          {
            'jobLocation.state': { $regex: new RegExp(String(location), 'i') }
          },
          { 'jobLocation.city': { $regex: new RegExp(String(location), 'i') } },
          {
            'jobLocation.country': {
              $regex: new RegExp(String(location), 'i')
            }
          }
        ]
      })

      const combinedResults = [...data, ...jobData]

      res.status(200).send({
        success: true,
        message: 'search success',
        data: combinedResults
      })
    }
  } catch (error) {
    console.log('ERROR RESPONSE HERE :: ', error)
    throw new Error(error)
  }
}

// export async function searcherAdvanced2 (req, res) {
//   const { key } = req.params
//   const { location } = req.query

//   try {
//     const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//     console.log('LOCATION:: :: ', location)

//     if (location) {
//       let data = await User.find({
//         $or: [
//           { 'bio.firstname': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.company': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.region': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.country': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.workType': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.role': { $regex: escapedKey, $options: 'i' } },
//           { 'education.school': { $regex: escapedKey, $options: 'i' } },
//           { 'education.degree': { $regex: escapedKey, $options: 'i' } },
//           { 'education.course': { $regex: escapedKey, $options: 'i' } },
//           { 'skills.name': { $regex: escapedKey, $options: 'i' } },
//           { 'address.state': { $regex: escapedKey, $options: 'i' } },
//           { 'address.country': { $regex: escapedKey, $options: 'i' } },
//           { 'address.city': { $regex: escapedKey, $options: 'i' } },
//           { profession: { $regex: escapedKey, $options: 'i' } },
//           { accountType: { $regex: escapedKey, $options: 'i' } }
//         ],
//         $or: [
//           { 'address.state': { $regex: new RegExp(location, 'i') } },
//           { 'address.city': { $regex: new RegExp(location, 'i') } }
//         ]
//       })

//       let jobData = await Job.find({
//         $or: [
//           { company: { $regex: escapedKey, $options: 'i' } },
//           { jobType: { $regex: escapedKey, $options: 'i' } },
//           { jobTitle: { $regex: escapedKey, $options: 'i' } },
//           { profession: { $regex: escapedKey, $options: 'i' } },
//           { workplaceType: { $regex: escapedKey, $options: 'i' } }
//         ],
//         $or: [
//           { 'jobLocation.state': { $regex: new RegExp(location, 'i') } },
//           { 'jobLocation.city': { $regex: new RegExp(location, 'i') } }
//         ]
//       })

//       const combinedResults = [...data, ...jobData]

//       console.log('KLL', combinedResults?.length)
//       console.log('D', data?.length)
//       console.log('J', jobData?.length)

//       res.status(200).send({
//         success: true,
//         message: 'search success',
//         data: combinedResults
//       })
//     } else {
//       let data = await User.find({
//         $or: [
//           { 'bio.firstname': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.company': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.region': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.country': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.workType': { $regex: escapedKey, $options: 'i' } },
//           { 'experience.role': { $regex: escapedKey, $options: 'i' } },
//           { 'education.school': { $regex: escapedKey, $options: 'i' } },
//           { 'education.degree': { $regex: escapedKey, $options: 'i' } },
//           { 'education.course': { $regex: escapedKey, $options: 'i' } },
//           { 'skills.name': { $regex: escapedKey, $options: 'i' } },
//           { 'address.state': { $regex: escapedKey, $options: 'i' } },
//           { 'address.country': { $regex: escapedKey, $options: 'i' } },
//           { 'address.city': { $regex: escapedKey, $options: 'i' } },
//           { profession: { $regex: escapedKey, $options: 'i' } },
//           { accountType: { $regex: escapedKey, $options: 'i' } }
//         ]
//       })

//       let jobData = await Job.find({
//         $or: [
//           { company: { $regex: escapedKey, $options: 'i' } },
//           { jobType: { $regex: escapedKey, $options: 'i' } },
//           { jobTitle: { $regex: escapedKey, $options: 'i' } },
//           { profession: { $regex: escapedKey, $options: 'i' } },
//           { workplaceType: { $regex: escapedKey, $options: 'i' } }
//         ]
//       })

//       const combinedResults = [...data, ...jobData]

//       console.log('KLL', combinedResults?.length)
//       console.log('D', data?.length)
//       // console.log('J', jobData?.length)

//       res.status(200).send({
//         success: true,
//         message: 'search success',
//         data: combinedResults
//       })
//     }
//   } catch (error) {
//     console.log('ERROR RESPONSE HERE :: ', error)
//     res.status(500).send({
//       success: false,
//       message: 'An error occurred during the search process'
//     })
//   }
// }

export async function getConnections (req, res) {
  const { email } = req.params
  try {
    if (!email)
      res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    // User.findOne({ email: email })
    //   .then((user) => {
    //     const stringArray = user.connections.map((objectId) =>
    //       objectId.toString()
    //     );

    //     User.find({ _id: { $in: stringArray } })
    //       .then((rs) => {
    //         res
    //           .status(200)
    //           .send({ success: true, message: "Success", data: rs });
    //       })
    //       .catch((error) => console.log("ERR >> ", error));
    //   })
    //   .catch((err) => console.log("ERRORRO >> ", err));
  } catch (error) {
    throw new Error(error)
  }
}

export async function saveReview (req, res) {
  const { reviewer, comment, userId, rating, email, fullname } = req.body
  try {
    // const el = websocket.usersArr.filter((item) => item?.userId === userId);
    // const roomId = el[0]
    // console.log("ELEM SOCKET :: ", websocket.usersArr);
    // console.log("ELEM SOCKET IO GLOBAL SAVE  :: ", global.io);
    const findReviewer = User.findOne({ email })
    if (!findReviewer) {
      return res.status(404).send({
        success: false,
        message: 'User does not exist on our platform'
      })
    }

    const findUser = await User.findOne({ _id: userId })
    if (!findUser) {
      return res.status(404).send({
        success: false,
        message:
          'You are trying to review a user that does not exist on our platform'
      })
    }

    const review = await new Review({
      comment: comment,
      rating: rating,
      reviewer: reviewer,
      userId: userId,
      fullname: fullname
    })

    review
      .save()
      .then(async result => {
        //Recalculate rating for this user
        var ratingsSum = 0
        var ratingsVal = 0

        User.findOne({ _id: userId }).then(async val => {
          let existingReviews = val?.reviews

          existingReviews?.forEach(elem => {
            ratingsSum = ratingsSum + elem?.rating
          })
          let length = existingReviews?.length + 1
          let netSum = ratingsSum + rating
          ratingsVal = netSum / length

          //Now update user's profile
          let usr = await User.findByIdAndUpdate(
            userId,
            {
              $push: {
                reviews: {
                  _id: result._id,
                  reviewer: reviewer.id,
                  rating: rating
                }
              },
              $set: {
                rating: ratingsVal
              }
            },
            { new: true }
          )

          await new Alert({
            type: 'profile',
            message: `You have a new review from ${reviewer?.name}`,
            user: usr?.id
          }).save()

          // remove password and return user's profile
          const { password, ...rest } = Object.assign({}, usr.toJSON())

          global.io.emit('new-review', {
            message: 'Someone just reviewed you',
            data: rest,
            userId: userId
          })

          res.status(200).send({
            success: true,
            message: 'Your review was successful'
          })
        })
      })
      .catch(error => {
        console.log('REVIEW ER R>> ', error)
        return res.status(500).send({ success: false, message: error })
      })
  } catch (error) {
    console.log('REVIEW ERR>> ', error)
    return res.status(500).send({ success: false, message: error })
  }
}

export async function deleteReview (req, res) {
  const { userId, reviewerId, reviewId, rating } = req.body
  const { email } = req.params

  // console.log("ELEM SOCKET ARRAYS :: ", websocket.usersArr);
  // console.log("ELEM SOCKET IO GLOBAL DELETE  :: ", global.io);

  try {
    const findReviewer = User.findOne({ email })
    if (!findReviewer) {
      return res.status(404).send({
        success: false,
        message: 'User does not exist on our platform'
      })
    }

    // console.log("USER DATA <<<>>> ", findReviewer);

    Review.deleteOne({
      _id: reviewId
    }).then(val => {
      var ratingsSum = 0
      var ratingsVal = 0

      // console.log("PAYLOAD", val);

      //Update this users reviews length
      User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            reviews: {
              _id: reviewId,
              reviewer: reviewerId,
              rating: rating
            }
          }
        },
        { new: true }
      )
        .then(async val => {
          let existingReviews = val?.reviews

          existingReviews?.forEach(elem => {
            ratingsSum = ratingsSum + elem?.rating
          })

          let length = existingReviews?.length
          ratingsVal = ratingsSum / length

          // console.log('RATING ', rating)
          // console.log('RATING LENGTH ', length)
          // console.log('RATING SUM ', ratingsSum)
          // console.log('RATING NET VALUE >> ', ratingsVal)

          //Now remove review from user's reviews
          let usr = await User.findByIdAndUpdate(
            userId,
            { $set: { rating: ratingsVal } },
            {
              new: true
            }
          )

          //   // remove password and return user's profile
          const { password, ...rest } = Object.assign({}, usr.toJSON())

          global.io.emit('review-updated', {
            message: 'Someone just updated a review about you',
            data: rest,
            userId: userId
          })

          res.status(200).send({
            success: true,
            message: 'Review successfully deleted'
          })
        })
        .catch(err => {
          console.log('RNOT FOUND I GUESS >> ', err)
          return res.status(404).send({ success: false, message: err })
        })
    })
  } catch (error) {
    console.log('REVIEW DELETE ERR >> ', error?.message)
    return res.status(500).send({ success: false, message: error })
  }
}

export async function replyReview (req, res) {
  const { reviewId, reviewerId, replyBody } = req.body

  try {
    const reviewer = await User.findOne({ _id: reviewerId })
    if (!reviewer) {
      return res.status(404).send({
        success: false,
        message: 'User does not exist on this platform!'
      })
    }

    const review = await Review.findOne({ _id: reviewId })
    if (!review) {
      return res
        .status(404)
        .send({ success: false, message: 'Review does not exist!' })
    }

    let rep = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $set: { reply: replyBody } },
      {
        new: true
      }
    )

    await new Alert({
      type: 'profile',
      message: `${review?.fullnamee} just replied your review`,
      user: review?.userId
    }).save()

    global.io.emit('review-reply', {
      message: `${review?.fullname} just replied your review`,
      userId: review?.userId
    })

    return res.status(200).send({
      success: true,
      message: 'Reply sent successfully',
      data: rep
    })
  } catch (error) {
    console.log('REVIEW REPLY ERROR >> ', error)
    return res.status(500).send({ success: false, message: error })
  }
}

export async function getReviewsByUser (req, res) {
  try {
    const { userId } = req.query
    const { email } = req.params

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User does not exist on our platform!'
      })
    }

    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25
    }

    const reviews = await Review.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },

      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } }
    ])

    return res.status(200).send({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.log('REVIEW ERR>> ', error)
    return res.status(500).send({ success: false, message: error })
  }
}

export async function topUpWallet (req, res) {
  try {
    const { userId, amount, value, reference, type, summary, status } = req.body
    const { email } = req.params
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' })
    }

    //Create a new transaction
    let usr = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          transactions: {
            type: type,
            reference: reference,
            createdAt: new Date().toISOString(),
            amount: amount,
            summary: summary,
            status: status
          }
        },
        $set: {
          wallet: {
            balance: user.wallet.balance + value,
            prevBalance: user.wallet.balance,
            updatedAt: new Date().toISOString()
          }
        }
      },
      { new: true }
    )

    await new Alert({
      type: 'wallet',
      message: `You have successfully funded your wallet`,
      user: usr?.id
    }).save()

    return res
      .status(200)
      .send({ success: true, message: 'Wallet topup successful', data: usr })
  } catch (error) {
    console.log('REVIEW ERR>> ', error)
    return res.status(500).send({ success: false, message: error })
  }
}

export async function getSupports (req, res) {
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      }
    } else {
      query = {}
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit
    }

    const supports = await Support.paginate(query, options)

    res.status(200).send(supports)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.'
    })
  }
}

export async function getAlerts (req, res) {
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      }
    } else {
      query = {}
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
      populate: population
    }

    const alerts = await Alert.paginate(query, options)

    res.status(200).send(alerts)
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while fetching loan.'
    })
  }
}

export async function getLegal (req, res) {
  try {
    let query
    const { page = 1, range, limit = 25 } = req.query

    if (range === 'recent') {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      }
    } else {
      query = {}
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit
    }

    const legal = await Legal.paginate(query, options)
    res.status(200).send(legal)
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || 'Some error occurred while retrieving data.'
    })
  }
}

export async function closeSupport (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ email: req.decoded.userId })
    const support = await Support.findOne({ _id: req.params?.id })

    if (!support) {
      customErr.message = 'Support not found'
      customErr.code = 404
      throw customErr
    }
    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== 'manager' &&
      admin.privilege.role !== 'developer' &&
      admin.privilege.access !== 'read/write'
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    // Update support here
    const updateSupport = await Support.findOneAndUpdate(
      { _id: req.params?.id },
      { status: 'closed' },
      {
        new: true
      }
    )

    res.send({
      message: 'Support ticket successfully closed',
      data: updateSupport
    })
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        'Some error occurred while creating loan.'
    })
  }
}

export async function addSkill (req, res) {
  try {
    const { purpose, message, user } = req.body
    const { email } = user

    const em = await User.findOne({ email }) // check if a user with the same email exists in the database

    if (!em)
      return res.status(404).json({
        success: false,
        message: 'The user does not exist on this platform!'
      })
    //Generate a ticket number
    const ticketId = v4()
    const support = new Support({
      purpose: purpose,
      message: message,
      user: user,
      ticket: ticketId
    })

    // return save result as a response
    support
      .save()
      .then(async result => {
        try {
          await new Alert({
            type: 'profile',
            message: 'New support ticket opened ',
            user: user?.id
          }).save()
          //Now send email here
          return sendSupportEmail(user, ticketId, purpose).then(val => {
            res.status(200).send({
              success: true,
              message: 'Request received! Check your email for your ticket ID '
            })
          })
        } catch (error) {
          return res.status(404).send({ success: false, message: error })
        }
      })
      .catch(error => res.status(500).send({ success: false, message: error }))
  } catch (error) {
    console.log('MERROR ', error)
    return res
      .status(404)
      .send({ success: false, message: 'Authentication error' })
  }
}

