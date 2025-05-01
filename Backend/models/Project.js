const mongoose = require('mongoose');

// Project schema definition
const projectSchema = new mongoose.Schema({
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], 
});

module.exports = mongoose.model('Project', projectSchema);
