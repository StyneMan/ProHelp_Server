import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const UserSchema = new mongoose.Schema(
  {
    bio: {
      middlename: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      firstname: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      lastname: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      phone: {
        type: String,
        default: "",
        required: false,
        
      },
      gender: {
        type: String,
        default: "Male",
        required: false,
        lowercase: true,
      },
      maritalStatus: {
        type: String,
        enums: ["single", "married", "divorced", "widowed"],
        lowercase: true,
      },
      dob: {
        type: String,
        default: "",
        required: false,
      },
      nin: {
        type: String, 
        required: false,
        default: "",
      },
      about: {
        type: String,
        default: "",
      },
      image: {
        type: String,
        default: "",
      },
      idcard: {
        frontview: {
          type: String,
        },
        backview: {
          type: String,
        },
        idType: {
          type: String,
          enums: ["national_id", "voters_card", "drivers_licence", "international_passport"]
        },
      }
    },
    address: {
      street: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      city: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      state: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      country: {
        type: String,
        default: "",
        required: false,
        lowercase: true,
      },
      zipCode: {
        type: String,
        default: "",
        required: false,
      },
    },
    wallet: {
      balance: {
        type: Number,
        default: 1000,
      },
      updatedAt: {
        type: String,
        default: "01/01/1900"
      },
      prevBalance: {
        type: Number,
        default: 0,
      },
    },
    transactions: [
      {
        type: {
          type: String,
          enums: [
            "fund_wallet",
            "job_posting",
            "job_application",
            "connection",
          ],
        },
        reference: {
          type: String,
        },
        createdAt: {
          type: String,
        },
        amount: {
          type: Number,
        },
        summary: String,
        status: {
          type: String,
        },
      },
    ],
    jobsPostingPlan: {
      plan: {
        type: String,
        enum: ["1k per job", "free posting"],
        default: "free posting",
      },
      totalPosted: {
        type: Number,
        default: 0,
      },
      availableSlots: {
        type: Number,
      },
      amountSpent: {
        type: Number,
      },
      paidOn: {
        type: String,
      },
      updatedAt: {
        type: String,
      },
    },
    profession: {
      type: String,
      default: "",
      required: false,
      lowercase: true,
    },
    experienceYears: {
      type: String,
      default: "",
      required: false,
    },
    languagesSpoken: [],
    languagesWriteSpeak: [],
    disability: {
      type: String,
      default: "none",
      enum: ['none', "deaf", "dumb", "blind", "crippled"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    email: {
      type: String,
      required: [true, "Please provide a unique email"],
      unique: true,
    },
    authType: {
      type: String,
      required: [true, "Please provide a authentication type"],
      default: "regular",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    guarantor: {
      name: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      relationship: {
        type: String,
        required: false,
      },
    },
    hasProfile: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        title: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
        extension: {
          type: String,
          required: false,
        },
      },
    ],
    experience: [
      {
        company: {
          type: String,
          required: false,
          lowercase: true,
        },
        companyLogo: {
          type: String,
          required: false,
        },
        role: {
          type: String,
          required: false,
          lowercase: true,
        },
        region: {
          type: String,
          required: false,
          lowercase: true,
        },
        country: {
          type: String,
          required: false,
          lowercase: true,
        },
        workType: {
          type: String,
          required: false,
          lowercase: true,
        },
        startDate: {
          type: String,
          required: false,
        },
        endate: {
          type: String,
          required: false,
        },
        stillHere: {
          type: Boolean,
          default: false,
        },
      },
    ],
    education: [
      {
        school: {
          type: String,
          required: false,
          lowercase: true,
        },
        degree: {
          type: String,
          required: false,
          lowercase: true,
        },
        course: {
          type: String,
          required: false,
          lowercase: true,
        },
        schoolLogo: {
          type: String,
          required: false,
        },
        endate: {
          type: String,
          required: false,
        },
        stillSchooling: {
          type: Boolean,
          default: false,
        },
      },
    ],
    portfolio: [
      {
        name: {
          type: String,
          required: false,
        },
        description: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
        assets: [
          {
            type: String,
            required: false,
          },
        ],
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedPros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hiredPros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    myJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    jobCount: {
      type: Number,
      default: 0,
    },
    myJobApplications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    accountType: { type: String, default: "professional" },
    reviews: [
      {
        reviewId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
        },
      },
    ],
    rating: {
      type: Number,
    },
    skills: [
      {
        name: {
          type: String,
          required: false,
          lowercase: true,
        },
        proficiency: {
          type: String,
          required: false,
        },
      },
    ],
    accountStatus: {
      type: String,
      enum: ['active', 'frozen'],
      default: 'active',
    },
  },
  { timestamps: true }
);

UserSchema.plugin(mongoosePaginate);

UserSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

UserSchema.virtual("bio.fullname").get(function () {
  return this.bio.firstname + " " + this.bio.lastname;
});

export default mongoose.model("User", UserSchema);
