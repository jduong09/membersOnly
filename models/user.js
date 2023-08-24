const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = mongoose.model(
  "User",
  new Schema({
    first_name: { type: String, required: true },
    family_name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    member: { type: Boolean, required: true },
    admin: { type: Boolean }
  })
);

module.exports = User;