/*jshint esversion: 6 */
//server setup

const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

//database setup

const mongoose = require('mongoose');
dbConnect().catch(err => console.log(err));

async function dbConnect() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
}

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  password: String
});
const dataSchema = new mongoose.Schema({
  id: String,
  s1: {},
  s2: {},
  s3: {}
});
const User = mongoose.model('User', userSchema);
const Data = mongoose.model('Data', dataSchema);
//bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

var userID = null;

app.get('/users', async (req, res) => {
  var all = await User.find();
  console.log(all);
  res.send('Show us what you gots');
});

app.get('/login', async (req, res) => {
  const userData = req.body;
  var user = await User.findOne({ name: userData.name });
  console.log(user);
  const match = await bcrypt.compare(userData.password, user.password);
  if (match) {
    res.send("Password is correct, logging in");
    userID = user.id;
  }
  else res.send("Password incorrect");
});

app.get('/userdata', async (req, res) => {
  const user = req.body.userID;
  const data = await Data.find({ id: user });
  try {
    res.send(data);
  } catch(err) {
    res.status(500).send(err);
  }
});

app.get('/data', async (req, res) => {
  var data = await Data.find();
  try {
  res.send(data)
  } catch(err) {
    res.status(500).send(err);
  } 
});

app.post('/newuser', async (req, res) => {
  var data = req.body;
  await bcrypt.hash(data.password, saltRounds, function(err, hash) {
    data.password = hash;
    const newUser = new User(data);
    try {
      newUser.save();
      res.send(newUser);
    } catch(err) {
      res.status(500).send(err);
    }
  });
});

app.post('/data', async (req, res) => {
  var data = req.body
  const newData = new Data(data);
  try {
    newData.save();
    res.send(newData);
  } catch(err) {
    res.status(500).send(err);
  }
});

app.delete('/user', async (req, res) => {
  const user = await User.findOne({ id: req.body.userID});
  try {
    User.delete(user);
    res.send("User Deleted");
  } catch(err) {
    res.status(500).send(err);
  }
})

app.listen(port, () => {
  console.log(`App listenting on local port ${port}`);
});