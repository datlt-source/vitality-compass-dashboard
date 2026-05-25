import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState([]);

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

  return (
    <div className="app">
      <h1 className="title">
        📊 Dashboard Performance
      </h1>

      <div className="grid">
        {data.map((item, i) => {
          const percent =
            Number(item["%GTC TB"]) || 0;

          const logic =
            Number(
              item["Logic: So sánh"]
            ) || 0;

          return (
            <div className="card" key={i}>
              <h2 className="name">
                {item["Tên Bưu cục"]}
              </h2>

              <p className="am">
                👤 AM:{" "}
                {item["AM"] ||
                  "Chưa phân AM"}
              </p>

              <div className="stats">
                <div>
                  <p className="label">
                    Tỷ lệ GTC
                  </p>

                  <h1 className="danger">
                    {(
                      percent * 100
                    ).toFixed(2)}
                    %
                  </h1>
                </div>

                <div>
                  <p className="label">
                    Biến động
                  </p>

                  <h2
                    className={
                      logic >= 0
                        ? "up"
                        : "down"
                    }
                  >
                    {logic >= 0
                      ? "↗"
                      : "↘"}{" "}
                    {(
                      logic * 100
                    ).toFixed(2)}
                    %
                  </h2>
                </div>
              </div>

              <div className="warning">
                ⚠️{" "}
                {item["Trạng thái"]}
              </div>

              <div className="vol">
                📦 Vol:{" "}
                {item[
                  "Vol cần GTC hôm nay"
                ] || 0}
              </div>

              <div className="buttons">
                <button>
                  📈 Xem lịch sử
                </button>

                <button className="blue">
                  🔔 Nhắc AM
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;