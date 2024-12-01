
const Employee = require("../models/employee.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')
const { OriginalLeaves, LeaveType} = require('../enums/leave.js')

// 申請請假的API
const applyLeave = async (req, res) => {
    try {
      const { userId } = req.userData; // 獲取已驗證用戶的ID
      const { type, start_time, end_time, unit, reason } = req.body;
  
      // 確認請假類型是否有效
      if (!Object.values(LeaveType).includes(type)) {
        return res.status(400).json({ message: '無效的請假類型' });
      }
  
      // 查找該員工
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(404).json({ message: '找不到用戶' });
      }
  
      // 計算請假天數或小時數
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      let daysTaken = 0;
      if (unit === 'day') {
        daysTaken = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
      } else if (unit === 'hour') {
        daysTaken = Math.ceil((endTime - startTime) / (1000 * 60 * 60) / 8); // 按8小時算一天
      } else {
        return res.status(400).json({ message: '無效的時間單位' });
      }
  
      // 檢查剩餘假數
      if (employee.leaves_rest[type] < daysTaken) {
        return res.status(400).json({ message: '剩餘假數不足' });
      }
  
      // 創建新的請假記錄
      const leave = new Leave({
        employee_id: userId,
        type,
        status: LeaveStatus.PENDING,
        unit,
        reason,
        start_time: startTime,
        end_time: endTime,
        created_at: new Date(),
        approved_at: null,
        approved_by: null,
        apply_by: userId
      });
  
      await leave.save();
  
      // 更新員工的請假記錄和剩餘假數
      employee.leaves_taken.push(leave._id);
      employee.leaves_rest[type] -= daysTaken;
      await employee.save();
  
      res.status(201).json({ message: '請假申請已提交', leave });
    } catch (error) {
      console.error(error);
      res.status(500).send('伺服器錯誤');
    }
  };

module.exports = {
    applyLeave
};
