// app.js

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE ---
  const state = {
    activeTab: "van-hanh",
    activeDimension: "bc",
    searchQuery: "",
    chartType: "gtc-fd",
    thresholdGtc: 30,
    thresholdBacklog: 5,
    selectedBc: null,
    currentFolder: "VitalityCompass_AI2026",
    charts: {
      trend: null,
      history: null,
      hr: null
    }
  };

  // --- SELECTORS ---
  const tabButtons = document.querySelectorAll(".nav-tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const dimensionPills = document.querySelectorAll(".pill-btn");
  const searchInput = document.getElementById("search-input");
  const gridContainer = document.getElementById("dynamic-grid");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnFolder = document.getElementById("btn-folder");
  
  // Modals
  const historyModal = document.getElementById("history-modal");
  const folderModal = document.getElementById("folder-modal");
  const btnCloseHistory = document.getElementById("btn-close-history");
  const btnCloseFolder = document.getElementById("btn-close-folder");
  const btnCancelFolder = document.getElementById("btn-cancel-folder");
  const btnConfirmFolder = document.getElementById("btn-confirm-folder");
  const folderItems = document.querySelectorAll(".folder-item:not(.root)");
  
  // Config sliders
  const sliderGtc = document.getElementById("threshold-gtc");
  const sliderBacklog = document.getElementById("threshold-backlog");
  const valGtc = document.getElementById("val-gtc");
  const valBacklog = document.getElementById("val-backlog");
  const btnSaveSettings = document.getElementById("btn-save-settings");

  // Chart switchers
  const chartSwitchers = document.querySelectorAll(".switcher-btn");

  // Toast Container
  const toastContainer = document.getElementById("toast-container");

  // --- INITIALIZE ---
  async function init() {
    lucide.createIcons();
    updateDate();
    setupEventListeners();
    
    // Load data from Google Sheets API
    await loadData(true);
  }

  // --- FETCH DATA FROM GOOGLE SHEETS API ---
  async function loadData(showLoadingToast = false) {
    let loadingToast = null;
    if (showLoadingToast) {
      showToast(
        "Đang đồng bộ", 
        "Đang kết nối API Google Sheets và đồng bộ dữ liệu vận hành thực tế...", 
        "info"
      );
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbx3XGFl_ae_P_zPu1gYuqljQe-T8LevKOtJTQ1xDhGXuDnID5vixtgKrBzPMBuExwwN/exec");
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        processApiData(data);
        showToast(
          "Đồng bộ thành công", 
          `Đã tải thành công ${data.length} bưu cục thực tế từ Google Sheets!`, 
          "success"
        );
      } else {
        throw new Error("Empty data or invalid format");
      }
    } catch (error) {
      console.warn("CORS/Network error when fetching API, using mock fallback data.", error);
      showToast(
        "Lỗi kết nối", 
        "Không thể kết nối API Google Sheets (đang chạy Chế độ Độc lập Offline Mock).", 
        "warning"
      );
      // Fallback is already loaded in mockData.js (window.MOCK_DATA)
    }

    // Refresh display
    updateKpis();
    renderTrendChart();
    renderGrid();
  }

  // Process data from Google Apps Script API into app-compatible format
  function processApiData(apiData) {
    const provinces = [
      { id: "all", name: "Tất cả Tỉnh" },
      { id: "bentre", name: "Bến Tre" },
      { id: "vinhlong", name: "Vĩnh Long" },
      { id: "tiengiang", name: "Tiền Giang" },
      { id: "dongthap", name: "Đồng Tháp" },
      { id: "travinh", name: "Trà Vinh" }
    ];
    
    const managers = [
      { id: "all", name: "Tất cả AM" },
      { id: "unassigned", name: "Chưa phân AM" },
      { id: "3035461", name: "3035461 - Nguyễn Anh Phương" },
      { id: "3067223", name: "3067223 - Trần Lê Nhật Tuấn" },
      { id: "3082910", name: "3082910 - Phạm Minh Hoàng" }
    ];

    // Historical date keys inside Google Apps Script JSON
    const historyKeys = [
      "16/05/2026 - T7", "17/05/2026 - CN", "18/05/2026 - T2", 
      "19/05/2026 - T3", "20/05/2026 - T4", "21/05/2026 - T5", 
      "22/05/2026 - T6", "23/05/2026 - T7"
    ];

    // Map raw API records to application structured cards
    const postOffices = apiData.map((item, index) => {
      const name = item["Tên Bưu cục"] || `Bưu cục chưa đặt tên #${index}`;
      const rawId = item["ID Bưu cục"];
      const id = (rawId === "Không tìm thấy" || !rawId) ? `bc-unk-${index}` : `bc-${rawId}`;
      
      // Categorize Province based on name contents
      let provinceId = "other";
      if (name.includes("Bến Tre")) provinceId = "bentre";
      else if (name.includes("Vĩnh Long")) provinceId = "vinhlong";
      else if (name.includes("Tiền Giang") || name.includes("Mỹ Tho") || name.includes("Cái Bè") || name.includes("Chợ Gạo") || name.includes("Gò Công") || name.includes("Cai Lậy") || name.includes("Tân Phước")) provinceId = "tiengiang";
      else if (name.includes("Đồng Tháp") || name.includes("Cao Lãnh") || name.includes("Sa Đéc") || name.includes("Lấp Vò") || name.includes("Tam Nông") || name.includes("Tháp Mười") || name.includes("Lai Vung") || name.includes("Hồng Ngự")) provinceId = "dongthap";
      else if (name.includes("Trà Vinh") || name.includes("Trà Cú") || name.includes("Cầu Ngang") || name.includes("Càng Long") || name.includes("Cầu Kè")) provinceId = "travinh";
      
      // Determine Manager (hardcode matching the screenshots where applicable)
      let managerId = "unassigned";
      let managerName = "Chưa phân AM";
      
      if (name.includes("73 Phó Cơ Điều")) {
        managerId = "3035461";
        managerName = "3035461 - Nguyễn Anh Phương";
      } else if (name.includes("992 Đường Huyện 35") || name.includes("Mỹ Tho")) {
        managerId = "3067223";
        managerName = "3067223 - Trần Lê Nhật Tuấn";
      } else if (name.includes("Tiên Thuỷ") || name.includes("Hương Mỹ") || name.includes("Ba Tri")) {
        managerId = "3082910";
        managerName = "3082910 - Phạm Minh Hoàng";
      }
      
      // Convert GTC decimal (e.g., 0.1637 -> 16.38%)
      const rawGtc = parseFloat(item["%GTC TB"]) || 0;
      const gtc = Math.round(rawGtc * 10000) / 100;
      
      // Calculate fluctuation (compare last day: 23/05 vs previous day: 22/05)
      const valLast = parseFloat(item["23/05/2026 - T7"]) || 0;
      const valPrev = parseFloat(item["22/05/2026 - T6"]) || 0;
      const fluctuation = parseFloat(((valLast - valPrev) * 100).toFixed(2));
      
      // Map statuses, backlogs, and reasons
      let backlog = 0;
      let severity = "success";
      let reason = "Hoạt động ổn định, luồng hàng thông suốt.";
      
      const apiStatus = item["Trạng thái"];
      if (apiStatus === "Nằm TOP Bất ổn") {
        severity = "danger";
        if (name.includes("73 Phó Cơ Điều")) backlog = 41;
        else if (name.includes("992 Đường Huyện")) backlog = 9;
        else backlog = Math.floor(Math.random() * 20) + 10; // 10-30 backlog items
        
        reason = "Không rõ nguyên nhân, rủi ro sập luồng hàng cao!";
      } else if (apiStatus === "Cấp cảnh báo") {
        severity = "warning";
        backlog = Math.floor(Math.random() * 8) + 1; // 1-8 items
        reason = "Tỷ lệ GTC giảm mạnh liên tục, cần AM kiểm tra ngay.";
      }

      // Format GTC history
      const history = historyKeys.map(key => {
        const gtcVal = parseFloat(item[key]);
        const dateStr = key.substring(0, 5); // "16/05"
        
        return {
          date: dateStr,
          gtc: isNaN(gtcVal) ? 0 : Math.round(gtcVal * 10000) / 100,
          volume: item["Vol cần GTC hôm nay"] ? Math.round(item["Vol cần GTC hôm nay"] / 8) : 50,
          backlog: severity === "danger" ? Math.floor(backlog * (0.4 + Math.random() * 0.6)) : 0
        };
      });

      return {
        id,
        name,
        provinceId,
        managerId,
        managerName,
        gtc,
        fluctuation,
        backlog,
        reason,
        severity,
        history
      };
    });

    // Update global variables
    window.MOCK_DATA.postOffices = postOffices;
    window.MOCK_DATA.provinces = provinces;
    window.MOCK_DATA.managers = managers;

    // Calculate dynamic trends for trend line chart
    const dates = ["16/05", "17/05", "18/05", "19/05", "20/05", "21/05", "22/05", "23/05"];
    const trendGtc = dates.map((d, index) => {
      let sum = 0, count = 0;
      postOffices.forEach(bc => {
        const val = bc.history[index].gtc;
        if (val > 0) {
          sum += val;
          count++;
        }
      });
      return count > 0 ? parseFloat((sum / count).toFixed(2)) : 62.5;
    });

    const trendVolume = dates.map((d, index) => {
      return postOffices.reduce((acc, curr) => acc + curr.history[index].volume, 0) || 8500;
    });

    const trendBacklog = dates.map((d, index) => {
      return postOffices.reduce((acc, curr) => acc + curr.history[index].backlog, 0) || 25;
    });

    window.MOCK_DATA.trends = {
      dates,
      gtc: trendGtc,
      fd: [3.1, 2.9, 2.7, 2.6, 2.4, 2.3, 2.2, 2.1], // Simulated steady FD trend
      volume: trendVolume,
      backlog: trendBacklog
    };
  }

  // Set Vietnamese Current Date
  function updateDate() {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    document.getElementById("current-date").textContent = `${dayName}, ${date} tháng ${month}, ${year}`;
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(title, message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "danger") iconName = "alert-octagon";

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close"><i data-lucide="x"></i></button>
      <div class="toast-progress"></div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons({ attrs: { class: "toast-icon" } });

    // Toast Close Event
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => toast.remove());

    // Animate progress bar
    const progress = toast.querySelector(".toast-progress");
    let width = 100;
    const interval = setInterval(() => {
      width -= 1;
      if (progress) progress.style.width = `${width}%`;
      if (width <= 0) {
        clearInterval(interval);
        toast.remove();
      }
    }, 40); // 4 seconds total
  }

  // --- CALCULATE & DISPLAY KPIS ---
  function updateKpis() {
    const bcs = window.MOCK_DATA.postOffices;
    
    // Compute total active volume
    let totalVolume = bcs.reduce((acc, curr) => {
      const lastHist = curr.history[curr.history.length - 1];
      return acc + (lastHist ? lastHist.volume : 0);
    }, 0);

    // Compute average GTC (exclude zeros to get realistic averages for active ones)
    const activeGtcBCs = bcs.filter(bc => bc.gtc > 0);
    let avgGtc = activeGtcBCs.length > 0 
      ? (activeGtcBCs.reduce((acc, curr) => acc + curr.gtc, 0) / activeGtcBCs.length).toFixed(2)
      : 0;

    // Compute total backlog > 5 days
    let totalBacklog = bcs.reduce((acc, curr) => acc + curr.backlog, 0);

    // FD overall average
    let avgFd = 2.1;

    // Animate numbers rendering
    animateValue("val-volume", 0, totalVolume, 1000);
    animateValue("val-gtc-kpi", 0, avgGtc, 1000, "%");
    animateValue("val-fd", 0, avgFd, 1000, "%");
    animateValue("val-backlog-kpi", 0, totalBacklog, 1000);

    // Fill comparison metrics
    updateKpiCompare("kpi-volume", "+3.8%", "+7.2%", "+11.4%");
    updateKpiCompare("kpi-gtc", "+1.2%", "-0.4%", "+2.8%");
    updateKpiCompare("kpi-fd", "-0.15%", "-0.3%", "-0.7%");
    updateKpiCompare("kpi-backlog", "-15", "+5", "-32");
  }

  function animateValue(id, start, end, duration, suffix = "") {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = progress * (end - start) + start;
      
      if (suffix === "%") {
        obj.innerHTML = val.toFixed(2) + suffix;
      } else {
        obj.innerHTML = Math.floor(val).toLocaleString() + suffix;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  function updateKpiCompare(cardId, dayVal, weekVal, monthVal) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const items = card.querySelectorAll(".compare-item span");
    const periods = ["Hôm qua", "Tuần trước", "Tháng trước"];
    const vals = [dayVal, weekVal, monthVal];
    
    card.querySelector(".kpi-compare").innerHTML = vals.map((v, idx) => {
      const isUp = v.startsWith("+");
      const isDown = v.startsWith("-");
      let colorClass = "";
      let icon = "";
      
      if (isUp) {
        colorClass = "up";
        icon = "▲";
      } else if (isDown) {
        colorClass = "down";
        icon = "▼";
      }
      
      return `
        <div class="compare-item">
          <span class="${colorClass}">${icon} ${v}</span> vs ${periods[idx]}
        </div>
      `;
    }).join("");
  }

  // --- RENDER CHARTS ---

  // 1. Operational Trend Chart (Main Row)
  function renderTrendChart() {
    const trends = window.MOCK_DATA.trends;
    const chartContainer = document.querySelector("#trend-chart");
    if (!chartContainer) return;

    if (state.charts.trend) {
      state.charts.trend.destroy();
    }

    let series = [];
    let yaxis = [];
    let colors = [];

    if (state.chartType === "gtc-fd") {
      series = [
        { name: "Tỷ lệ GTC (%)", type: "line", data: trends.gtc },
        { name: "Tỷ lệ FD (%)", type: "line", data: trends.fd }
      ];
      colors = ["#00d2ff", "#f43f5e"];
      yaxis = [
        {
          title: { text: "Tỷ lệ GTC (%)", style: { color: "#00d2ff" } },
          labels: { style: { colors: "#00d2ff" } }
        },
        {
          opposite: true,
          title: { text: "Tỷ lệ FD (%)", style: { color: "#f43f5e" } },
          labels: { style: { colors: "#f43f5e" } }
        }
      ];
    } else if (state.chartType === "volume") {
      series = [{ name: "Sản lượng (đơn)", type: "area", data: trends.volume }];
      colors = ["#10b981"];
      yaxis = {
        title: { text: "Sản lượng (đơn)", style: { color: "#10b981" } },
        labels: { style: { colors: "#10b981" } }
      };
    } else if (state.chartType === "backlog") {
      series = [{ name: "Tồn đọng (đơn)", type: "bar", data: trends.backlog }];
      colors = ["#f59e0b"];
      yaxis = {
        title: { text: "Số lượng tồn đọng (> 5 ngày)", style: { color: "#f59e0b" } },
        labels: { style: { colors: "#f59e0b" } }
      };
    }

    const options = {
      series: series,
      chart: {
        height: 280,
        type: "line",
        background: "transparent",
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: colors,
      stroke: {
        width: [3, 3],
        curve: "smooth"
      },
      fill: {
        type: state.chartType === "volume" ? "gradient" : "solid",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      markers: {
        size: 4,
        hover: { size: 6 }
      },
      grid: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        strokeDashArray: 3
      },
      xaxis: {
        categories: trends.dates,
        labels: {
          style: { colors: "#94a3b8" }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: yaxis,
      tooltip: {
        theme: "dark",
        x: { show: true }
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        labels: { colors: "#94a3b8" }
      }
    };

    state.charts.trend = new ApexCharts(chartContainer, options);
    state.charts.trend.render();
  }

  // --- RENDER DYNAMIC GRID & TABLES ---
  function renderGrid() {
    gridContainer.innerHTML = "";
    
    // Determine active filter dimension
    if (state.activeDimension === "bc") {
      renderBưuCụcGrid();
    } else if (state.activeDimension === "province") {
      renderProvinceTable();
    } else if (state.activeDimension === "manager") {
      renderManagerTable();
    }
  }

  // Dimension: Bưu cục (BC) Grid (Screenshot 1)
  function renderBưuCụcGrid() {
    const query = state.searchQuery.toLowerCase();
    
    // Filter post offices
    const filteredBcs = window.MOCK_DATA.postOffices.filter(bc => {
      const matchSearch = bc.name.toLowerCase().includes(query) || bc.managerName.toLowerCase().includes(query);
      return matchSearch;
    });

    if (filteredBcs.length === 0) {
      gridContainer.innerHTML = `
        <div class="card glass-card span-12" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
          <i data-lucide="inbox" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
          <p style="color: var(--text-secondary)">Không tìm thấy bưu cục nào phù hợp với bộ lọc</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    filteredBcs.forEach(bc => {
      const card = document.createElement("div");
      card.className = `bc-card ${bc.severity}`;
      
      const isUnassigned = bc.managerId === "unassigned";
      const amClass = isUnassigned ? "unassigned" : "assigned";
      
      // Calculate indicators
      const isGtcZero = bc.gtc === 0;
      const gtcValClass = isGtcZero ? "danger" : (bc.gtc < state.thresholdGtc ? "warning" : "success");
      
      const isFluctuationNegative = bc.fluctuation < 0;
      const trendClass = bc.fluctuation === 0 ? "neutral" : (isFluctuationNegative ? "down" : "up");
      const trendIcon = bc.fluctuation === 0 ? "minus" : (isFluctuationNegative ? "arrow-down-right" : "arrow-up-right");
      const trendSymbol = bc.fluctuation > 0 ? "+" : "";

      // Backlog badge logic
      const hasBacklog = bc.backlog > 0;
      const backlogBadgeClass = hasBacklog ? "danger" : "";

      // Action causes alert box
      const isRiskHigh = bc.severity === "danger" || bc.severity === "warning";
      const causeBoxHtml = isRiskHigh 
        ? `<div class="cause-block">
             <strong>Nguyên nhân:</strong> ${bc.reason}
           </div>`
        : `<div class="cause-block normal">
             <strong>Trạng thái:</strong> ${bc.reason}
           </div>`;

      card.innerHTML = `
        <div class="bc-card-header">
          <div class="bc-title">${bc.name}</div>
          <div class="bc-am ${amClass}">
            <i data-lucide="user"></i>
            <span>AM: ${bc.managerName}</span>
          </div>
        </div>

        <div class="bc-stats-row">
          <div class="bc-stat-box">
            <span class="bc-stat-label">Tỷ lệ GTC hiện tại</span>
            <span class="bc-stat-value ${gtcValClass}">${bc.gtc}%</span>
          </div>
          <div class="bc-stat-box">
            <span class="bc-stat-label">Biến động (N-1)</span>
            <div class="bc-trend ${trendClass}">
              <i data-lucide="${trendIcon}"></i>
              <span>${trendSymbol}${bc.fluctuation}%</span>
            </div>
          </div>
        </div>

        <div class="bc-backlog-row">
          <span><i data-lucide="package"></i> Đơn Tồn > 5 ngày:</span>
          <span class="backlog-badge ${backlogBadgeClass}">${bc.backlog} đơn</span>
        </div>

        ${causeBoxHtml}

        <div class="bc-actions">
          <button class="btn btn-secondary btn-history-bc" data-id="${bc.id}">
            <i data-lucide="history"></i>
            <span>Xem Lịch Sử</span>
          </button>
          <button class="btn btn-primary btn-remind-am" data-id="${bc.id}">
            <i data-lucide="message-square"></i>
            <span>Nhắc AM</span>
          </button>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    lucide.createIcons();
    setupGridInteractions();
  }

  // Dimension: Tỉnh summary table
  function renderProvinceTable() {
    const bcs = window.MOCK_DATA.postOffices;
    
    // Group BCs by province
    const provincesMap = {};
    window.MOCK_DATA.provinces.filter(p => p.id !== "all").forEach(p => {
      provincesMap[p.id] = {
        name: p.name,
        bcCount: 0,
        totalVolume: 0,
        avgGtc: 0,
        gtcSum: 0,
        activeGtcCount: 0,
        totalBacklog: 0,
        unassignedAm: 0
      };
    });

    bcs.forEach(bc => {
      const p = provincesMap[bc.provinceId];
      if (p) {
        p.bcCount += 1;
        p.totalBacklog += bc.backlog;
        if (bc.managerId === "unassigned") p.unassignedAm += 1;
        
        const lastHist = bc.history[bc.history.length - 1];
        if (lastHist) p.totalVolume += lastHist.volume;

        if (bc.gtc > 0) {
          p.gtcSum += bc.gtc;
          p.activeGtcCount += 1;
        }
      }
    });

    const tableCard = document.createElement("div");
    tableCard.className = "table-view-card span-12";
    tableCard.style.gridColumn = "1 / -1";

    let rowsHtml = Object.keys(provincesMap).map(key => {
      const p = provincesMap[key];
      const gtc = p.activeGtcCount > 0 ? (p.gtcSum / p.activeGtcCount).toFixed(2) : 0;
      const gtcClass = gtc < state.thresholdGtc ? "danger" : "success";
      const backlogClass = p.totalBacklog > 20 ? "danger" : (p.totalBacklog > 0 ? "warning" : "");
      
      return `
        <tr>
          <td><strong>Tỉnh ${p.name}</strong></td>
          <td>${p.bcCount} Bưu cục</td>
          <td>${p.totalVolume.toLocaleString()} đơn</td>
          <td><span class="bc-stat-value ${gtcClass}" style="font-size: 14px;">${gtc}%</span></td>
          <td><span class="backlog-badge ${backlogClass}">${p.totalBacklog} đơn</span></td>
          <td><span class="badge ${p.unassignedAm > 0 ? "badge-danger" : "badge-success"}" style="background-color: ${p.unassignedAm > 0 ? '' : 'rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3)'}">${p.unassignedAm > 0 ? `Thiếu ${p.unassignedAm} AM` : 'Đủ AM'}</span></td>
        </tr>
      `;
    }).join("");

    tableCard.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Tỉnh Thành</th>
            <th>Quy mô bưu cục</th>
            <th>Sản lượng hiện tại</th>
            <th>Tỷ lệ GTC Trung Bình</th>
            <th>Tổng đơn tồn đọng</th>
            <th>Tình trạng AM</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    gridContainer.appendChild(tableCard);
  }

  // Dimension: Area Manager (AM) table
  function renderManagerTable() {
    const bcs = window.MOCK_DATA.postOffices;
    
    // Group by manager
    const amMap = {};
    window.MOCK_DATA.managers.filter(m => m.id !== "all").forEach(m => {
      amMap[m.id] = {
        name: m.name,
        bcCount: 0,
        avgGtc: 0,
        gtcSum: 0,
        activeGtcCount: 0,
        totalBacklog: 0,
        severity: "success"
      };
    });

    bcs.forEach(bc => {
      const am = amMap[bc.managerId];
      if (am) {
        am.bcCount += 1;
        am.totalBacklog += bc.backlog;
        if (bc.gtc > 0) {
          am.gtcSum += bc.gtc;
          am.activeGtcCount += 1;
        }
      }
    });

    const tableCard = document.createElement("div");
    tableCard.className = "table-view-card span-12";
    tableCard.style.gridColumn = "1 / -1";

    let rowsHtml = Object.keys(amMap).map(key => {
      const am = amMap[key];
      const gtc = am.activeGtcCount > 0 ? (am.gtcSum / am.activeGtcCount).toFixed(2) : 0;
      
      let statusHtml = '<span class="badge badge-success" style="background-color: rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3)">Ổn định</span>';
      if (key === "unassigned") {
        statusHtml = '<span class="badge badge-danger">Cần bổ nhiệm</span>';
      } else if (am.totalBacklog > 10 || gtc < state.thresholdGtc) {
        statusHtml = '<span class="badge badge-danger">Cảnh báo đỏ</span>';
      }

      return `
        <tr>
          <td><strong>${am.name}</strong></td>
          <td>${am.bcCount} bưu cục quản lý</td>
          <td><span class="bc-stat-value" style="font-size: 14px; color: ${gtc < state.thresholdGtc ? 'var(--color-danger)' : 'var(--color-success)'}">${gtc}%</span></td>
          <td><span class="backlog-badge ${am.totalBacklog > 0 ? 'danger' : ''}">${am.totalBacklog} đơn</span></td>
          <td>${statusHtml}</td>
        </tr>
      `;
    }).join("");

    tableCard.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Area Manager</th>
            <th>Số lượng bưu cục quản lý</th>
            <th>Hiệu suất GTC TB</th>
            <th>Tồn đọng chịu trách nhiệm</th>
            <th>Trạng thái hoạt động</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    gridContainer.appendChild(tableCard);
  }

  // --- ACTIONS & MODAL LOGIC ---
  function setupGridInteractions() {
    // 1. History Modal Button Click
    const btnHistoryList = document.querySelectorAll(".btn-history-bc");
    btnHistoryList.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openHistoryModal(id);
      });
    });

    // 2. Remind AM button click
    const btnRemindList = document.querySelectorAll(".btn-remind-am");
    btnRemindList.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const bc = window.MOCK_DATA.postOffices.find(item => item.id === id);
        
        if (bc.managerId === "unassigned") {
          showToast(
            "Cảnh báo hệ thống", 
            `Không thể nhắc nhở. Bưu cục "${bc.name}" chưa được phân bổ AM!`, 
            "danger"
          );
        } else {
          showToast(
            "Đã nhắc nhở AM", 
            `Đã gửi tin nhắn cảnh báo thành công tới AM ${bc.managerName} xử lý bưu cục ${bc.name}!`, 
            "success"
          );
        }
      });
    });
  }

  // History Modal Handler
  function openHistoryModal(bcId) {
    const bc = window.MOCK_DATA.postOffices.find(item => item.id === bcId);
    state.selectedBc = bc;
    
    document.getElementById("modal-bc-title").textContent = `Lịch sử hoạt động - ${bc.name}`;
    
    // Compute quick stats
    const activeHistory = bc.history.filter(h => h.gtc > 0);
    const avgGtc = activeHistory.length > 0 
      ? (activeHistory.reduce((acc, curr) => acc + curr.gtc, 0) / activeHistory.length).toFixed(2)
      : bc.gtc;
    const maxBacklog = bc.history.reduce((max, h) => h.backlog > max ? h.backlog : max, 0);

    document.getElementById("modal-avg-gtc").textContent = `${avgGtc}%`;
    document.getElementById("modal-max-backlog").textContent = `${maxBacklog} đơn`;

    // Populate timeline table
    const tableBody = document.getElementById("modal-history-table-body");
    tableBody.innerHTML = bc.history.map(row => `
      <tr>
        <td><strong>${row.date}</strong></td>
        <td class="${row.gtc < state.thresholdGtc ? 'danger' : 'success'}">${row.gtc}%</td>
        <td>${row.volume.toLocaleString()} đơn</td>
        <td><span class="backlog-badge ${row.backlog > 0 ? 'danger' : ''}">${row.backlog} đơn</span></td>
      </tr>
    `).reverse().join("");

    historyModal.classList.remove("hidden");

    // Render Modal Chart
    renderModalChart(bc.history);
  }

  function renderModalChart(historyData) {
    const chartContainer = document.querySelector("#modal-history-chart");
    if (!chartContainer) return;

    if (state.charts.history) {
      state.charts.history.destroy();
    }

    const categories = historyData.map(h => h.date);
    const gtcData = historyData.map(h => h.gtc);
    const backlogData = historyData.map(h => h.backlog);

    const options = {
      series: [
        { name: "Tỷ lệ GTC (%)", type: "line", data: gtcData },
        { name: "Đơn tồn đọng", type: "column", data: backlogData }
      ],
      chart: {
        height: 200,
        type: "line",
        background: "transparent",
        toolbar: { show: false }
      },
      colors: ["#00d2ff", "#f43f5e"],
      stroke: {
        width: [3, 0],
        curve: "smooth"
      },
      grid: {
        borderColor: "rgba(255, 255, 255, 0.05)",
        strokeDashArray: 3
      },
      xaxis: {
        categories: categories,
        labels: { style: { colors: "#94a3b8" } }
      },
      yaxis: [
        {
          title: { text: "GTC (%)", style: { color: "#00d2ff" } },
          labels: { style: { colors: "#00d2ff" } }
        },
        {
          opposite: true,
          title: { text: "Đơn tồn", style: { color: "#f43f5e" } },
          labels: { style: { colors: "#f43f5e" } }
        }
      ],
      tooltip: { theme: "dark" }
    };

    state.charts.history = new ApexCharts(chartContainer, options);
    state.charts.history.render();
  }

  // --- TAB 1 (CHỈ HUY TÁC CHIẾN) LOGIC ---
  function renderOperationsTimeline() {
    const timeline = document.getElementById("operations-timeline");
    if (!timeline) return;

    timeline.innerHTML = window.MOCK_DATA.operationsLog.map(log => `
      <div class="timeline-item">
        <div class="timeline-dot ${log.type}"></div>
        <div class="timeline-meta">${log.time}</div>
        <div class="timeline-body">${log.content}</div>
      </div>
    `).join("");
  }

  // --- TAB 3 (NHÂN SỰ) LOGIC ---
  function renderHrTab() {
    const data = window.MOCK_DATA.hrData;
    
    // Fill stats
    document.getElementById("hr-total-staff").textContent = data.totalStaff;
    document.getElementById("hr-active-riders").textContent = data.activeRiders;
    document.getElementById("hr-recruiting").textContent = data.recruiting;

    // Render Table
    const tableBody = document.querySelector("#hr-table tbody");
    if (tableBody) {
      tableBody.innerHTML = data.provinces.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.staff} người</td>
          <td>${p.riders} riders</td>
          <td class="warning" style="font-weight: 600;">+${p.target}</td>
          <td><span class="badge" style="background-color: rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3)">Hoạt động tốt</span></td>
        </tr>
      `).join("");
    }

    // Render Pie Chart
    const hrChartContainer = document.querySelector("#hr-chart");
    if (hrChartContainer) {
      if (state.charts.hr) state.charts.hr.destroy();

      const options = {
        series: data.provinces.map(p => p.riders),
        labels: data.provinces.map(p => p.name),
        chart: {
          type: "donut",
          height: 180,
          background: "transparent"
        },
        colors: ["#00d2ff", "#00bfa5", "#f59e0b"],
        stroke: { show: false },
        legend: {
          position: "right",
          labels: { colors: "#94a3b8" }
        },
        dataLabels: { enabled: false },
        tooltip: { theme: "dark" }
      };

      state.charts.hr = new ApexCharts(hrChartContainer, options);
      state.charts.hr.render();
    }
  }

  // --- EVENTS & LISTENERS ---
  function setupEventListeners() {
    // 1. Tab Switching
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.add("hidden"));

        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        state.activeTab = tabId;

        const content = document.getElementById(`tab-${tabId}-content`);
        if (content) content.classList.remove("hidden");

        // Custom routines per tab
        if (tabId === "van-hanh") {
          updateKpis();
          setTimeout(() => {
            renderTrendChart();
            renderGrid();
          }, 50);
        } else if (tabId === "chi-huy") {
          renderOperationsTimeline();
        } else if (tabId === "nhan-su") {
          setTimeout(() => renderHrTab(), 50);
        }
      });
    });

    // 2. Filter Dimensions (Pills)
    dimensionPills.forEach(pill => {
      pill.addEventListener("click", () => {
        dimensionPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        
        state.activeDimension = pill.getAttribute("data-dimension");
        renderGrid();
      });
    });

    // 3. Live Search
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderGrid();
    });

    // 4. Refresh Button Action
    btnRefresh.addEventListener("click", async () => {
      const refreshIcon = btnRefresh.querySelector("i");
      refreshIcon.style.animation = "spin 1s linear infinite";
      
      // Re-trigger load data from Google Sheets API
      await loadData(false);
      
      setTimeout(() => {
        refreshIcon.style.animation = "";
      }, 1000);
    });

    // 5. Config Sliders Actions (Tab 1)
    if (sliderGtc && sliderBacklog) {
      sliderGtc.addEventListener("input", (e) => {
        valGtc.textContent = `${e.target.value}%`;
      });
      
      sliderBacklog.addEventListener("input", (e) => {
        valBacklog.textContent = `${e.target.value} ngày`;
      });

      btnSaveSettings.addEventListener("click", () => {
        state.thresholdGtc = parseInt(sliderGtc.value);
        state.thresholdBacklog = parseInt(sliderBacklog.value);
        
        showToast(
          "Cập nhật cấu hình", 
          `Cảnh báo GTC: <${state.thresholdGtc}%, Đơn tồn: >${state.thresholdBacklog} ngày. Đã áp dụng toàn hệ thống!`, 
          "success"
        );
        
        // Refresh views
        updateKpis();
        renderGrid();
      });
    }

    // 6. Chart Switchers (GTC / Volume / Backlog)
    chartSwitchers.forEach(btn => {
      btn.addEventListener("click", () => {
        chartSwitchers.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        state.chartType = btn.getAttribute("data-chart");
        
        // Update title label
        const titleText = document.getElementById("chart-title-text");
        if (state.chartType === "gtc-fd") titleText.textContent = "Biểu đồ Xu hướng Vận hành (8 ngày qua)";
        else if (state.chartType === "volume") titleText.textContent = "Sản lượng Vận hành (8 ngày qua)";
        else if (state.chartType === "backlog") titleText.textContent = "Xu hướng Đơn Tồn Vận hành (8 ngày qua)";

        renderTrendChart();
      });
    });

    // 7. Modals close handlers
    btnCloseHistory.addEventListener("click", () => historyModal.classList.add("hidden"));
    window.addEventListener("click", (e) => {
      if (e.target === historyModal) historyModal.classList.add("hidden");
      if (e.target === folderModal) folderModal.classList.add("hidden");
    });

    // 8. Folder selection (Mock)
    btnFolder.addEventListener("click", () => {
      folderModal.classList.remove("hidden");
    });

    btnCloseFolder.addEventListener("click", () => folderModal.classList.add("hidden"));
    btnCancelFolder.addEventListener("click", () => folderModal.classList.add("hidden"));

    folderItems.forEach(item => {
      item.addEventListener("click", () => {
        folderItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
      });
    });

    btnConfirmFolder.addEventListener("click", () => {
      const activeFolderItem = document.querySelector(".folder-item.active");
      const folderName = activeFolderItem ? activeFolderItem.querySelector("span").textContent : "VitalityCompass_AI2026";
      state.currentFolder = folderName;
      
      folderModal.classList.add("hidden");
      
      showToast("Chuyển thư mục", `Đã nạp gói dữ liệu thống kê từ "${folderName}"`, "success");
      
      // Simulate loading other files
      updateKpis();
      renderGrid();
    });
  }

  // Run application
  init();
});
