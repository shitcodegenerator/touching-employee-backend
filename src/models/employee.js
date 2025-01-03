const mongoose = require('mongoose');
const { OriginalLeaves } = require('../enums/leave');
const leaveBalanceSchema = require('./leaveBalanceSchema')
const Schema = mongoose.Schema;

const worklistSchema = new Schema({
  startTime: String,
  endTime: String,
  duration: Number,
  content: String,
  target: String,
  contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
  workplace: String,
  isVerified: {
    type: Boolean,
    default: true
  }
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
  residence_of_registreation: { type: String, default: '' }, // 戶籍地
  residence: { type: String, default: '' }, // 居住地
  id_no: { type: String, default: '' }, // 身分證字號
  mobile: { type: String, default: '' }, // 電話
  military: { type: String, default: '' }, // 役男
  emergency: { type: String, default: '' }, // 緊急聯絡人，關係，電話
  position: { type: String, default: '' }, // 職位
  department: { type: String, default: '' }, // 部門
  salary: { type: String, default: '' }, // 約定薪資
  license: { type: String, default: '' }, // 證照
  resent_job: { type: String, default: '' }, // 近期工作
  clock_in: [{
    start: Date,
    end: Date,
    location: {
      type: String, default: ''
    },
    type: {
      type: String,
      default: '一班卡'
    },
    correctDate: {
      type: String, default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  }],
  contact: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  leaves_taken: [{ type: Schema.Types.ObjectId, ref: 'Leave' }],
  leave_balance: [leaveBalanceSchema],  // 每個員工獨立的假期餘額
  leaves_taken: [{          // 請假記錄的引用
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave'
  }],
  worklist: [worklistSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;