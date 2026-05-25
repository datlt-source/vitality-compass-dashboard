import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("Báo cáo Vận hành");
  const [activeGroup, setActiveGroup] = useState("Bưu cục (BC)");

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbx3XGFl_ae_P_zPu1gYuqljQe-T8LevKOtJTQ1xDhGXuDnID5vixtgKrBzPMBuExwwN/exec"
    )
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      })
      .catch((err) => console.log(err));
  }, []);

  const dateKeys = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter((key) => /^\d{2}\/\d{2}\/\d{4}/.test(key));
  }, [data]);

  const totalVolume = useMemo(
    () =>
      data.reduce(
        (sum, item) => sum + Number(item["Vol cần GTC hôm nay"] || 0),
        0
      ),
    [data]
  );

  const averageGtc = useMemo(
    () =>
      data.length
        ? data.reduce(
            (sum, item) => sum + Number(item["%GTC TB"] || 0),
            0
          ) / data.length
        : 0,
    [data]
  );

  const averageLogic = useMemo(
    () =>
      data.length
        ? data.reduce(
            (sum, item) => sum + Number(item["Logic: So sánh"] || 0),
            0
          ) / data.length
        : 0,
    [data]
  );

  const unstableCount = useMemo(
    () =>
      data.filter((item) =>
        item["Trạng thái"]?.toLowerCase().includes("bất ổn")
      ).length,
    [data]
  );

  const trends = useMemo(
    () =>
      dateKeys.map((key) =>
        data.reduce((sum, item) => sum + Number(item[key] || 0), 0) /
        Math.max(data.length, 1)
      ),
    [data, dateKeys]
  );

  const chartPoints = useMemo(() => {
    if (!trends.length) return "";
    const max = Math.max(...trends);
    const min = Math.min(...trends);
    return trends
      .map((value, index) => {
        const x = 40 + index * 70;
        const y = max === min ? 140 : 40 + ((max - value) / (max - min)) * 120;
        return `${x},${y}`;
      })
      .join(" ");
  }, [trends]);

  const highlights = useMemo(() => {
    if (!data.length) return [];
    return [...data]
      .sort(
        (a, b) => Number(b["%GTC TB"] || 0) - Number(a["%GTC TB"] || 0)
      )
      .slice(0, 2);
  }, [data]);

  const lowlights = useMemo(() => {
    if (!data.length) return [];
    return [...data]
      .sort(
        (a, b) => Number(a["%GTC TB"] || 0) - Number(b["%GTC TB"] || 0)
      )
      .slice(0, 2);
  }, [data]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="page-tag">TỔNG QUAN VÙNG ĐCL</p>
          <h1>Dashboard Vận hành</h1>
          <p className="page-note">Dữ liệu thời gian thực từ nguồn báo cáo vận hành</p>
        </div>
        <div className="top-actions">
          <button className="btn btn-light">Làm mới</button>
          <button className="btn btn-accent">Đổi thư mục</button>
        </div>
      </header>

      <div className="tabs">
        {[
          "Chỉ huy Tác chiến",
          "Báo cáo Vận hành",
          "Nhân sự & Tuyển dụng",
        ].map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Sản lượng (volume)</p>
          <h2>{totalVolume.toLocaleString()}</h2>
          <p className="stat-subtitle">Tổng số yêu cầu cần GTC hôm nay</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Tỷ lệ GTC TB</p>
          <h2>{(averageGtc * 100).toFixed(2)}%</h2>
          <p className="stat-subtitle">Giá trị trung bình theo bưu cục</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Logic so sánh</p>
          <h2>{(averageLogic * 100).toFixed(2)}%</h2>
          <p className="stat-subtitle">Độ biến động trung bình</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Bất ổn</p>
          <h2>{unstableCount}</h2>
          <p className="stat-subtitle">Số bưu cục nằm TOP bất ổn</p>
        </div>
      </div>

      <div className="main-grid">
        <section className="chart-panel">
          <div className="panel-header">
            <div>
              <h2>Biểu đồ Xu hướng Vận hành</h2>
              <p>Thống kê trung bình theo ngày trong tuần</p>
            </div>
            <div className="chart-badges">
              <span className="badge active">GTC / FD</span>
              <span className="badge">Sản lượng</span>
              <span className="badge">Bất ổn</span>
            </div>
          </div>

          <div className="chart-wrapper">
            {chartPoints ? (
              <svg viewBox="0 0 640 220" className="trend-chart">
                <polyline
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="4"
                  points={chartPoints}
                />
                {trends.map((value, index) => {
                  const x = 40 + index * 70;
                  const max = Math.max(...trends);
                  const min = Math.min(...trends);
                  const y = max === min ? 140 : 40 + ((max - value) / (max - min)) * 120;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="5" fill="#60a5fa" />
                      <text x={x} y={y - 12} className="chart-value">
                        {(value * 100).toFixed(1)}%
                      </text>
                    </g>
                  );
                })}
                {dateKeys.map((label, index) => (
                  <text
                    key={label}
                    x={40 + index * 70}
                    y="205"
                    className="chart-label"
                  >
                    {label.split(" - ")[1]}
                  </text>
                ))}
              </svg>
            ) : (
              <div className="chart-empty">Đang tải biểu đồ...</div>
            )}
          </div>
        </section>

        <aside className="insight-panel">
          <div className="panel-header">
            <div>
              <h2>Báo cáo Phân tích & Đề xuất</h2>
              <p>(AI-driven)</p>
            </div>
          </div>

          <div className="insight-section">
            <div className="insight-title">HIGHLIGHTS</div>
            {highlights.map((item) => (
              <div key={item["ID Bưu cục"]} className="insight-item">
                <span className="dot dot-positive" />
                <span>
                  <strong>{item["Tên Bưu cục"]}</strong> có GTC trung bình cao.
                </span>
              </div>
            ))}
          </div>

          <div className="insight-section">
            <div className="insight-title">LOWLIGHTS</div>
            {lowlights.map((item) => (
              <div key={item["ID Bưu cục"]} className="insight-item">
                <span className="dot dot-negative" />
                <span>
                  <strong>{item["Tên Bưu cục"]}</strong> cần cải thiện GTC.
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="section-footer">
        <div>
          <h2>Chi tiết theo chiều thống kê</h2>
        </div>
        <div className="filter-row">
          {["Tỉnh", "Area Manager (AM)", "Bưu cục (BC)"].map((group) => (
            <button
              key={group}
              className={
                activeGroup === group ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
          <input type="text" placeholder="Tìm kiếm theo tên..." />
        </div>
      </div>

      <div className="list-grid">
        {data.map((item) => {
          const percent = Number(item["%GTC TB"]) || 0;
          const logic = Number(item["Logic: So sánh"] || 0);
          return (
            <div className="report-card" key={item["ID Bưu cục"]}>
              <div className="report-card-top">
                <div>
                  <h3>{item["Tên Bưu cục"]}</h3>
                  <p>AM: Chưa phân AM</p>
                </div>
                <span
                  className={
                    item["Trạng thái"]?.includes("Bất ổn")
                      ? "status bad"
                      : "status good"
                  }
                >
                  {item["Trạng thái"]}
                </span>
              </div>

              <div className="report-row">
                <div>
                  <p>GTC TB</p>
                  <strong>{(percent * 100).toFixed(2)}%</strong>
                </div>
                <div>
                  <p>Biến động</p>
                  <strong className={logic >= 0 ? "up" : "down"}>
                    {logic >= 0 ? "+" : ""}
                    {(logic * 100).toFixed(2)}%
                  </strong>
                </div>
                <div>
                  <p>Vol cần GTC</p>
                  <strong>{Number(item["Vol cần GTC hôm nay"] || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
