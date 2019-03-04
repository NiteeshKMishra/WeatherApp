require('../config/config');
const { Users } = require('../models/users');
const { UserHistory } = require('../models/user-history');


function insertUser() {
  data = {
    username: 'Heroku12Gy',
    email: 'nitish219@gmail.com',
    password: 'ghtyhjgh'
  }
  data.history = [];
  console.log(data);
  Users.insertMany(data).then((user) => {
    console.log(user)
  }).catch((err) => {
    console.log(err.errmsg)
  });
}

function insertS() {
  const history1 = new UserHistory({
    userid: '5c762e6ebc9adc1e10e375a8',
    history: 'Nothing Chutiyapa'
  });

  history1.save().then((res) => {
    console.log(res);
    User.findByIdAndUpdate('5c762e6ebc9adc1e10e375a8', {
      $push: {
        "history": history1._id
      }
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      console.log(user)
    })
  }).catch((err) => {
    console.log(err);
  })
}

function insertM() {
  const user = new User({
    username: 'NiteeshKMishra1',
    email: 'nitish219@gmail.com',
    password: 'hello123'
  });
  user.save().then((docs) => {
    console.log(docs);
    const userhistory = new UserHistory({
      userid: user._id,
      history: 'A new History'
    });
    userhistory.save().then((docs) => {

    });
  }).catch((err) => {
    console.log(err);
  });




}

function findM() {
  user.find
  User.findOne({ username: 'NiteeshKMishra1' }).populate('history', 'history').exec((err, docs) => {
    if (err)
      throw err;
    console.log(docs)
  })
}

function updateD() {
  var historyUpdate;
  var count = 0;
  Users.findById("5c7b6994de5b1bfef5b2fde9").then((user) => {
    historyUpdate = user.history;
    if (historyUpdate.length === 1) {
      console.log('Failed')
      return
    }
    else {
      tempHistory = historyUpdate
      historyUpdate = tempHistory.pop()
      newHistory = new Array();
      newHistory.push(historyUpdate.toHexString())
      Users.findByIdAndUpdate("5c7b6994de5b1bfef5b2fde9", { $set: { history: newHistory } }).then((user, err) => {
        tempHistory.forEach(_id => {
          UserHistory.findByIdAndDelete(_id).then((his, err) => {
            count = count + 1;
            if (count === tempHistory.length) {
              console.log('done');
            }
          })
        });
      })
    }
  })
}

//insertM();
// findM();
//insertS();
// insertUser();
updateD();