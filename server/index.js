const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');
const Message = require('../models/message');
const userRouter = require('./api/routes/users.js');
const messageRouter = require('./api/routes/messages.js');

const mongoDb = process.env.uri;

mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../public/views"));
app.use(express.static('public'));

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
});

// Middleware function to set local currentUser in express.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/users', userRouter);

app.use('/messages', messageRouter);

// GET Index
app.get('/', async (req, res) => {
  const messages = await Message.find({}).then(async (data) => {
    return await Promise.all(data.map(async (message) => {
      const authorObj = await message.getAuthor();
      return {
        id: message._id.toString(),
        title: message.title,
        content: message.content,
        author: authorObj
      }
    }));
  });
  res.render("index", { user: res.locals.currentUser, messages });
});

app.listen(3000, () => console.log("App listening on Port 3000"));
