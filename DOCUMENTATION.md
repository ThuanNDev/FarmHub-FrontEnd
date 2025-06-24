# Tài liệu dự án FarmHub

Đây là tài liệu trung tâm cho dự án FarmHub, bao gồm luồng hoạt động của phần mềm, tài liệu API và danh sách công việc cần làm.

## Mục lục
1.  [Luồng hoạt động của phần mềm](#luồng-hoạt-động-của-phần-mềm)
2.  [Tài liệu API (Frontend to Backend)](#tài-liệu-api-frontend-to-backend)
3.  [Danh sách công việc (TODO)](#danh-sách-công-việc-todo)

---

## Luồng hoạt động của phần mềm

Ứng dụng được thiết kế để phục vụ các cửa hàng kinh doanh máy móc và vật tư nông nghiệp, với hai luồng người dùng chính: **Người dùng công khai** và **Người dùng đã xác thực**.

### 1. Luồng Người dùng Công khai (Khách truy cập)

-   **Trang chủ (`/home`):** Đây là trang giới thiệu chính của cửa hàng, nơi khách truy cập có thể tìm hiểu thông tin chung, xem các sản phẩm nổi bật và các đánh giá từ khách hàng khác.
-   **Đăng ký (`/register`):** Người dùng mới có thể tạo một tài khoản. Sau khi đăng ký thành công, họ sẽ được chuyển đến trang đăng nhập.
-   **Đăng nhập (`/login`):** Người dùng hiện tại có thể đăng nhập vào hệ thống.

### 2. Luồng Người dùng đã xác thực (Nhân viên, Quản lý)

Sau khi đăng nhập thành công, luồng đi của người dùng sẽ phụ thuộc vào số lượng cửa hàng mà tài khoản của họ được liên kết.

-   **Trường hợp 1: Chưa liên kết cửa hàng nào**
    -   Người dùng sẽ được chuyển hướng đến trang **Tạo cửa hàng mới (`/create-store`)**. Đây là bước bắt buộc để có thể bắt đầu sử dụng hệ thống.

-   **Trường hợp 2: Liên kết với một cửa hàng**
    -   Hệ thống sẽ tự động chọn cửa hàng duy nhất đó.
    -   Người dùng sẽ được chuyển thẳng đến **Bảng điều khiển (`/`)** của cửa hàng đó.

-   **Trường hợp 3: Liên kết với nhiều cửa hàng**
    -   Người dùng sẽ được chuyển đến trang **Lựa chọn cửa hàng (`/select-store`)**.
    -   Tại đây, họ sẽ chọn một cửa hàng để làm việc trong phiên hiện tại. Sau khi chọn, họ sẽ được chuyển đến **Bảng điều khiển (`/`)**.

### 3. Cấu trúc bên trong ứng dụng quản trị

Khi đã vào được giao diện quản trị chính, người dùng có thể truy cập các chức năng sau (tùy thuộc vào vai trò và quyền hạn):

-   **Bảng điều khiển (`/`):** Trang tổng quan chính, hiển thị các số liệu quan trọng như doanh thu, công nợ, đơn hàng mới và sản phẩm bán chạy.
-   **Bán hàng tại quầy (POS) (`/pos`):** Giao diện chính để tạo đơn hàng, quản lý giỏ hàng, áp dụng khuyến mãi và thanh toán. Đây là chức năng cốt lõi của nhân viên bán hàng.
-   **Quản lý tài nguyên:**
    -   `/products`: Quản lý danh sách sản phẩm, thêm/sửa/xóa, cập nhật tồn kho.
    -   `/categories`: Quản lý các thể loại sản phẩm.
    -   `/customers`: Quản lý thông tin khách hàng.
    -   `/suppliers`: Quản lý thông tin nhà cung cấp.
-   **Quản lý giao dịch:**
    -   `/orders`: Xem lại lịch sử các đơn hàng đã tạo.
    -   `/purchases`: Tạo và quản lý các đơn nhập hàng từ nhà cung cấp.
    -   `/returns`: Xử lý các yêu cầu trả hàng từ khách.
-   **Quản lý tài chính:**
    -   `/debts`: Theo dõi công nợ của khách hàng.
    -   `/installments`: Quản lý các đơn hàng trả góp.
-   **Báo cáo & In ấn:**
    -   `/reports`: Xem các báo cáo chi tiết và nhận phân tích từ AI.
    -   `/printing`: In lại hóa đơn hoặc in tem mã vạch sản phẩm.
-   **Cài đặt & Quản trị:**
    -   `/settings`: Cấu hình thông tin cửa hàng, VAT, in ấn, v.v.
    -   `/users`: Quản lý tài khoản nhân viên (chỉ dành cho quản lý).
    -   `/super-admin`: Bảng điều khiển cấp cao nhất để quản lý toàn bộ hệ thống (chỉ dành cho Super Admin).

---

## Tài liệu API (Frontend to Backend)

Tài liệu này phác thảo các endpoint API và cấu trúc request body JSON dự kiến mà ứng dụng frontend sẽ gửi đến backend.

**Base URL:** `/api`

---

### 1. Xác thực

#### 1.1. Đăng nhập

- **Endpoint:** `POST /api/auth/login`
- **Mô tả:** Xác thực người dùng và trả về một session token. Trường `username` có thể là tên đăng nhập hoặc địa chỉ email.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

#### 1.2. Đăng ký

- **Endpoint:** `POST /api/auth/register`
- **Mô tả:** Tạo một tài khoản người dùng mới.
- **Request Body:**
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "username": "nguyenvana",
    "email": "a@example.com",
    "password": "password123"
  }
  ```
  
#### 1.3. Xác thực OTP

- **Endpoint:** `POST /api/auth/verify-otp`
- **Mô tả:** Xác thực OTP cho lần đăng nhập đầu tiên của người dùng mới.
- **Request Body:**
  ```json
  {
    "username": "nguyenvana",
    "otp": "123456"
  }
  ```

---

### 2. Thể loại

Tất cả các endpoint về thể loại đều phụ thuộc vào cửa hàng (`tenant-specific`).

#### 2.1. Tạo Thể loại

- **Endpoint:** `POST /api/tenant/{storeId}/categories`
- **Mô tả:** Thêm một thể loại sản phẩm mới.
- **Request Body:**
  ```json
  {
    "name": "Máy Cắt Cỏ",
    "description": "Các loại máy cắt cỏ và phụ kiện.",
    "parent_id": "cate-001", // hoặc null nếu là danh mục gốc
    "image": "https://example.com/image.png",
    "order": 1,
    "is_active": true
  }
  ```

#### 2.2. Cập nhật Thể loại

- **Endpoint:** `PUT /api/tenant/{storeId}/categories/{categoryId}`
- **Mô tả:** Cập nhật một thể loại đã có. Payload tương tự như khi tạo mới.

---

### 3. Sản phẩm

#### 3.1. Tạo Sản phẩm

- **Endpoint:** `POST /api/tenant/{storeId}/products`
- **Mô tả:** Thêm một sản phẩm mới vào cửa hàng.
- **Request Body:**
  ```json
  {
    "name": "Máy cưa xích STIHL MS 170",
    "product_code": "ST-MS170",
    "description": "Dòng máy cưa nhỏ gọn...",
    "category_id": "cate-004",
    "supplier_id": "supp-001",
    "brand": "STIHL",
    "unit": "bộ",
    "import_price": 2100000,
    "price": 2800000,
    "wholesale_price": 2500000,
    "credit_price": 3000000,
    "stock": 30,
    "min_stock_level": 5,
    "warranty_info": "Bảo hành 6 tháng",
    "is_active": true,
    "images": "[\"https://example.com/img1.png\", \"https://example.com/img2.png\"]",
    "specs": "{\"Dung tích xi lanh\": \"30.1 cm³\", \"Công suất\": \"1.2 kW\"}"
  }
  ```

#### 3.2. Cập nhật Sản phẩm

- **Endpoint:** `PUT /api/tenant/{storeId}/products/{productId}`
- **Mô tả:** Cập nhật một sản phẩm đã có. Payload tương tự như khi tạo mới.

---

### 4. Khách hàng

#### 4.1. Tạo Khách hàng

- **Endpoint:** `POST /api/tenant/{storeId}/customers`
- **Mô tả:** Thêm một khách hàng mới.
- **Request Body:**
  ```json
  {
    "name": "Anh Ba Phi",
    "phone": "0901112222",
    "email": "baphi@email.com",
    "address": "Thôn 1, Xã E-Kmat, TP. Buôn Ma Thuột, Đắk Lắk",
    "tax_code": "1234567890",
    "customer_type": "Wholesale", // "Retail" hoặc "Wholesale"
    "note": "Chuyên canh tác cà phê, mua sỉ.",
    "credit_limit": 50000000,
    "status": "Active" // "Active", "Inactive", "Blocked"
  }
  ```

#### 4.2. Cập nhật Khách hàng

- **Endpoint:** `PUT /api/tenant/{storeId}/customers/{customerId}`
- **Mô tả:** Cập nhật một khách hàng đã có. Payload tương tự như khi tạo mới.

---

### 5. Đơn hàng (POS)

#### 5.1. Tạo Đơn hàng

- **Endpoint:** `POST /api/tenant/{storeId}/orders`
- **Mô tả:** Tạo một đơn hàng mới từ giao diện Bán hàng (POS).
- **Request Body:**
  ```json
  {
    "customer_id": "cust-001", // hoặc "guest"
    "items": [
      {
        "productId": "prod-001",
        "quantity": 2,
        "appliedPrice": 2800000
      },
      {
        "productId": "prod-003",
        "quantity": 1,
        "appliedPrice": 350000
      }
    ],
    "discount": 100000,
    "shipping_fee": 30000,
    "paymentMethod": "Cash", // "Cash", "Card", "Transfer", "Debt", "Installment"
    "amountPaid": 5880000,
    "deliveryAddress": "123 Đường ABC, TP.HCM", // Tùy chọn
    "note": "Giao hàng sau 5 giờ chiều."
  }
  ```

---

### 6. Đơn nhập hàng

#### 6.1. Tạo Đơn nhập hàng

- **Endpoint:** `POST /api/tenant/{storeId}/purchases`
- **Mô tả:** Tạo một đơn nhập hàng mới từ nhà cung cấp.
- **Request Body:**
  ```json
  {
    "supplier_id": "supp-001",
    "expected_delivery_date": "2024-08-15T00:00:00.000Z", // định dạng ISO 8601, tùy chọn
    "note": "Vui lòng giao hàng nguyên đai nguyên kiện.",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 10,
        "unitPrice": 2100000
      },
      {
        "productId": "prod-003",
        "quantity": 50,
        "unitPrice": 250000
      }
    ]
  }
  ```

#### 6.2. Cập nhật Đơn nhập hàng

- **Endpoint:** `PUT /api/tenant/{storeId}/purchases/{purchaseOrderId}`
- **Mô tả:** Cập nhật một đơn nhập hàng đã có. Payload tương tự như khi tạo mới.

---

### 7. Trả hàng

#### 7.1. Tạo Đơn trả hàng

- **Endpoint:** `POST /api/tenant/{storeId}/returns`
- **Mô tả:** Khởi tạo quy trình trả hàng cho một đơn hàng đã có.
- **Request Body:**
  ```json
  {
    "order_id": "ord-001",
    "reason": "Sản phẩm lỗi, không đúng mẫu.",
    "items": [
      {
        "product_id": "prod-001",
        "quantity": 1,
        "condition": "new" // "new", "used", hoặc "damaged"
      }
    ]
  }
  ```

#### 7.2. Cập nhật Trạng thái Đơn trả hàng

- **Endpoint:** `PATCH /api/tenant/{storeId}/returns/{returnOrderId}/status`
- **Mô tả:** Cập nhật trạng thái của một đơn trả hàng (ví dụ: duyệt, từ chối, hoàn tiền, nhập kho).
- **Request Body:**
  ```json
  {
    "action": "approve" // "approve", "reject", "refund", "restock"
  }
  ```

---

### 8. Điều chỉnh kho

#### 8.1. Tạo Phiếu điều chỉnh kho

- **Endpoint:** `POST /api/tenant/{storeId}/stock-adjustments`
- **Mô tả:** Ghi lại sự thay đổi số lượng tồn kho thủ công cho một sản phẩm.
- **Request Body:**
  ```json
  {
    "productId": "prod-001",
    "adjustmentType": "decrease", // "increase" hoặc "decrease"
    "quantityChange": 2, // Luôn là số nguyên dương
    "reason": "Hàng hỏng do vận chuyển"
  }
  ```

---

### 9. Công nợ & Trả góp

#### 9.1. Ghi nhận thanh toán nợ

- **Endpoint:** `POST /api/tenant/{storeId}/debts/payment`
- **Mô tả:** Ghi lại một khoản thanh toán công nợ từ khách hàng.
- **Request Body:**
  ```json
  {
    "customerId": "cust-001",
    "amount": 5000000,
    "paymentMethod": "Transfer", // "Cash", "Card", "Transfer"
    "note": "Khách hàng thanh toán nợ cũ"
  }
  ```
  
#### 9.2. Ghi nhận thanh toán trả góp

- **Endpoint:** `POST /api/tenant/{storeId}/installments/payment`
- **Mô tả:** Ghi lại một kỳ thanh toán trả góp cho một đơn hàng cụ thể.
- **Request Body:**
  ```json
  {
    "orderId": "ord-003",
    "amount": 2000000,
    "paymentMethod": "Cash",
    "note": "Thanh toán kỳ 1"
  }
  ```

---

### 10. Cài đặt Cửa hàng

#### 10.1. Cập nhật Cài đặt

- **Endpoint:** `PUT /api/stores/{storeId}`
- **Mô tả:** Cập nhật các cài đặt của cửa hàng.
- **Request Body:**
  ```json
  {
    "name": "Nông Cơ Xanh",
    "address": "123 Đường Nông Sản, Huyện Cần Giờ, TP.HCM",
    "phone": "02839998888",
    "email": "contact.hcm@nongcoxanh.vn",
    "opening_hours": "Thứ 2 - Chủ Nhật: 7:00 - 18:00",
    "is_active": true,
    "bank_info": {
      "bank_id": "SACOMBANK",
      "account_no": "050109114755",
      "account_name": "NGUYEN TRAN VAN THUAN"
    },
    "is_vat_enabled": true,
    "vat_rate": 8,
    "invoice_footer": "Cảm ơn quý khách và hẹn gặp lại!",
    "printing_preferences": {
      "default_paper_size": "k80"
    },
    "backup_schedule": "daily_2am",
    "defaults": {
      "unit": "cái",
      "discount": 0,
      "shipping_fee": 0
    }
  }
  ```
---

## Danh sách công việc (TODO)

Đây là danh sách các chức năng và cải tiến cần được thực hiện để hoàn thiện ứng dụng, được sắp xếp theo mức độ ưu tiên.

### I. Backend & Tích hợp API (Ưu tiên cao nhất)

-   [ ] **Xây dựng Backend API:** Hiện tại, toàn bộ ứng dụng đang sử dụng dữ liệu giả (mock data). Cần xây dựng các endpoint API dựa trên file `API_DOCUMENTATION.md` để ứng dụng có thể hoạt động với dữ liệu thật.
-   [ ] **Kết nối Frontend với Backend:** Thay thế tất cả các lệnh gọi đến `mockData` trong các trang bằng các lệnh gọi `fetch` đến API thực tế. Điều này bao gồm việc xử lý các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) cho tất cả các tài nguyên (sản phẩm, khách hàng, đơn hàng, v.v.).
-   [ ] **Quản lý Trạng thái Loading/Error:** Thêm các chỉ báo tải (loading spinners/skeletons) và xử lý lỗi (error messages/toasts) một cách nhất quán cho tất cả các lệnh gọi API.
-   [x] **Xác thực người dùng (Authentication):**
    -   [x] Tích hợp API cho chức năng Đăng nhập, Đăng ký, và Xác thực OTP.
    -   [x] Quản lý session/token phía client một cách an toàn.
    -   [x] Bảo vệ các trang quản trị, chỉ cho phép người dùng đã đăng nhập truy cập. Chuyển hướng người dùng chưa xác thực về trang đăng nhập.

### II. Cải tiến & Tính năng mới (Tiềm năng)

-   [ ] **Tối ưu hóa với dữ liệu thật:**
    -   [ ] **Tìm kiếm & Phân trang phía Server:** Hiện tại, các chức năng này đang xử lý ở phía client. Khi có dữ liệu lớn, cần chuyển logic này về phía backend để tối ưu hiệu suất.

-   [ ] **Cải thiện Trải nghiệm người dùng (UX/UI):**
    -   [ ] **Dashboard tùy chỉnh:** Cho phép người dùng chọn và sắp xếp các thẻ thống kê trên Bảng điều khiển.
    -   [ ] **Chế độ xem bảng trên di động:** Cải thiện khả năng hiển thị của các bảng dữ liệu phức tạp trên màn hình nhỏ.

-   [ ] **Nâng cấp kỹ thuật:**
    -   [ ] **Quản lý trạng thái:** Khi chuyển sang API thật, xem xét sử dụng một thư viện quản lý trạng thái như Redux Toolkit hoặc Zustand để xử lý state từ server, caching và các thao tác bất đồng bộ một cách hiệu quả hơn.
    -   [ ] **Tối ưu hóa hiệu suất:** Rà soát và áp dụng các kỹ thuật tối ưu của Next.js như `React.lazy`, `dynamic imports` cho các thành phần nặng.

### III. Các tính năng đã hoàn thành

-   [x] **Tích hợp AI (Genkit):**
    -   [x] **Mô tả sản phẩm:** Tự động tạo hoặc gợi ý mô tả sản phẩm dựa trên tên, thương hiệu và thông số kỹ thuật.
    -   [x] **Phân tích hình ảnh:** Trong quy trình trả hàng, sử dụng AI để phân tích hình ảnh sản phẩm do khách hàng cung cấp để gợi ý tình trạng (mới, đã sử dụng, hư hỏng).
    -   [x] **Báo cáo thông minh:** Tự động phân tích dữ liệu bán hàng và đưa ra các nhận định, đề xuất.
    -   [x] **Dự báo bán hàng:** Sử dụng dữ liệu bán hàng lịch sử để dự báo nhu cầu cho các sản phẩm trong tương lai.
    -   [x] **Thông số kĩ thuật**: Lấy thông số từ URL sản phẩm.

-   [x] **Nâng cấp kỹ thuật:**
    -   [x] **Rà soát & Dọn dẹp:** Loại bỏ các đoạn mã, thành phần và dữ liệu mẫu không còn được sử dụng để tối ưu hóa mã nguồn.

-   [x] **Chức năng Frontend:**
    -   [x] **Chỉnh sửa đơn hàng:** Cho phép chỉnh sửa đơn hàng từ giao diện POS.
    -   [x] **In hóa đơn:** In hóa đơn nhanh từ danh sách đơn hàng.
    -   [x] **Đổi mật khẩu:** Cho phép nhân viên tự đổi mật khẩu.
    -   [x] **Xuất file báo cáo:** Xuất báo cáo ra file Excel.
    -   [x] **Tùy chỉnh trả góp:** Cho phép tùy chỉnh số kỳ trả góp tại POS.
    -   [x] **Tải ảnh lên:** Cho phép tải ảnh sản phẩm từ máy tính.
```