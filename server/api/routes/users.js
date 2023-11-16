const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const user = express.Router();
const User = require('../../../models/user');


// GET Log In Page
user.get('/login', (req, res) => res.render("form", { formType: "Log In" }));

// GET Sign Up Page
user.get('/signup', (req, res) => res.render("form", { formType: "Sign Up" }));

// POST Sign Up
user.post('/new', (req, res, next) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      } else {
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          member: true,
          admin: req.body.secret_code === 'cats'
        });
        await user.save();
        res.redirect('/');
      }
    });
  } catch(err) {
    console.log(err);
  }
});

user.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));

user.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


module.exports = user;