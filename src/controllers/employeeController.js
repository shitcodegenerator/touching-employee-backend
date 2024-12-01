
const Employee = require("../models/employee.js");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')
const { OriginalLeaves, LeaveType} = require('../enums/leave.js')

const updateEmployee = async (req, res) => {
  try {

    const updatedUser = await Employee.findByIdAndUpdate(
       '660989df63c383de092969f2',
      { password: await bcrypt.hash('qqqqqq', 15) },
      { new: true }
    )
    
    return res.status(200).json({ data: true });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ data: err.response.data.error_description });
  }
};


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

      // 初始化假期餘額，每個員工的假期數據是獨立的
      const leaveBalance = Object.keys(OriginalLeaves).map(leaveType => ({
        type: leaveType,
        total_days: OriginalLeaves[leaveType],
        used_days: 0,
        used_hours: 0,
      }));

    const newUser = new Employee({
      ...req.body,
      password: password ? await bcrypt.hash(password, 15) : '',
      leave_balance: leaveBalance,
      leaves_taken: []
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

  const username = req.body.username
    const hasAccount = await Employee.findOne({ username }).collation({ locale: 'en', strength: 2 }) // 指定英文和忽略大小写的比较

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
    const { start, end, location } = req.body;

    
    const clockInData = {
      start: start ?? '',
      end: end ?? '',
      location
    };

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

const clockinPatch = async (req, res) => {
  try {
    const { start, end, location } = req.body;
    
    const clockInData = {
      start: start ?? '',
      end: end ?? '',
      location
    };


    // 查找用戶並更新其打卡資訊
    await Employee.findByIdAndUpdate('660988ea63c383de092969ef', {
      $push: { clock_in:{
        $each: [req.body]
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

const getClockinHours = async (req, res) => {
  try {
    const { userId } = req.userData;

    const { clock_in } = await Employee.findById(userId).select('clock_in');

    const workHours = calculateWorkHours(clock_in)
    const totalHours = totalWorkHours(workHours) / 60;
    // const timeTitle = computed(() => {
    //     // 然后，将分钟转换为小时
    
    // // 最后，使用toFixed(2)保留两位小数并转换为数字类型
    //   return `總工作時數 ${parseFloat(totalHours.toFixed(2))} 小時（${totalWorkHours(workHours.value)} 分鐘）`
    // })
  
    res.status(200).json({
      list: calculateWorkHours(clock_in),
      totalMins: totalWorkHours(workHours),
      totalHours
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('伺服器錯誤');
  }
}

const calculateWorkHours = (clockinData) => {
  // 按日期分组打卡记录
  const groupedByDate = clockinData.reduce((acc, record) => {
    const dateKey = record.start ? dayjs(record.start).format('YYYY-MM-DD') : dayjs(record.end).format('YYYY-MM-DD');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {});

  const workHoursByDay = {};

  // 计算每天的工作时间
  Object.keys(groupedByDate).forEach(date => {
    let dailyTotalMinutes = 0;

    // 针对每天的记录进行排序和计算
    const dailyRecords = groupedByDate[date].sort((a, b) => {
      const aTime = a.start ? dayjs(a.start) : dayjs(a.end);
      const bTime = b.start ? dayjs(b.start) : dayjs(b.end);
      return aTime.diff(bTime);
    });

    let lastStart = null;
    dailyRecords.forEach(record => {
      if (record.start && !lastStart) {
        lastStart = dayjs(record.start);
      } else if (record.end && lastStart) {
        const end = dayjs(record.end);
        const durationMinutes = end.diff(lastStart, 'minute');
        dailyTotalMinutes += Math.ceil(durationMinutes);
        lastStart = null; // 重置lastStart以准备下一次计算
      }
    });

    workHoursByDay[date] = dailyTotalMinutes;
  });

  return workHoursByDay;
}

function totalWorkHours(workHoursByDay) {
  return Object.values(workHoursByDay).reduce((total, dailyHours) => total + dailyHours, 0);
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
  getWorkList,
  clockinPatch,
  getClockinHours,
  updateEmployee
};
