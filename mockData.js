// mockData.js
// Structured mock data representing the logistics metrics for Provinces, AMs, and BCs (Bưu cục).

window.MOCK_DATA = {
  provinces: [
    { id: "all", name: "Tất cả Tỉnh" },
    { id: "bentre", name: "Bến Tre" },
    { id: "vinhlong", name: "Vĩnh Long" },
    { id: "tiengiang", name: "Tiền Giang" }
  ],
  
  managers: [
    { id: "all", name: "Tất cả AM" },
    { id: "unassigned", name: "Chưa phân AM" },
    { id: "3035461", name: "3035461 - Nguyễn Anh Phương" },
    { id: "3067223", name: "3067223 - Trần Lê Nhật Tuấn" },
    { id: "3082910", name: "3082910 - Phạm Minh Hoàng" }
  ],

  // General KPIs (Overall initial stats, will calculate dynamically in app.js based on filters)
  kpis: {
    volume: {
      value: 12450,
      vsYesterday: "+4.2%",
      vsLastWeek: "+8.5%",
      vsLastMonth: "+12.1%"
    },
    gtc: {
      value: "68.5%",
      vsYesterday: "+1.2%",
      vsLastWeek: "-0.5%",
      vsLastMonth: "+3.4%"
    },
    fd: {
      value: "2.1%",
      vsYesterday: "-0.1%",
      vsLastWeek: "-0.3%",
      vsLastMonth: "-0.8%"
    },
    backlog: {
      value: 50,
      vsYesterday: "-12",
      vsLastWeek: "+4",
      vsLastMonth: "-28"
    }
  },

  // Historical data for 8 days to feed into charts
  trends: {
    dates: ["17/05", "18/05", "19/05", "20/05", "21/05", "22/05", "23/05", "24/05"],
    gtc: [62.4, 63.8, 65.1, 64.9, 66.2, 67.5, 68.0, 68.5],
    fd: [3.2, 3.0, 2.9, 2.7, 2.5, 2.4, 2.2, 2.1],
    volume: [11200, 11500, 11900, 11800, 12100, 12300, 12000, 12450],
    backlog: [78, 72, 68, 85, 90, 64, 55, 50]
  },

  // Detailed post office (Bưu cục - BC) list
  postOffices: [
    {
      id: "bc89",
      name: "BC 89 Nguyễn Thị Định-TP.Bến Tre",
      provinceId: "bentre",
      managerId: "unassigned",
      managerName: "Chưa phân AM",
      gtc: 0,
      fluctuation: 0,
      backlog: 0,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "danger",
      history: [
        { date: "20/05", gtc: 0, volume: 0, backlog: 0 },
        { date: "21/05", gtc: 0, volume: 0, backlog: 0 },
        { date: "22/05", gtc: 0, volume: 0, backlog: 0 },
        { date: "23/05", gtc: 0, volume: 0, backlog: 0 },
        { date: "24/05", gtc: 0, volume: 0, backlog: 0 }
      ]
    },
    {
      id: "bc73",
      name: "BC 73 Phó Cơ Điều-Phường Phước Hậu-Vĩnh Long",
      provinceId: "vinhlong",
      managerId: "3035461",
      managerName: "3035461 - Nguyễn Anh Phương",
      gtc: 13.42,
      fluctuation: -0.5,
      backlog: 41,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "danger",
      history: [
        { date: "20/05", gtc: 15.2, volume: 340, backlog: 30 },
        { date: "21/05", gtc: 14.8, volume: 310, backlog: 35 },
        { date: "22/05", gtc: 14.1, volume: 290, backlog: 38 },
        { date: "23/05", gtc: 13.9, volume: 280, backlog: 40 },
        { date: "24/05", gtc: 13.42, volume: 250, backlog: 41 }
      ]
    },
    {
      id: "bcql57",
      name: "BC QL57 KP3-Thị Trấn Chợ Lách-Bến Tre",
      provinceId: "bentre",
      managerId: "unassigned",
      managerName: "Chưa phân AM",
      gtc: 14.12,
      fluctuation: -12.55,
      backlog: 0,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "danger",
      history: [
        { date: "20/05", gtc: 26.67, volume: 120, backlog: 2 },
        { date: "21/05", gtc: 22.10, volume: 110, backlog: 1 },
        { date: "22/05", gtc: 19.30, volume: 90, backlog: 0 },
        { date: "23/05", gtc: 15.50, volume: 80, backlog: 0 },
        { date: "24/05", gtc: 14.12, volume: 75, backlog: 0 }
      ]
    },
    {
      id: "bcql53lh",
      name: "BC Quốc Lộ 53-Long Hồ-Vĩnh Long",
      provinceId: "vinhlong",
      managerId: "unassigned",
      managerName: "Chưa phân AM",
      gtc: 25.18,
      fluctuation: 3.82,
      backlog: 0,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "warning",
      history: [
        { date: "20/05", gtc: 21.36, volume: 410, backlog: 0 },
        { date: "21/05", gtc: 22.45, volume: 430, backlog: 0 },
        { date: "22/05", gtc: 23.10, volume: 450, backlog: 0 },
        { date: "23/05", gtc: 24.02, volume: 440, backlog: 0 },
        { date: "24/05", gtc: 25.18, volume: 480, backlog: 0 }
      ]
    },
    {
      id: "bc992",
      name: "BC 992 Đường Huyện 35-Vĩnh Kim-Châu Thành-Tiền Giang",
      provinceId: "tiengiang",
      managerId: "3067223",
      managerName: "3067223 - Trần Lê Nhật Tuấn",
      gtc: 28.04,
      fluctuation: 4.1,
      backlog: 9,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "danger",
      history: [
        { date: "20/05", gtc: 23.94, volume: 180, backlog: 12 },
        { date: "21/05", gtc: 24.50, volume: 190, backlog: 10 },
        { date: "22/05", gtc: 25.30, volume: 195, backlog: 11 },
        { date: "23/05", gtc: 26.80, volume: 200, backlog: 8 },
        { date: "24/05", gtc: 28.04, volume: 210, backlog: 9 }
      ]
    },
    {
      id: "bcql53xt",
      name: "BC Quốc Lộ 53-Xã Trung Thành-Vĩnh Long",
      provinceId: "vinhlong",
      managerId: "unassigned",
      managerName: "Chưa phân AM",
      gtc: 30.21,
      fluctuation: -6.55,
      backlog: 0,
      reason: "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!",
      severity: "warning",
      history: [
        { date: "20/05", gtc: 36.76, volume: 320, backlog: 0 },
        { date: "21/05", gtc: 34.20, volume: 310, backlog: 0 },
        { date: "22/05", gtc: 32.10, volume: 330, backlog: 0 },
        { date: "23/05", gtc: 31.50, volume: 300, backlog: 0 },
        { date: "24/05", gtc: 30.21, volume: 315, backlog: 0 }
      ]
    },
    // Adding extra records for richer demo experience
    {
      id: "bc_mytho",
      name: "BC Phường 4-Mỹ Tho-Tiền Giang",
      provinceId: "tiengiang",
      managerId: "3067223",
      managerName: "3067223 - Trần Lê Nhật Tuấn",
      gtc: 72.15,
      fluctuation: 2.30,
      backlog: 0,
      reason: "Hoạt động ổn định, luồng hàng thông suốt.",
      severity: "success",
      history: [
        { date: "20/05", gtc: 69.85, volume: 600, backlog: 0 },
        { date: "21/05", gtc: 70.10, volume: 610, backlog: 0 },
        { date: "22/05", gtc: 71.05, volume: 630, backlog: 0 },
        { date: "23/05", gtc: 71.50, volume: 640, backlog: 0 },
        { date: "24/05", gtc: 72.15, volume: 650, backlog: 0 }
      ]
    },
    {
      id: "bc_bentresouth",
      name: "BC Hàm Luông-Chợ Lách-Bến Tre",
      provinceId: "bentre",
      managerId: "3082910",
      managerName: "3082910 - Phạm Minh Hoàng",
      gtc: 81.50,
      fluctuation: 1.45,
      backlog: 0,
      reason: "Hoạt động tối ưu, tỷ lệ giao hàng đạt chỉ tiêu đề ra.",
      severity: "success",
      history: [
        { date: "20/05", gtc: 80.05, volume: 450, backlog: 0 },
        { date: "21/05", gtc: 80.20, volume: 460, backlog: 0 },
        { date: "22/05", gtc: 80.90, volume: 480, backlog: 0 },
        { date: "23/05", gtc: 81.05, volume: 470, backlog: 0 },
        { date: "24/05", gtc: 81.50, volume: 490, backlog: 0 }
      ]
    }
  ],

  // Extra features like simulated action log for "Chỉ huy Tác chiến" tab
  operationsLog: [
    { time: "18:20", content: "Hệ thống phát hiện tồn đọng tăng tại BC 73 Phó Cơ Điều", type: "error" },
    { time: "18:05", content: "AM Trần Lê Nhật Tuấn cập nhật trạng thái BC 992 Đường Huyện 35", type: "info" },
    { time: "17:45", content: "Gửi nhắc nhở tự động (AI) đến AM Nguyễn Anh Phương về BC 73", type: "warning" },
    { time: "17:15", content: "BC Hàm Luông hoàn thành 100% ca giao chiều", type: "success" },
    { time: "16:30", content: "Tỷ lệ GTC toàn tỉnh Vĩnh Long giảm 1.2% so với sáng nay", type: "warning" }
  ],

  // Recruitment/HR data for "Nhân sự & Tuyển dụng" tab
  hrData: {
    totalStaff: 142,
    activeRiders: 118,
    recruiting: 12,
    provinces: [
      { name: "Bến Tre", staff: 45, riders: 38, target: 5 },
      { name: "Vĩnh Long", staff: 58, riders: 48, target: 4 },
      { name: "Tiền Giang", staff: 39, riders: 32, target: 3 }
    ]
  }
};
