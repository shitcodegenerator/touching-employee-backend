const LeaveStatus = {
    PENDING: 0,    // 審核中
    APPROVED: 1,   // 成功
    REJECTED: 2    // 拒絕
}

const LeaveType = {
    SICK: 1,
    ANNUAL: 2, // 特休
    OCCUPATIONAL_ACCIDENT: 3, // 職災
    OFFICIAL: 4, // 公假
    PERIOD: 5, // 生理假
    MARRIAGE: 6, // 婚嫁
    PREGNANT_56: 7, // 懷孕假 生產前後
    PREGNANT_28: 8, // 懷孕假 3個月以上流產
    PREGNANT_7: 9, // 懷孕假 2-3個月(未滿)流產
    PREGNANT_5: 10, // 懷孕假 未滿兩個月流產
    BEREAVEMENT_8: 11, // ● 8天：(養/繼)父母、配偶
    BEREAVEMENT_6: 12, // ● 6天：祖父母、子女、配偶的(養/繼)父母
    BEREAVEMENT_3: 13 // ● 3天：曾祖父母、手足、配偶的祖父母
}

const OriginalLeaves = {
    [LeaveType.SICK]: 14,
    [LeaveType.ANNUAL]: 7,
    [LeaveType.OCCUPATIONAL_ACCIDENT]: 999,
    [LeaveType.OFFICIAL]: 999,
    [LeaveType.PERIOD]: 1,
    [LeaveType.MARRIAGE]: 8,
    [LeaveType.PREGNANT_56]: 56,
    [LeaveType.PREGNANT_28]: 28,
    [LeaveType.PREGNANT_7]: 7,
    [LeaveType.PREGNANT_5]: 5,
    [LeaveType.BEREAVEMENT_8]: 8,
    [LeaveType.BEREAVEMENT_6]: 6,
    [LeaveType.BEREAVEMENT_3]: 3,
}

module.exports = { LeaveStatus, LeaveType, OriginalLeaves }