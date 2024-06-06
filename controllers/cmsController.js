const Admin = require("../model/Admin.model.js");
const Legal = require("../model/Legal.model.js");
const Banner = require("../model/Banner.model.js");
const Section = require("../model/Section.model.js");
const FAQ = require("../model/FAQ.model.js");

exports.setPrivacyPolicy = async function (req, res) {
  try {
    let { privacy, id } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    if (!id) {
      const lega = new Legal({
        privacy: privacy,
        terms: "",
        cookies: "",
      });

      lega
        .save()
        .then(async (result) => {
          res.status(200).send({
            success: true,
            message: "Privacy policy set successfully",
            data: result,
          });
        })
        .catch((error) => {
          console.log("ERZX", error);
          res.status(500).send({ success: false, message: error });
        });
    } else {
      const legal = await Legal.findById({ _id: id });

      if (!legal) {
        //Create new here
        const lega = new Legal({
          privacy: privacy,
          terms: "",
          cookies: "",
        });

        lega
          .save()
          .then(async (result) => {
            res.status(200).send({
              success: true,
              message: "Privacy policy set successfully",
              data: result,
            });
          })
          .catch((error) =>
            res.status(500).send({ success: false, message: error })
          );
      } else {
        let updateLegal = await Legal.findByIdAndUpdate(
          id,
          {
            $set: {
              privacy: privacy,
            },
          },
          { new: true }
        );

        return res.status(200).send({
          success: true,
          message: "Privacy policy set successfully",
          data: updateLegal,
        });
      }
    }
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

exports.setCookiePolicy = async function () {}

exports.setTermsOfUse = async function (req, res) {
  try {
    let { terms, id } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    if (!id) {
      const lega = new Legal({
        privacy: "",
        terms: terms,
        cookies: "",
      });

      lega
        .save()
        .then(async (result) => {
          res.status(200).send({
            success: true,
            message: "Terms of service set successfully",
            data: result,
          });
        })
        .catch((error) => {
          console.log("ERZX", error);
          res.status(500).send({ success: false, message: error });
        });
    } else {
      const legal = await Legal.findById({ _id: id });

      if (!legal) {
        //Create new here
        const lega = new Legal({
          privacy: "",
          terms: terms,
          cookies: "",
        });

        lega
          .save()
          .then(async (result) => {
            res.status(200).send({
              success: true,
              message: "Terms of service set successfully",
              data: result,
            });
          })
          .catch((error) =>
            res.status(500).send({ success: false, message: error })
          );
      } else {
        let updateLegal = await Legal.findByIdAndUpdate(
          id,
          {
            $set: {
              terms: terms,
            },
          },
          { new: true }
        );

        return res.status(200).send({
          success: true,
          message: "Terms of service updated successfully",
          data: updateLegal,
        });
      }
    }
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

exports.addBanner = async function (req, res) {
  try {
    // let { terms,  } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    // console.log("TRIGGERED!!!");

    const admin = await Admin.findOne({ email: req.decoded?.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    const banner = new Banner({
      ...req.body,
    });

    banner
      .save()
      .then((result) => {
        res.status(200).send({
          success: true,
          message: "New banner added successfully",
          data: result,
        });
      })
      .catch((error) => {
        console.log("ADD BANNER ERROR", error);
        res.status(500).send({ success: false, message: error });
      });
  } catch (error) {
    console.log("ERRO ", error);
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
    // res.status(500).send(error)
  }
}

exports.allBanners = async function (req, res) {
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      query = {};
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const banners = await Banner.paginate(query, options);

    res.status(200).send(banners);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
}

exports.updateBanner = async function (req, res) {
  try {
    const payload = req.body;
    const { bannerId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const banner = Banner.findOne({ _id: bannerId });

    if (!banner) {
      return res
        .status(404)
        .send({ success: false, message: "Banner not found." });
    }

    let bannr = await Banner.findByIdAndUpdate(
      bannerId,
      {
        $set: payload,
      },
      { new: true }
    );
    return res.status(200).send({
      success: false,
      message: "Successfully updated banner",
      data: bannr,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

exports.deleteBanner = async function (req, res) {
  try {
    const { bannerId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const banner = Banner.findOne({ _id: bannerId });

    if (!banner) {
      return res
        .status(404)
        .send({ success: false, message: "Banner not found." });
    }
    const delBanner = await Banner.findByIdAndDelete(bannerId);

    console.log("DELE :: ", delBanner);

    return res.status(200).send({
      success: true,
      message: "Successfully deleted banner",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

exports.addFAQ = async function (req, res) {
  try {
    // let { terms,  } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    const faq = new FAQ({
      ...req.body,
    });

    faq
      .save()
      .then((result) => {
        res.status(200).send({
          success: true,
          message: "New FAQ added successfully",
          data: result,
        });
      })
      .catch((error) => {
        console.log("ADD FAQ ERROR", error);
        res.status(500).send({ success: false, message: error });
      });
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

exports.allFAQs = async function (req, res) {
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      query = {};
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const faqs = await FAQ.paginate(query, options);

    res.status(200).send(faqs);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
}

exports.updateFAQ = async function (req, res) {
  try {
    const payload = req.body;
    const { faqId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const faq = FAQ.findOne({ _id: faqId });

    if (!faq) {
      return res
        .status(404)
        .send({ success: false, message: "FAQ not found." });
    }

    let faqUdate = await FAQ.findByIdAndUpdate(
      faqId,
      {
        $set: payload,
      },
      { new: true }
    );
    return res.status(200).send({
      success: false,
      message: "Successfully updated FAQ",
      data: faqUdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

exports.deleteFAQ = async function (req, res) {
  try {
    const { faqId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const faq = FAQ.findOne({ _id: faqId });

    if (!faq) {
      return res
        .status(404)
        .send({ success: false, message: "FAQ not found." });
    }
    const deleteFAQ = await FAQ.findByIdAndDelete(faqId);

    return res.status(200).send({
      success: true,
      message: "Successfully deleted FAQ",
      data: deleteFAQ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

exports.addSection = async function (req, res) {
  try {
    // let { terms,  } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    const section = new Section({
      ...req.body,
    });

    section
      .save()
      .then((result) => {
        res.status(200).send({
          success: true,
          message: "New section added successfully",
          data: result,
        });
      })
      .catch((error) => {
        console.log("Add section ERROR", error);
        res.status(500).send({ success: false, message: error });
      });
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

exports.allSections = async function (req, res) {
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      query = {};
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const sections = await Section.paginate(query, options);

    res.status(200).send(sections);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching sections.",
    });
  }
}

exports.updateSection = async function(req, res) {
  try {
    const payload = req.body;
    const {sectionId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const section = Section.findOne({ _id: sectionId });

    if (!section) {
      return res
        .status(404)
        .send({ success: false, message: "Section not found." });
    }

    let sectionUdate = await Section.findByIdAndUpdate(
      sectionId,
      {
        $set: payload,
      },
      { new: true }
    );
    return res.status(200).send({
      success: false,
      message: "Successfully updated section",
      data: sectionUdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}

exports.deleteSection = async function (req, res) {
  try {
    const { sectionId } = req.params;

    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const section = Section.findOne({ _id: sectionId });

    if (!section) {
      return res
        .status(404)
        .send({ success: false, message: "Section not found." });
    }
    const deleteSection = await Section.findByIdAndDelete(sectionId);

    return res.status(200).send({
      success: true,
      message: "Successfully deleted section",
      data: deleteSection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
}
