const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    requried: [true, 'A Task must have a name!'],
  },
  content: {
    type: String,
  },
  userRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'MISSING USER REFRENCE!!!'],
  },
});

module.exports = mongoose.model('Task', taskSchema);
