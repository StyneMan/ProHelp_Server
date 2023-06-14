import mongoose from "mongoose";

export const AdminSchema = new mongoose.Schema(
  {
    bio: {
      fullname: {
        type: String,
        default: "",
        required: false,
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
      },
      image: {
        type: String,
        default: "",
      },
    },
    privilege: {
        type: {
            type: String,
            enum: ["admin", "superadmin"],
            trim: true,
        },
        role: {
            type: String,
            enum: ["manager", "developer", "editor", "sales"],
            trim: true,
        },
        access: {
            type: String,
            enum: ["readonly", "read/write", "approve"],
            trim: true,
        }
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
    device: {
      os: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
