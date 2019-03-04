const { mongoose } = require('./mongoose');


var UserHistorySchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  history: {
    type: String
  }
});

var UserHistory = mongoose.model('UserHistory', UserHistorySchema);

module.exports = { UserHistory }