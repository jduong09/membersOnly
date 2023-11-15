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
app.use(express.static(__dirname));
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
});

// Middleware function to set local currentUser in express.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
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

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));

app.post('/users/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.post('/messages', async (req, res, next) => {
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

app.post('/messages/:messageId', async (req, res, next) => {
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
})

// GET Index
app.get('/', async (req, res) => {
  const messages = await Message.find({}).then(async (data) => {
    return await Promise.all(data.map(async (message) => {
      /* {
        id,
        name
      }
      */
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

app.get('/messages/:messageId/edit', async (req, res) => {
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

// GET Log In Page
app.get('/users/login', (req, res) => res.render("form", { formType: "Log In" }));

// GET Sign Up Page
app.get('/users/signup', (req, res) => res.render("form", { formType: "Sign Up" }));
app.listen(3000, () => console.log("App listening on Port 3000"));

// DELETE One Message
app.delete('/messages/:messageId', async (req, res, next) => {
  try {
    await Message.findOneAndDelete({ _id: req.params.messageId });
    res.send({ message: 'success' });
  } catch(err) {
    next(err);
  }
});