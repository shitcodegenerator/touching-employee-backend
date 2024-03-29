const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worklistSchema = new Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  contact: { type: Schema.Types.ObjectId, ref: 'Contact', default: ''  },
  target: { type: String, default: '' },
  employee: { type: Schema.Types.ObjectId, ref: 'Employee' },
  content: {
    type: String,
    required: true
  },
  workplace: {
    type: String,
    required: true
  },
  modified_at: { type: Date, default: '' },
  created_at: { type: Date, default: Date.now },
});

const Worklist = mongoose.model('Worklist', worklistSchema);

module.exports = Worklist;