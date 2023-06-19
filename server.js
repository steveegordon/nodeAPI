/*jshint esversion: 6 */
//server setup

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
  },
});

io.on("connection", (socket) => {
  socket.emit('connected', 'this is connect on' + socket);

  socket.on('sending', (arg) => {
    console.log(arg);

    //socket.emit('updatedData');
  });
});

var corsOptions = {
  origin: "http://localhost:3000"
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({extended: true}));

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
  // id: String, ADD USER ID FOR MULTI USER
  time: String,
  s1: Number,
  s2: Number,
  s3: Number,
  s4: Number,
  s5: Number,
  s6: Number,
  s7: Number,
  s8: Number
});
const User = mongoose.model('User', userSchema);
const Data = mongoose.model('Data', dataSchema);
//bcrypt setup
const bcrypt = require('bcrypt');
const saltRounds = 10;

var userID = null;

app.get('/users', cors(), async (req, res) => {
  var all = await User.find().exec();
  console.log(all);
  res.send(all);
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

app.get('/data', cors(), async (req, res) => {
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

app.post('/data', cors(), async (req, res) => {
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
// server.listen(port, () => {
//   console.log(`App listenting on local port ${port}`);
// });
app.listen(port, () => {
  console.log(`App listenting on local port ${port}`);
});
io.listen(3001);