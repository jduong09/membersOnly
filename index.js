const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/user');
const Message = require('./models/message');

const mongoDb = process.env.uri;
mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set("views", path.join(__dirname, '/views'));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: "Incorrect username "});
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
})

// POST Sign Up
app.post('/users/new', (req, res, next) => {
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
          member: true
        });

        await user.save();
        res.redirect('/');
      }
    });
  } catch(err) {
    console.log(err);
  }
});

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));

// GET Index
app.get('/', (req, res) => res.render("index"));

// GET Sign Up
app.get('/users/new', (req, res) => res.redirect('/users/signup'));

// GET Sign Up Page
app.get('/users/signup', (req, res) => res.render("form"));

app.listen(3000, () => console.log("App listening on Port 3000"));