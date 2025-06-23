# API Documentation (Frontend to Backend)

This document outlines the API endpoints and the expected JSON request bodies that the frontend application will send to the backend.

**Base URL:** `/api`

---

## 1. Authentication

### 1.1. Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a session token. The `username` field can be either a username or an email address.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

### 1.2. Register

- **Endpoint:** `POST /api/auth/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "username": "nguyenvana",
    "email": "a@example.com",
    "password": "password123"
  }
  ```
  
### 1.3. Verify OTP

- **Endpoint:** `POST /api/auth/verify-otp`
- **Description:** Verifies the OTP for a new user's first login.
- **Request Body:**
  ```json
  {
    "username": "nguyenvana",
    "otp": "123456"
  }
  ```

---

## 2. Categories

All category endpoints are tenant-specific.

### 2.1. Create Category

- **Endpoint:** `POST /api/tenant/{storeId}/categories`
- **Description:** Adds a new product category.
- **Request Body:**
  ```json
  {
    "name": "Máy Cắt Cỏ",
    "description": "Các loại máy cắt cỏ và phụ kiện.",
    "parent_id": "cate-001", // or null for a root category
    "image": "https://example.com/image.png",
    "order": 1,
    "is_active": true
  }
  ```

### 2.2. Update Category

- **Endpoint:** `PUT /api/tenant/{storeId}/categories/{categoryId}`
- **Description:** Updates an existing category. The payload is the same as creating a category.

---

## 3. Products

### 3.1. Create Product

- **Endpoint:** `POST /api/tenant/{storeId}/products`
- **Description:** Adds a new product to the store.
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

### 3.2. Update Product

- **Endpoint:** `PUT /api/tenant/{storeId}/products/{productId}`
- **Description:** Updates an existing product. The payload is the same as creating a product.

---

## 4. Customers

### 4.1. Create Customer

- **Endpoint:** `POST /api/tenant/{storeId}/customers`
- **Description:** Adds a new customer.
- **Request Body:**
  ```json
  {
    "name": "Anh Ba Phi",
    "phone": "0901112222",
    "email": "baphi@email.com",
    "address": "Thôn 1, Xã E-Kmat, TP. Buôn Ma Thuột, Đắk Lắk",
    "tax_code": "1234567890",
    "customer_type": "Wholesale", // "Retail" or "Wholesale"
    "note": "Chuyên canh tác cà phê, mua sỉ.",
    "credit_limit": 50000000,
    "status": "Active" // "Active", "Inactive", "Blocked"
  }
  ```

### 4.2. Update Customer

- **Endpoint:** `PUT /api/tenant/{storeId}/customers/{customerId}`
- **Description:** Updates an existing customer. The payload is the same as creating a customer.

---

## 5. Orders (POS)

### 5.1. Create Order

- **Endpoint:** `POST /api/tenant/{storeId}/orders`
- **Description:** Creates a new order from the Point of Sale (POS) screen.
- **Request Body:**
  ```json
  {
    "customer_id": "cust-001", // or "guest"
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
    "deliveryAddress": "123 Đường ABC, TP.HCM", // Optional
    "note": "Giao hàng sau 5 giờ chiều."
  }
  ```

---

## 6. Purchase Orders

### 6.1. Create Purchase Order

- **Endpoint:** `POST /api/tenant/{storeId}/purchases`
- **Description:** Creates a new purchase order to import goods from a supplier.
- **Request Body:**
  ```json
  {
    "supplier_id": "supp-001",
    "expected_delivery_date": "2024-08-15T00:00:00.000Z", // ISO 8601 format, optional
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

### 6.2. Update Purchase Order

- **Endpoint:** `PUT /api/tenant/{storeId}/purchases/{purchaseOrderId}`
- **Description:** Updates an existing purchase order. The payload is the same as creating one.

---

## 7. Returns

### 7.1. Create Return Order

- **Endpoint:** `POST /api/tenant/{storeId}/returns`
- **Description:** Initiates a return process for an existing order.
- **Request Body:**
  ```json
  {
    "order_id": "ord-001",
    "reason": "Sản phẩm lỗi, không đúng mẫu.",
    "items": [
      {
        "product_id": "prod-001",
        "quantity": 1,
        "condition": "new" // "new", "used", or "damaged"
      }
    ]
  }
  ```

### 7.2. Update Return Order Status

- **Endpoint:** `PATCH /api/tenant/{storeId}/returns/{returnOrderId}/status`
- **Description:** Updates the status of a return order (e.g., approve, reject, refund, restock).
- **Request Body:**
  ```json
  {
    "action": "approve" // "approve", "reject", "refund", "restock"
  }
  ```

---

## 8. Stock Adjustments

### 8.1. Create Stock Adjustment

- **Endpoint:** `POST /api/tenant/{storeId}/stock-adjustments`
- **Description:** Records a manual change in stock quantity for a product.
- **Request Body:**
  ```json
  {
    "productId": "prod-001",
    "adjustmentType": "decrease", // "increase" or "decrease"
    "quantityChange": 2, // Always a positive integer
    "reason": "Hàng hỏng do vận chuyển"
  }
  ```

---

## 9. Debts & Installments

### 9.1. Record a Debt Payment

- **Endpoint:** `POST /api/tenant/{storeId}/debts/payment`
- **Description:** Records a payment made by a customer towards their debt.
- **Request Body:**
  ```json
  {
    "customerId": "cust-001",
    "amount": 5000000,
    "paymentMethod": "Transfer", // "Cash", "Card", "Transfer"
    "note": "Khách hàng thanh toán nợ cũ"
  }
  ```
  
### 9.2. Record an Installment Payment

- **Endpoint:** `POST /api/tenant/{storeId}/installments/payment`
- **Description:** Records an installment payment for a specific order.
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

## 10. Store Settings

### 10.1. Update Settings

- **Endpoint:** `PUT /api/stores/{storeId}`
- **Description:** Updates the store's settings.
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
