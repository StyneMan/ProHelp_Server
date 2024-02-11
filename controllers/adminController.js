import Admin from "../model/Admin.model.js";
import Legal from "../model/Legal.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import ENV from "../config.js";
import otpGenerator from "otp-generator";
import { sendVerificationCode } from "./mailer.js";
// import admin from "firebase-admin";
// import serviceAccount from "../middleware/serviceAccKey.json";
import express from "express";
import { sendAdminCredentials } from "./sendEmailLink.js";

let customErr = new Error();

export async function register(req, res) {
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
export async function create (req, res) {
  try {
    console.log("DECODE ADMIN :: ", req.decoded);
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    // Validate request
    if (!Object.values(req.body).length) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded?.username })

    if (!admin) {
      customErr.message = 'You are forbidden!!'
      customErr.code = 403
      throw customErr
    }

    //VALIDATE PRIVILEGE
    if (
      admin.privilege.type.toLowerCase() !== 'superadmin' 
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    const { emailAddress, password } = req.body

    if (!emailAddress && !password) {
      customErr.message = 'provide all required fields'
      customErr.code = 400
      throw customErr
    }

    const hash  = await bcrypt.hash(password, 12)
    // Create & Save admin in the database
    await new Admin({
      ...req.body,
      password: hash,
      "bio.image": 'https://i.imgur.com/2XY0wjW.png',
    }).save()

    // Now email this new admin with neccessary credentials
    await sendAdminCredentials({emailAddress: req.body?.emailAddress, phoneNumber: req.body?.phoneNumber, password: req.body?.password})

    const response = {
      status: true,
      message: 'Admin created successfully!.',
    }
    res.status(200).send(response)
  } catch (error) {
    let errors = {}
    let message = error?.message
    let errorCode

    if (!error?.code || error.code === 11000) {
      errorCode = 500
    } else {
      errorCode = error.code
    }

    if (error.code === 11000) {
      message = `An account has already been created with this ${
        Object.values(error?.keyValue)[0]
      } ${Object.keys(error?.keyValue)[0]}`
    } else {
      if (error?.errors) {
        Object.keys(error.errors).forEach(key => {
          errors[key] = error.errors[key].message
        })
      }
    }

    res.status(errorCode).json(
      message
        ? {
            message: message || 'Some error occurred while creating the User.',
          }
        : errors
    )
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  console.log("PAYLOADS", req.body);
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
              process.env.JWT_SECRET,
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

export async function logout(req, res) {
  app.locals.resetSession = false; // reset session
  return res
    .status(200)
    .send({ success: true, message: "Logged out successfully" });
}

export async function getAdmins(req, res, next) {
  const { email } = req.params;
  try {
    if (!email)
      return res
        .status(500)
        .send({ success: false, message: "Account does not exist" });

    const finder = await Admin.find({ email: { $ne: email } });

    let emptArr = [];

    finder.forEach((element) => {
      const { password, ...rest } = Object.assign({}, element.toJSON());
      emptArr.push(rest);
    });

    res
      .status(200)
      .send({ success: true, message: "Operation successful", data: emptArr });
  } catch (error) {
    console.log("ERROR OCCURED >. ", error);
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}

export async function profile(req, res) {
  try {
    // console.log("LOGGER ", req);
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

export async function otherAdminUpdate (req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    // Validate request
    if (!Object.values(req.body).length || !req.params.id) {
      customErr.message = 'Content can not be empty!'
      customErr.code = 400
      throw customErr
    }

    const admin = await Admin.findOne({ emailAddress: req.decoded?.username })

    //VALIDATE PRIVILEGE
    if (
      admin.privilege?.role !== 'manager' &&
      admin.privilege?.role !== 'developer'
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    if (
      admin.privileg?.role === 'manager' ||
      admin.privilege?.role === 'developer' && admin.privilege.type?.toLowerCase() === 'superadmin'
    ) {
      if (req.body?.password) {
        // Reset password here
        console.log("PASSWORD :: ", req.body?.password);
        const hash = await hashPassword(req.body?.password)

        const update = await Admin.findByIdAndUpdate(req.params.id, {password: hash}, {
          useFindAndModify: false,
          new: true,
        })

        if (!update) {
          customErr.message = 'No admin found to update!'
          customErr.code = 403
          throw customErr
        }

        // Now notify the admin whose password was updated
        await sendAdminCredentials({emailAddress: update?.emailAddress, phoneNumber: update?.phoneNumber, password: req.body?.password})
        const response = {
          status: true,
          data: update,
          message: 'Admin password updated successfully!',
        }
        res.status(200).send(response)
      }
      else {
        const update = await Admin.findByIdAndUpdate(req.params.id, req.body, {
          useFindAndModify: false,
          new: true,
        })
    
        if (!update) {
          customErr.message = 'No admin found to update!'
          customErr.code = 403
          throw customErr
        }
    
        res.send(update)
      }
    }
    
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while updating your admin.',
    })
  }
}

export async function otherAdminsDelete(req, res) {
  try {
    if (!req.decoded) {
      //forbidden
      customErr.message = 'You Are Forbidden!'
      customErr.code = 403
      throw customErr
    }

    const admin = await Admin.findOne({ email: req.decoded?.username })
    //VALIDATE PRIVILEGE
    if (
      admin.privilege.role !== 'manager' &&
      admin.privilege.role !== 'developer' &&
      admin.privilege.type.toLowerCase() !== 'superadmin'
    ) {
      customErr.message = 'Sorry you are not privileged to perform this action!'
      customErr.code = 403
      throw customErr
    }

    await Admin.findByIdAndDelete(req.params.id)

    res.send({
      status: true,
      message: 'Admin deleted',
    })
  } catch (error) {
    res.status(error?.code || 500).send({
      message:
        error?.message || 'Some error occurred while deleting your admin.',
    })
  }
}



