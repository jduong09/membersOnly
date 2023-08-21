const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
require('dotenv').config();
const Schema = mongoose.Schema;

const mongoDb = process.env.uri;
mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'mongo connection error'));

const User = mongoose.model(
  "User",
  new Schema({
    first_name: { type: String, required: true },
    family_name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    member: {type: Boolean, required: true }
  })
);

const Message = mongoose.model(
  "Message",
  new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { 
    timestamps: true
  })
)



const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render("index"));

app.get('/users/signup', (req, res) => res.render("form"));

app.listen(3000, () => console.log("App listening on Port 3000"));