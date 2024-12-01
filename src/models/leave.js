const mongoose = require('mongoose');
const LeaveEnum = require('../enums/leave')

const leaveTypes = Object.values(LeaveEnum.LeaveType)

const leaveSchema = new mongoose.Schema({
    employee_id: String,         // 申請此請假的會員ID         
    type: { // 請假類型
        type: Number,
        enum: leaveTypes,  // 使用Enum來限制狀態的值
        default: LeaveEnum.LeaveType.ANNUAL  // 默認狀態為審核中
    },
    status: {
        type: Number,
        enum: [LeaveEnum.LeaveStatus.PENDING, LeaveEnum.LeaveStatus.APPROVED, LeaveEnum.LeaveStatus.REJECTED],  // 使用Enum來限制狀態的值
        default: LeaveEnum.LeaveStatus.PENDING  // 默認狀態為審核中
    },
    unit: String,              // 時間單位 ("day" 或 "hour")
    reason: String,            // 請假理由
    start_time: Date,          // 請假開始時間
    end_time: Date,            // 請假結束時間
    created_at: Date,          // 申請時間
    approved_at: Date,         // 批准時間
    approved_by: String,       // 批准者的用戶ID
    apply_by: String           // 申請者的用戶ID
})

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;