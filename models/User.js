const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  avatar: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("user", UserSchema);
