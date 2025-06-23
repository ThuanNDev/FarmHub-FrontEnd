# TODO List - Danh sách các công việc cần làm

Đây là danh sách các chức năng và cải tiến cần được thực hiện để hoàn thiện ứng dụng, được sắp xếp theo mức độ ưu tiên.

## I. Backend & Tích hợp API (Ưu tiên cao nhất)

-   [ ] **Xây dựng Backend API:** Hiện tại, toàn bộ ứng dụng đang sử dụng dữ liệu giả (mock data). Cần xây dựng các endpoint API dựa trên file `API_DOCUMENTATION.md` để ứng dụng có thể hoạt động với dữ liệu thật.
-   [ ] **Kết nối Frontend với Backend:** Thay thế tất cả các lệnh gọi đến `mockData` trong các trang bằng các lệnh gọi `fetch` đến API thực tế. Điều này bao gồm việc xử lý các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) cho tất cả các tài nguyên (sản phẩm, khách hàng, đơn hàng, v.v.).
-   [ ] **Quản lý Trạng thái Loading/Error:** Thêm các chỉ báo tải (loading spinners/skeletons) và xử lý lỗi (error messages/toasts) một cách nhất quán cho tất cả các lệnh gọi API.
-   [ ] **Xác thực người dùng (Authentication):**
    -   [ ] Tích hợp API cho chức năng Đăng nhập, Đăng ký, và Xác thực OTP.
    -   [ ] Quản lý session/token phía client một cách an toàn (ví dụ: sử dụng httpOnly cookies).
    -   [ ] Bảo vệ các trang quản trị, chỉ cho phép người dùng đã đăng nhập truy cập. Chuyển hướng người dùng chưa xác thực về trang đăng nhập.

## II. Tích hợp AI (Genkit)
-   [x] **Mô tả sản phẩm:** Tự động tạo hoặc gợi ý mô tả sản phẩm dựa trên tên, thương hiệu và thông số kỹ thuật.
-   [x] **Phân tích hình ảnh:** Trong quy trình trả hàng, sử dụng AI để phân tích hình ảnh sản phẩm do khách hàng cung cấp để gợi ý tình trạng (mới, đã sử dụng, hư hỏng).
-   [x] **Báo cáo thông minh:** Tự động phân tích dữ liệu bán hàng và đưa ra các nhận định, đề xuất.
-   [x] **Dự báo bán hàng:** Sử dụng dữ liệu bán hàng lịch sử để dự báo nhu cầu cho các sản phẩm trong tương lai.

## III. Cải tiến & Tính năng mới (Tiềm năng)

-   [ ] **Tối ưu hóa với dữ liệu thật:**
    -   [ ] **Tìm kiếm & Phân trang phía Server:** Hiện tại, các chức năng này đang xử lý ở phía client. Khi có dữ liệu lớn, cần chuyển logic này về phía backend để tối ưu hiệu suất.
    -   [ ] **Tải ảnh lên:** Triển khai giải pháp cho phép người dùng tải lên hình ảnh từ máy tính thay vì chỉ dùng URL.

-   [ ] **Cải thiện Trải nghiệm người dùng (UX/UI):**
    -   [ ] **Dashboard tùy chỉnh:** Cho phép người dùng chọn và sắp xếp các thẻ thống kê trên Bảng điều khiển.
    -   [ ] **Chế độ xem bảng trên di động:** Cải thiện khả năng hiển thị của các bảng dữ liệu phức tạp trên màn hình nhỏ.

-   [ ] **Nâng cấp kỹ thuật:**
    -   [x] **Rà soát & Dọn dẹp:** Loại bỏ các đoạn mã, thành phần và dữ liệu mẫu không còn được sử dụng để tối ưu hóa mã nguồn.
    -   [ ] **Quản lý trạng thái:** Khi chuyển sang API thật, xem xét sử dụng một thư viện quản lý trạng thái như Redux Toolkit hoặc Zustand để xử lý state từ server, caching và các thao tác bất đồng bộ một cách hiệu quả hơn.
    -   [ ] **Tối ưu hóa hiệu suất:** Rà soát và áp dụng các kỹ thuật tối ưu của Next.js như `React.lazy`, `dynamic imports` cho các thành phần nặng.
