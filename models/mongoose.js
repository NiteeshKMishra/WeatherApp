const mongoose = require('mongoose');

const { ObjectID } = require('mongodb');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err) => {
  if (err) {
    throw err;
  }
  console.log('Successfully Connected to DataBase');
});

module.exports = {
  mongoose, ObjectID
}