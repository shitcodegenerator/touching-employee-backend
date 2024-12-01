const mongoose = require('mongoose');
const { OriginalLeaves, LeaveType} = require('../enums/leave.js')

const leaveBalanceSchema = new mongoose.Schema({
    type: {
      type: Number,
      enum: Object.values(LeaveType),  // 這裡使用了之前定義的 LeaveType
      required: true
    },
    total_days: {
      type: Number,
      required: true
    },
    used_days: {
      type: Number,
      default: 0
    },
    used_hours: {
      type: Number,
      default: 0
    },
  });

module.exports = leaveBalanceSchema;