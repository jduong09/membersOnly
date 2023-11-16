const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const message = express.Router();
const Message = require('../../../models/message');

message.post('/messages', async (req, res, next) => {
  try {
    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      author: res.locals.currentUser._id
    });
    await message.save();
    res.redirect('/');
  } catch(err) {
    return next(err)
  }
});

message.post('/messages/:messageId', async (req, res, next) => {
  const updatedData = {
    title: req.body.title,
    content: req.body.content
  }

  try {
    await Message.findOneAndUpdate({ _id: req.params.messageId }, updatedData);
    res.redirect('/');
  } catch(err) {
    return next(err);
  }
});

message.get('/:messageId/edit', async (req, res) => {
  const messageData = await Message.findById(req.params.messageId)
    .then(data => {
      return {
        id: req.params.messageId,
        title: data.title,
        content: data.content
      }
    });
  res.render("update", { message: messageData });
});

// DELETE One Message
message.delete('/:messageId', async (req, res, next) => {
  try {
    await Message.findOneAndDelete({ _id: req.params.messageId });
    res.send({ message: 'success' });
  } catch(err) {
    next(err);
  }
});


module.exports = message;