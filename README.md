# Demo AI2026 — Trung tâm Chỉ huy (Vitality Compass Dashboard)

Trang Dashboard vận hành giám sát bưu cục được thiết kế hiện đại, lấy cảm hứng từ nguyên mẫu thiết kế của hệ thống **Vitality Compass AI2026**.

Giao diện sử dụng phong cách **Dark Mode** với thiết kế **Glassmorphism** sang trọng, hỗ trợ tương tác biểu đồ động (ApexCharts) và hiển thị cảnh báo chi tiết thời gian thực cho từng bưu cục.

---

## 🚀 Tính Năng Chính

1. **Báo cáo Vận hành (Operational Report)**:
   - Hệ thống thẻ KPI động (Sản lượng, GTC, FD, Tồn đọng) cập nhật tự động.
   - Biểu đồ xu hướng vận hành tương tác 8 ngày qua với 3 chế độ xem khác nhau: *GTC / FD*, *Sản lượng*, *Tồn đọng*.
   - Khung phân tích & khuyến nghị hỗ trợ bởi AI (AI-driven Insights).
2. **Chi tiết Bưu cục dạng lưới (Grid View)**:
   - Danh sách thẻ bưu cục chi tiết: hiển thị tỷ lệ GTC hiện tại, biến động so với ngày trước, số đơn hàng tồn đọng quá 5 ngày.
   - Đèn neon chỉ thị mức độ cảnh báo (Xanh: Bình thường, Vàng: Cảnh báo, Đỏ: Nguy cơ cao).
   - Ô cảnh báo nguyên nhân chi tiết cho các bưu cục có rủi ro sập luồng hàng.
   - Tương tác **Xem Lịch Sử** (mở popup biểu đồ lịch sử 5 ngày của riêng bưu cục đó) và **Nhắc AM** (gửi thông báo đẩy toast cảnh báo).
3. **Chỉ huy Tác chiến (Tactical Command)**:
   - Nhật ký hệ thống ghi nhận luồng sự kiện vận hành theo thời gian thực.
   - Cấu hình ngưỡng cảnh báo GTC và ngày tồn đọng thông qua thanh trượt range slider.
4. **Nhân sự & Tuyển dụng (HR & Recruitment)**:
   - Thống kê phân bổ tài xế (Riders) theo từng tỉnh thành dưới dạng biểu đồ tròn (Donut chart).
   - Bảng theo dõi chỉ tiêu tuyển dụng thực tế.
5. **Chọn không gian dữ liệu (Folder Directory)**:
   - Giả lập nút "Đổi thư mục" để chuyển đổi tệp tin nguồn nạp dữ liệu thống kê từ bưu cục.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core**: Semantic HTML5, Vanilla JavaScript (ES6+).
- **Styling**: Vanilla CSS3 (Custom properties, CSS Grid, Flexbox, Glow effects, Glassmorphism).
- **Icons**: Lucide Icons CDN.
- **Charts**: ApexCharts CDN.

---

## 💻 Cách Khởi Chạy Local

Bạn có thể chạy dự án vô cùng đơn giản bằng 2 cách sau:

### Cách 1: Mở trực tiếp bằng Trình duyệt
Chỉ cần nhấp đúp chuột vào tệp `index.html` hoặc kéo tệp vào trình duyệt Chrome, Safari, Edge để trải nghiệm ngay.

### Cách 2: Sử dụng Local Server (Khuyên dùng)
Nếu muốn chạy như một môi trường phát triển chuyên nghiệp, bạn hãy mở terminal tại thư mục dự án và chạy:
```bash
# Sử dụng Python built-in server
python3 -m http.server 3000

# Hoặc sử dụng Node.js npx package (nếu đã cài Node.js)
npx serve .
```
Sau đó truy cập địa chỉ: `http://localhost:3000`.

---

## 📤 Hướng Dẫn Tải Lên GitHub

Để tải dự án này lên tài khoản GitHub cá nhân của bạn, hãy thực hiện các bước sau trong terminal:

1. **Khởi tạo Git**:
   ```bash
   git init
   ```

2. **Thêm các tệp vào Git**:
   ```bash
   git add .
   ```

3. **Tạo Commit đầu tiên**:
   ```bash
   git commit -m "feat: initial commit of Vitality Compass AI2026 Dashboard"
   ```

4. **Tạo Repository mới trên GitHub**:
   - Truy cập trang [github.com](https://github.com/) và đăng nhập tài khoản của bạn.
   - Bấm nút **New** (hoặc dấu cộng `+` ở góc phải) để tạo một repository mới.
   - Đặt tên cho Repository (ví dụ: `vitality-compass-dashboard`).
   - Nhấp vào **Create repository** (để trống phần khởi tạo README/gitignore vì dự án đã có sẵn).

5. **Kết nối Local Git với GitHub và Push code**:
   *(Thay đổi URL bên dưới bằng địa chỉ repo thật của bạn)*
   ```bash
   git remote add origin https://github.com/TÊN-TÀI-KHOẢN-CỦA-BẠN/vitality-compass-dashboard.git
   git branch -M main
   git push -u origin main
   ```
