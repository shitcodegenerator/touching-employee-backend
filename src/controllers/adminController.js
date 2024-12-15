
const Employee = require("../models/employee.js");
const Admin = require("../models/admin.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')

const Contact = require("../models/contact.js");


const getEmployeeList = async (req, res) => {
  try {
    // 通過jwt驗證後，req.user將包含解析出的用戶信息（userId）
    const employees = await Employee.find().select('-clock_in -worklist -contact -password');
    res.status(200).json({data: employees});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}

const getContact = async (req, res) => {
  try {
    // 通過jwt驗證後，req.user將包含解析出的用戶信息（userId）
    const contacts = await Contact.find().populate({
      path: 'employee',
      select: '_id name'
    });
    res.status(200).json({data: contacts});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}


const getClockinList = async (req, res) => {
  try {
    // 取得年份和月份的查詢參數
    const { year, month } = req.query;

    // 構建日期篩選條件
    let dateFilter = {};
    if (year && month) {
      // 使用 Day.js 生成月份範圍
      const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').add(1, 'day').startOf('day').toDate();

      // 設置 MongoDB 篩選條件
      dateFilter = {
        'clock_in.start': { $gte: startDate, $lt: endDate },
      };
    }

    // 查詢數據，應用日期篩選條件
    const worklist = await Employee.findById(req.params.id)
      .select('clock_in')
      .where(dateFilter);

    res.status(200).json({ data: worklist });
  } catch (error) {
    console.error(error);
    res.status(500).send('伺服器錯誤');
  }
};

const getWorkList = async (req, res) => {
  try {
    // 通過jwt驗證後，req.user將包含解析出的用戶信息（userId）
    const worklist = await Employee.findById(req.params.id).select('worklist');
    res.status(200).json({data: worklist});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}

const register = async (req, res) => {
  console.log(req.body)
  let {username, password, ...otherData} = req.body
  try {

    username = `${username}`.toUpperCase()
    const existingUser = await Admin.findOne({ username }).select('-password');

    if (existingUser) {
      return res
        .status(400)
        .json({ data: false, message: "會員帳號已有人使用" });
    }

    const newUser = new Admin({
      username,
      password: password ? await bcrypt.hash(password, 15) : '',
      ...otherData
    });

    await newUser.save();

    const token = jwt.sign(
      { username, userId: newUser._id },
      process.env.ADMIN_KEY
    );

    return res.status(200).json({ data: newUser, token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ data: err.response.data.error_description });
  }
};

const updateAdmin = async (req, res) => {
  try {

    const updatedUser = await Admin.findByIdAndUpdate(
       '660e0dce240bafbe4d8fdf9b',
      { password: await bcrypt.hash('qqqqqq', 15) },
      { new: true }
    )
    
    return res.status(200).json({ data: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ data: err.response.data.error_description });
  }
};

const login = async (req, res) => {

  const username = req.body.username.toUpperCase()
  const hasAccount = await Admin.findOne({ username })

    if (!hasAccount) {
      return res.status(400).json({data: false, message: '無此會員帳號'})
    }

    const isPasswordValid = await bcrypt.compare(req.body.password.toLowerCase(), hasAccount.password)
    if (!isPasswordValid) {
      return res.status(400).json({data: false, message: '密碼錯誤，請再試一次'})
    }

     const token = jwt.sign(
      { username, userId: hasAccount._id },
      'TOUCHING_DEVELOPMENT_ADMIN_SYSTEM_178'
    );
    return res
      .status(200)
      .json({ data: hasAccount, message: "登入成功", token });
  
};

const me = async (req, res) => {
  try {
    const { userId } = req.userData;
    // 通過jwt驗證後，req.user將包含解析出的用戶信息（userId）
    const user = await Admin.findById(userId).select('-password'); // 排除密碼字段
    if (!user) {
      return res.status(404).send('找不到用戶');
    }
    res.status(200).json({data: user});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}

module.exports = {
  getEmployeeList,
  login,
  register,
  me,
  getClockinList,
  getWorkList,
  getContact,
  updateAdmin
};
