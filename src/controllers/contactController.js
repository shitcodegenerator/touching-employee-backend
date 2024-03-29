
const Contact = require("../models/contact.js");
const Employee = require("../models/employee.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')

const addContact = async (req, res) => {
  try {

    const { userId } = req.userData;
    console.log(req.body)
    
    
     // 創建並儲存新的聯絡人
     const newContact = new Contact({
      ...req.body,
      employee: userId // 指定這位聯絡人是由哪位員工新增的
    });

    const savedContact = await newContact.save();

    // 將新聯絡人的ID添加到Employee文檔的contact陣列中
    await Employee.findByIdAndUpdate(userId, {
      $push: { contact: savedContact._id }
    });

    return res.status(200).json({ data: newContact });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ data: false, message: '新增失敗' });
  }
};



const getContact = async (req, res) => {
  try {
    const { userId } = req.userData;

    const employee = await Employee.findById(userId).populate({
      path: 'contact',
      select: '-employee' // 排除Contact中的employee字段
    });

    if (!employee) {
      return res.status(404).json({ data: false, message: '未找到用戶或今日無打卡記錄' });
    }
    console.log(employee)

    res.status(200).json({data: employee.contact});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}



module.exports = {
  addContact,
  getContact
};
