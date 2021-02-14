const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const router = require("express").Router();

router.post("/", async (req, res) => {
  //LETS VALIDATE THE DATA BEFORE MAKE A USER
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Checkin if the user is already in db
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exist");

  //Hash the password 10 is complexcity
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ user });
  } catch (err) {
    res.status(400).send(err);
  }
});

function validate(req) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(req);
}
module.exports = router;