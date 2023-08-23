const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" }
});

messageSchema.methods.getAuthor = async function () {
  return await User.findById(this.author).then(data => data.first_name);
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;