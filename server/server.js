require('../config/config');
const { passport } = require('../config/passport');
const { sendMail } = require('./utils/sendemail');

const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios');
const path = require('path');
const http = require('http');
const cors = require('cors');
const uuid = require('uuid/v4');
const cookieParser = require('cookie-parser');

const { UserHistory } = require('../models/user-history');
const { Users } = require('../models/users');

const app = express();
const PORT = process.env.PORT;

app.use(session({
  genid: (req) => {
    return uuid();
  },
  secret: 'secret',
  saveUninitialized: true,
  resave: false
}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(flash());

const public = path.join(__dirname, '../public');
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.static(public));

var globaluser;

/**Socket Io Configuration */
var server = http.createServer(app);
var io = socketIO(server);
io.on('connection', (socket) => {
  console.log("New Client Connected")

  socket.on('saveuser', (data, callback) => {
    data.history = [];
    Users.insertMany(data).then((user) => {
      if (user) {
        callback('done');
      }
    }).catch((err) => {
      callback(err.errmsg);
    })
  });

  socket.on('forgetcred', (data, callback) => {
    Users.findOne({ email: data.email }).then((user) => {
      if (user) {
        sendMail(data.email, user.username, user.password).then((msg) => {
          callback(msg)
        }).catch((err) => {
          callback(err);
        });
      }
      else {
        callback('Your Email was not found')
      }
    }).catch((err) => {
      callback(err);
    })
  });

  socket.on('changepassword', (data, callback) => {
    Users.findOneAndUpdate({ email: data.email, password: data.oldpassword }, { $set: { password: data.newpassword } }, { new: true }).then((user, err) => {
      if (err) {
        callback(err)
      }
      else if (!user) {
        callback('Invalid')
      }
      else {
        callback('done');
      }
    })
  });


  socket.on('clearhistory', (data, callback) => {
    var historyUpdate;
    var count = 0;
    Users.findById(globaluser._id).then((user) => {
      historyUpdate = user.history;
      if (historyUpdate.length === 1) {
        callback('Failed')
        return
      }
      else {
        tempHistory = historyUpdate
        historyUpdate = tempHistory.pop()
        newHistory = new Array();
        newHistory.push(historyUpdate.toHexString())
        Users.findByIdAndUpdate(globaluser._id, { $set: { history: newHistory } }).then((user, err) => {
          tempHistory.forEach(_id => {
            UserHistory.findByIdAndDelete(_id).then((his, err) => {
              count = count + 1;
              if (count === tempHistory.length) {
                callback('done');
              }
            })
          });
        })
      }
    })
  });

  socket.on('disconnect', () => {
    console.log('Client Disconnected')
  });




  /**Root Url */
  app.get('/', (req, res) => {
    res.render('index.ejs', { message: '' });
  });

  app.post('/login', passport.authenticate('local', {
    successRedirect: '/login',
    failureRedirect: '/',
    failureFlash: true
  }));


  app.post('/results', (req, res) => {
    if (req.user) {
      UserHistory.insertMany({ userid: req.user._id, history: req.body.search })
        .then((his, err) => {
          if (err) {
            res.render('index.ejs', { message: 'Something went wrong. Please try after sometime' })
          }
          Users.findByIdAndUpdate(req.user._id, { $push: { history: his[0]._id } }, { new: true }).then((users, err) => {
            if (err) {
              res.render('index.ejs', { message: 'Something went wrong. Please try after sometime' })
            }
          });
        })
    }
    /** Geocode Locatio starts */
    var geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(req.body.search) + '&key=AIzaSyAoUv3nCnISetmOFf3_79hMIeJNN3linLA';

    axios.get(geocodeUrl).
      then((geolocation, err) => {
        if (geolocation.data.status === 'ZERO_RESULTS') {
          res.render('index.ejs', { message: 'No results have been found. Please Enter a different address' })
        }
        else if (geolocation.data.status === 'OK') {
          let lat = geolocation.data.results[0].geometry.location.lat;
          let lng = geolocation.data.results[0].geometry.location.lng;
          axios.get(`https://api.darksky.net/forecast/d8c83a117cf2328169297cf131fd5453/${lat},${lng}`).then((weather, err) => {
            if (err) {
              res.render('index.ejs', { message: 'Weather cannot be retrieved for given location' });
            }
            else {
              if (req.user) {
                res.render('user-results.ejs', { user: req.user, weather: weather.data });
              }
              else {
                res.render('results.ejs', weather.data);
              }
            }
          })
        }
        else if (err) {
          res.render('index.ejs', { message: 'Weather cannot be retrieved for given location' })
        }

      });
    /** Geocode Location Ends*/
  });


  app.get('/login', (req, res) => {
    globaluser = req.user;
    var userhistory = [];
    var count = 0;
    req.user.history.forEach(id => {
      UserHistory.findById(id).then((result) => {
        userhistory.push(result.history);
        count = count + 1;
        if (count === req.user.history.length) {
          res.render('user.ejs', { user: req.user, history: userhistory, message: '' });
        }
      }).catch((err) => {
        if (err) {
          res.render('index.ejs', { message: 'Cannot Login Now. Please try after Sometime' })
        }
      });
    });
  });

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('index.ejs', { message: '' });
  });

  app.get('/aboutus', (req, res) => {
    res.render('aboutus.ejs')
  })

});

server.listen(PORT, () => {
  console.log(`Server is up at Port ${PORT}`);
});



