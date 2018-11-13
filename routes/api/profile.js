const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profile = require("../../models/profile");
const { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = require("http-status-codes");
const _ = require("lodash");
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          return res
            .status(BAD_REQUEST)
            .json({ msg: "There is no profilefor this user" });
        }
        res.status(OK).send(profile);
      })
      .catch(err => {
        res.status(INTERNAL_SERVER_ERROR).json({ err });
      });
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.body);
    const profileField = {};
    profileField.user = req.user.id;
    if (req.body.handle) {
      profileField.handle = req.body.handle;
    }
    if (req.body.company) {
      profileField.company = req.body.company;
    }
    if (req.body.website) {
      profileField.website = req.body.website;
    }
    if (req.body.location) {
      profileField.location = req.body.location;
    }
    if (req.body.status) {
      profileField.status = req.body.status;
    }
    if (req.body.bio) {
      profileField.bio = req.body.bio;
    }
    if (req.body.githubusername) {
      profileField.githubusername = req.body.githubusername;
    }
    if (req.body.status) {
      profileField.status = req.body.status;
    }

    if (typeof req.body.skills !== "undefined") {
      profileField.skills = req.body.skills.split(",");
    }
    profileField.social = {};
    if (req.body.youtube) {
      profileField.social.youtube = req.body.youtube;
    }

    if (req.body.twitter) {
      profileField.social.twitter = req.body.twitter;
    }

    if (req.body.facebook) {
      profileField.social.facebook = req.body.facebook;
    }

    if (req.body.linkedId) {
      profileField.social.linkedId = req.body.linkedId;
    }
    if (req.body.instagram) {
      profileField.social.instagram = req.body.instagram;
    }

    profileField.experience = {};
  }
);

module.exports = router;
