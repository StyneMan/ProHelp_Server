const Admin = require("../model/Admin.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendAdminCredentials } = require("./sendEmailLink.js");
const User = require("../model/User.model.js");

let customErr = new Error();

exports.register = async (req, res) => {
  try {
    const { password, email, bio, device, privilege } = req.body;

    const em = await Admin.findOne({ email }); // check if a admin with the same email exists in the database

    if (em)
      return res.status(400).json({
        success: false,
        message: "The email is already associated to an account.",
      });

    if (password) {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const admin = new Admin({
            password: hashedPassword,
            email,
            device,
            bio,
            privilege,
          });

          // return save result as a response
          admin
            .save()
            .then(async (result) => {
              //Now send email here
              res.status(200).send({
                success: true,
                message: "Admin account created successfully. ",
                data: result,
              });
            })
            .catch((error) =>
              res.status(500).send({ success: false, message: error })
            );
        })
        .catch((error) => {
          return res.status(500).send({
            success: false,
            message: error,
          });
        });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
}

// Create admin
exports.create = async function (req, res) {
  try {
    // console.log("DECODE ADMIN :: ", req.decoded);
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    // Validate request
    if (!Object.values(req.body).length) {
      customErr.message = "Content can not be empty!";
      customErr.code = 400;
      throw customErr;
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded?.username });

    if (!admin) {
      customErr.message = "You are forbidden!!";
      customErr.code = 403;
      throw customErr;
    }

    //VALIDATE PRIVILEGE
    if (admin.privilege.type.toLowerCase() !== "superadmin") {
      customErr.message =
        "Sorry you are not privileged to perform this action!";
      customErr.code = 403;
      throw customErr;
    }

    const { email, password } = req.body;

    if (!email && !password) {
      customErr.message = "provide all required fields";
      customErr.code = 400;
      throw customErr;
    }

    const hash = await bcrypt.hash(password, 12);
    // Create & Save admin in the database
    await new Admin({
      ...req.body,
      password: hash,
      "bio.image": "https://i.imgur.com/2XY0wjW.png",
    }).save();

    // Now email this new admin with neccessary credentials
    await sendAdminCredentials({
      email: req.body?.email,
      phone: req.body?.phone,
      password: req.body?.password,
    });

    const response = {
      status: true,
      message: "Admin created successfully!.",
    };
    res.status(200).send(response);
  } catch (error) {
    let errors = {};
    let message = error?.message;
    let errorCode;

    if (!error?.code || error.code === 11000) {
      errorCode = 500;
    } else {
      errorCode = error.code;
    }

    if (error.code === 11000) {
      message = `An account has already been created with this ${
        Object.values(error?.keyValue)[0]
      } ${Object.keys(error?.keyValue)[0]}`;
    } else {
      if (error?.errors) {
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });
      }
    }

    res.status(errorCode).json(
      message
        ? {
            message: message || "Some error occurred while creating the User.",
          }
        : errors
    );
  }
}

exports.login = async function (req, res) {
  const { email, password } = req.body;
  // console.log("PAYLOADS", req.body);
  try {
    Admin.findOne({ email })
      .then((admin) => {
        bcrypt
          .compare(password, admin.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({
                success: false,
                message: "Incorrect credentials. Try again.",
              });

            // create jwt token
            const token = jwt.sign(
              {
                userId: admin._id,
                username: admin.email,
              },
              process.env.JWT_SECRET ?? '2148286a112343a0c679e483234c01752481398ec876c7137ed5a6be1156d185098c9df6d1610d017d773f8feb8aaaeb5357e436495fdfce5def944a1fb0de3b' , 
              { expiresIn: "24h" }
            );

            const { password, ...rest } = Object.assign({}, admin.toJSON());

            return res.status(200).send({
              message: "You have successfully logged in",
              success: true,
              token,
              data: rest,
            });
          })
          .catch((error) => {
            return res.status(400).send({
              success: false,
              message: "Incorrect user credentials. Try again.",
            });
          });
      })
      .catch((error) => {
        return res.status(404).send({
          success: false,
          message: "Account does not exist. Try again",
        });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

exports.logout = async function (req, res) {
  // app.locals.resetSession = false; // reset session
  return res
    .status(200)
    .send({ success: true, message: "Logged out successfully" });
}

exports.getAdmins = async function (req, res, next) {
  const { email } = req.params;
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded?.username });

    // console.log("ADMIN DATA HE--- ", admin);

    const result = await Admin.find({
      _id: { $nin: [admin?._id] },
    })
      // .populate(population)
      .sort({ createdAt: -1 });

    // console.log("RESULT ::: ", result);

    res.send(result);
  } catch (error) {
    console.log("ERROR OCCURED >. ", error);
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}

exports.profile = async function (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No user found!";
      customErr.code = 404;
      throw customErr;
    }

    const { password, ...rest } = Object.assign({}, admin.toJSON());

    res.send(rest);

    //populate data
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || "Some error occurred while retrieving data.",
    });
  }
}

exports.otherAdminUpdate = async function (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    // Validate request
    if (!Object.values(req.body).length || !req.params.id) {
      customErr.message = "Content can not be empty!";
      customErr.code = 400;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded?.username });

    //VALIDATE PRIVILEGE
    if (
      admin.privilege?.role !== "manager" &&
      admin.privilege?.role !== "developer"
    ) {
      customErr.message =
        "Sorry you are not privileged to perform this action!";
      customErr.code = 403;
      throw customErr;
    }

    if (
      admin.privileg?.role === "manager" ||
      (admin.privilege?.role === "developer" &&
        admin.privilege.type?.toLowerCase() === "superadmin")
    ) {
      if (req.body?.password) {
        // Reset password here
        const hash = await bcrypt.hash(req.body?.password, 12);

        const update = await Admin.findByIdAndUpdate(
          req.params.id,
          { password: hash },
          {
            useFindAndModify: false,
            new: true,
          }
        );

        if (!update) {
          customErr.message = "No admin found to update!";
          customErr.code = 404;
          throw customErr;
        }

        // Now notify the admin whose password was updated
        await sendAdminCredentials({
          email: update?.email,
          phone: update?.bio?.phone,
          password: "Newly updated password is " + req.body?.password,
        });
        const response = {
          status: true,
          data: update,
          message: "Admin password updated successfully!",
        };
        res.status(200).send(response);
      } else {
        const update = await Admin.findByIdAndUpdate(req.params.id, req.body, {
          useFindAndModify: false,
          new: true,
        });

        if (!update) {
          customErr.message = "No admin found to update!";
          customErr.code = 403;
          throw customErr;
        }

        res.send(update);
      }
    }
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || "Some error occurred while updating your admin.",
    });
  }
}

exports.otherAdminsDelete = async function (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded?.username });
    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== "manager" &&
      admin.privilege.role !== "developer" &&
      admin.privilege.type.toLowerCase() !== "superadmin"
    ) {
      customErr.message =
        "Sorry you are not privileged to perform this action!";
      customErr.code = 403;
      throw customErr;
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.send({
      status: true,
      message: "Admin deleted",
    });
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || "Some error occurred while deleting your admin.",
    });
  }
}

exports.updateProfile = async function (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded?.username });
    //VALIDATE PRIVILEGE
    if (!admin) {
      customErr.message = "Admin to update not found";
      customErr.code = 404;
      throw customErr;
    }

    let payload = req.body;

    if (payload?.password) {
      // Hash the password here
      const hashedPassword = await bcrypt
      .hash(payload?.password, 10);

      const updated = await Admin.findOneAndUpdate(
        { email: req.decoded?.username },
        { ...payload, password: hashedPassword},
        {
          new: true,
        }
      );
  
      if (!updated) {
        customErr.message = `Failed to update profile!`;
        customErr.code = 403;
        throw customErr;
      }
  
      res.send(updated);
    }
    else {
      const updated = await Admin.findOneAndUpdate(
        { email: req.decoded?.username },
        payload,
        {
          new: true,
        }
      );
  
      if (!updated) {
        customErr.message = `Failed to update profile!`;
        customErr.code = 403;
        throw customErr;
      }
  
      res.send(updated);
    }

   
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      message:
        error?.message || "Some error occurred while updating your profile.",
    });
  }
}

// Update General User Account
exports.updateUser = async function (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = "You Are Forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded?.username });
    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== "manager" &&
      admin.privilege.role !== "developer" &&
      admin.privilege.access.toLowerCase() !== "read/write"
    ) {
      customErr.message =
        "Sorry you are not privileged to perform this action!";
      customErr.code = 403;
      throw customErr;
    }

    let payload = req.body;

    const updated = await User.findOneAndUpdate(
      { email: req.body.email },
      payload,
      {
        new: true,
      }
    );

    if (!updated) {
      customErr.message = `Cannot update User with this email (${req.body.email})!`;
      customErr.code = 404;
      throw customErr;
    }

    res.send(updated);
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      message:
        error?.message || "Some error occurred while updating your profile.",
    });
  }
}

// module.exports = {
//   register,
// .login,
// };