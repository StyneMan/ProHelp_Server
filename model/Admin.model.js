const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema(
  {
    bio: {
      firstname: {
        type: String,
        default: '',
        required: false
      },
      lastname: {
        type: String,
        default: '',
        required: false
      },
      middlename: {
        type: String,
        default: '',
        required: false
      },
      phone: {
        type: String,
        default: '',
        required: false
      },
      gender: {
        type: String,
        default: 'Male',
        required: false
      },
      image: {
        type: String,
        default: ''
      }
    },
    accountStatus: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    privilege: {
      type: {
        type: String,
        enum: ['admin', 'superadmin'],
        trim: true
      },
      role: {
        type: String,
        enum: ['manager', 'developer', 'editor'],
        trim: true
      },
      access: {
        type: String,
        enum: ['readonly', 'read/write'],
        trim: true
      }
    },
    password: {
      type: String,
      required: [true, 'Please provide a password']
    },
    email: {
      type: String,
      required: [true, 'Please provide a unique email'],
      unique: true
    },
    device: {
      os: String
    }
  },
  { timestamps: true }
)

AdminSchema.method('toJSON', function () {
  const { _id, ...object } = this.toObject()
  object.id = _id
  return object
})

AdminSchema.virtual('fullname').get(function () {
  return this.firstname + ' ' + this.lastname
})

exports.AdminSchema;
module.exports = mongoose.model('Admin', AdminSchema)
