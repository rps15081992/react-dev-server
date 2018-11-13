const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcryptjs = require("bcryptjs");
const { OK, BAD_REQUEST } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const joi = require("joi");

/* GET users listing. */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const users = await User.find();
    if (!users)
      return res.status(BAD_REQUEST).send(`there are some technical issue`);
    res.status(OK).send(users);
  }
);

// post user
router.post("/register", async (req, res) => {
  const { error } = ValidateUsers(req.body);
  if (error) {
    return res.status(BAD_REQUEST).send(`${error.details[0].message}`);
  }
  const usr = await User.findOne({ email: req.body.email });
  if (usr === null) {
    const avatar = gravatar.url(req.body.email, {
      s: "200",
      r: "pg",
      d: "mm"
    });
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      avatar: avatar,
      password: req.body.password
    });

    bcryptjs.genSalt(10, (error, salt) => {
      bcryptjs.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            res.status(200).json({ msg: "user created sucessfully !", user });
          })
          .catch(err => {
            res.status(500).json({
              msg: "ooops! unable to create new user ! " + err.message
            });
          });
      });
    });
  } else {
    res.status(BAD_REQUEST).json({ email: "email already exists !" });
  }
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(usr => {
      if (!usr) {
        return res.status(BAD_REQUEST).json({ msg: "user not found!" });
      }
      bcryptjs
        .compare(password, usr.password)
        .then(isMatched => {
          if (isMatched) {
            const payload = {
              id: usr.id,
              name: usr.name,
              email: usr.email,
              avatar: usr.avatar
            };
            jwt.sign(
              payload,
              keys.JWT_SECRET,
              { expiresIn: "1h" },
              (err, token) => {
                if (err) {
                  return res
                    .status(BAD_REQUEST)
                    .send(`unable to generate token`);
                }
                res.status(OK).json({ sucess: true, token: "Bearer " + token });
              }
            );
          } else {
            res.status(BAD_REQUEST).json({ msg: "password incorrect !" });
          }
        })
        .catch(err => {
          return res.status(BAD_REQUEST).json({ msg: "bad request" });
        });
    })
    .catch(err => {});
});

module.exports = router;

function ValidateUsers(user) {
  const schema = {
    name: joi
      .string()
      .min(3)
      .max(50)
      .trim()
      .required(),
    email: joi
      .string()
      .email()
      .trim()
      .required(),
    password: joi.string().required()
  };
  return joi.validate(user, schema);
}
