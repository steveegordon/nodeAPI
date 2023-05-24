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
const User = mongoose.model('User', userSchema);
//bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.get('/', async (req, res) => {
  var all = await User.find();
  console.log(all);
  res.send('Show us what you gots');
});

app.post('/', async (req, res) => {
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

app.listen(port, () => {
  console.log(`App listenting on local port ${port}`);
});