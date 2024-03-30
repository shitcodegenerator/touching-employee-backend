
const Employee = require("../models/employee.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')

const addEmployee = async (req, res) => {
  let { username, password, name } = req.body

  username = `${username}`.toUpperCase()
  try {

    const existingUser = await Employee.findOne({ username }).select('-password');

    if (existingUser) {
      return res
        .status(400)
        .json({ data: false, message: "會員帳號已有人使用" });
    }

    const newUser = new Employee({
      username,
      name,
      password: password ? await bcrypt.hash(password, 15) : ''
    });

    await newUser.save();

    const token = jwt.sign(
      { username, userId: newUser._id },
      process.env.AUTH_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({ data: newUser, token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ data: false });
  }
};

const login = async (req, res) => {

  const username = req.body.username.toUpperCase()
    const hasAccount = await Employee.findOne({ username })

    if (!hasAccount) {
      return res.status(400).json({data: false, message: '無此會員帳號'})
    }
    console.log(hasAccount)
    const isPasswordValid = await bcrypt.compare(req.body.password, hasAccount.password)
    if (!isPasswordValid) {
      return res.status(400).json({data: false, message: '密碼錯誤，請再試一次'})
    }

     const token = jwt.sign(
      { username, userId: hasAccount._id },
      process.env.AUTH_KEY,
      { expiresIn: "24h" }
    );
    return res
      .status(200)
      .json({ data: hasAccount, message: "登入成功", token });
  
};

const clockin = async (req, res) => {
  try {
    // 從JWT解析出的用戶ID
    const { userId } = req.userData;
    const { start, end } = req.body;
     console.log( start, end)
    
    const clockInData = {
      start: start ?? '',
      end: end ?? '',
    };
    console.log(clockInData)

    // 查找用戶並更新其打卡資訊
    await Employee.findByIdAndUpdate(userId, {
      $push: { clock_in:{
        $each: [clockInData],
        $position: 0 
      } }
    }, { new: true });

    res.status(200).json({ data: true, message: '打卡資訊已更新' });
  } catch (error) {
    console.error(error);
    res.status(500).send('伺服器錯誤');
  }
}

const getUserData = async (req, res) => {
  try {
    const { userId } = req.userData;
    // 通過jwt驗證後，req.user將包含解析出的用戶信息（userId）
    const user = await Employee.findById(userId).select('-password'); // 排除密碼字段
    if (!user) {
      return res.status(404).send('找不到用戶');
    }
    res.status(200).json({data: user});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}

const getClockinList = async (req, res) => {
  try {
    const { userId } = req.userData;

    // 設置今天的開始和結束時間
    const startOfToday = dayjs().startOf('day')
    const endOfToday = dayjs().endOf('day')

    // 查詢今天的打卡記錄
    const employee = await Employee.findById(userId);

    if (!employee) {
      return res.status(404).json({ data: false, message: '未找到用戶或今日無打卡記錄' });
    }


    // 篩選匹配當天時間範圍的打卡記錄
    const todaysClockIns = employee.clock_in.filter(clockIn => {
      const start = new Date(clockIn.start);
      const end = new Date(clockIn.end);
      return (start >= startOfToday && start <= endOfToday) || (end >= startOfToday && end <= endOfToday);
    });

    res.status(200).json({data: todaysClockIns});
  } catch (error) {
    console.log(error)
    res.status(500).send('伺服器錯誤');
  }
}

const addWorkList = async (req, res) => {
  try {
    const { userId } = req.userData;

    // 更新Employee文檔，將新的工作日報表推入worklists陣列
    const updatedEmployee = await Employee.findByIdAndUpdate(
      userId,
      {
        $push: { worklist: {
          $each: [req.body],
          $position: 0
        } }
      },
      { new: true } // 返回更新後的文檔
    );

    if (!updatedEmployee) {
      return res.status(404).send('未找到該員工');
    }

    res.status(201).json({data: updatedEmployee.worklist});
  } catch (error) {
    console.error(error);
    res.status(500).send('伺服器錯誤');
  }
}

const getWorkList = async (req, res) => {
  try {
    const { userId } = req.userData;

    const today = new Date();

    // 設置今天的開始和結束時間
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));


    // 更新Employee文檔，將新的工作日報表推入worklists陣列
    const employee = await Employee.findById(userId).populate({
      path: 'worklist.contact',
      select: '-employee'
    });

    if (!employee) {
      return res.status(404).json({ data: false, message: '未找到該員工' });
    }

     // 從worklists中過濾出今日的項目
     const todayWorklists = employee.worklist.filter(worklist => {
      const worklistDate = new Date(worklist.created_at);
      return worklistDate >= startOfToday && worklistDate <= endOfToday;
    });


    res.status(201).json({data: todayWorklists});
  } catch (error) {
    console.error(error);
    res.status(500).send('伺服器錯誤');
  }
}

module.exports = {
  addEmployee,
  login,
  clockin,
  getUserData,
  getClockinList,
  addWorkList,
  getWorkList
};
