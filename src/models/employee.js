const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worklistSchema = new Schema({
  startTime: String,
  endTime: String,
  duration: Number,
  content: String,
  target: String,
  contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
  workplace: String,
  // Mongoose會自動為worklistSchema中的每個文檔添加_id字段
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

const employeeSchema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  active: { type: String,  default: true },
  note: { type: String,  default: '' },
  workplace: { type: String,  default: '' },
  resign_at: { type: Date, default: '' },
  clock_in: [{
    start: Date,
    end: Date
  }],
  contact: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  worklist: [worklistSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;