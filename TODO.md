# TODO List - Danh sách các công việc cần làm

Đây là danh sách các chức năng và cải tiến cần được thực hiện để hoàn thiện ứng dụng, được sắp xếp theo mức độ ưu tiên.

## I. Backend & Tích hợp API (Ưu tiên cao nhất)

-   [ ] **Xây dựng Backend API:** Hiện tại, toàn bộ ứng dụng đang sử dụng dữ liệu giả (mock data). Cần xây dựng các endpoint API dựa trên file `API_DOCUMENTATION.md` để ứng dụng có thể hoạt động với dữ liệu thật.
-   [ ] **Kết nối Frontend với Backend:** Thay thế tất cả các lệnh gọi đến `mockData` trong các trang bằng các lệnh gọi `fetch` đến API thực tế.
-   [ ] **Quản lý Trạng thái Loading/Error:** Thêm các chỉ báo tải (loading spinners) và xử lý lỗi (error messages/toasts) một cách nhất quán cho tất cả các lệnh gọi API.
-   [ ] **Xác thực người dùng (Authentication):**
    -   [ ] Tích hợp API cho chức năng Đăng nhập, Đăng ký, và Xác thực OTP.
    -   [ ] Quản lý session/token phía client một cách an toàn (ví dụ: sử dụng httpOnly cookies hoặc các phương pháp an toàn khác).
    -   [ ] Bảo vệ các trang quản trị, chỉ cho phép người dùng đã đăng nhập truy cập.

## II. Chức năng Frontend cần hoàn thiện

### Trang Đơn hàng (`/orders`) & Chi tiết Đơn hàng (`/orders/[id]`)
-   [ ] **Hoàn thiện chức năng Sửa đơn hàng:** Nút "Sửa" ở cả trang danh sách và trang chi tiết hiện chỉ hiển thị thông báo. Cần triển khai form sửa đơn hàng (chỉ cho các đơn hàng có trạng thái `Pending`).
-   [ ] **Hoàn thiện chức năng In đơn hàng (Trang danh sách):** Nút "In" trong menu của mỗi đơn hàng chưa có chức năng. Cần gọi đến logic in hóa đơn tương tự như ở trang chi tiết.

### Trang Nhân viên (`/users`)
-   [ ] **Hoàn thiện chức năng Đổi mật khẩu:** Trong giao diện dành cho nhân viên (vai trò `Staff`), nút "Đổi mật khẩu" chưa được triển khai chức năng.

### Trang Báo cáo (`/reports`)
-   [ ] **Hoàn thiện chức năng Xuất file:** Nút "Xuất file" chưa có chức năng. Cần thêm logic để xuất dữ liệu báo cáo trong khoảng thời gian đã chọn ra file (ví dụ: CSV/Excel).

## III. Cải tiến & Tính năng mới (Tiềm năng)

-   [ ] **Tích hợp AI (Genkit):** Bộ công cụ Genkit đã được cài đặt nhưng chưa có tính năng AI nào. Có thể xem xét các chức năng như:
    -   Tự động gợi ý mô tả sản phẩm.
    -   Phân tích hình ảnh sản phẩm bị lỗi/hỏng trong quy trình trả hàng.
    -   Chatbot hỗ trợ/hỏi đáp về sản phẩm.
-   [ ] **Hoàn thiện Tìm kiếm & Phân trang:** Hiện tại, các chức năng này đang được xử lý ở phía client. Khi có dữ liệu lớn, nên chuyển logic này về phía backend để tối ưu hiệu suất.
-   [ ] **Tối ưu hóa hình ảnh:** Triển khai giải pháp cho phép người dùng tải lên hình ảnh thay vì chỉ dùng URL, và sử dụng `next/image` để tối ưu hóa.
