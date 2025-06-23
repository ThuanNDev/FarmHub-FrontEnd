
// All IDs are kept simple for mocking purposes. In a real DB, these would be UUIDs or CUIDs.
// Timestamps are in ISO 8601 format.

export type BankInfo = {
  bank_id: string;
  account_no: string;
  account_name: string;
};

export type PrintingPreferences = {
  default_paper_size: 'k80' | 'a5' | 'k58';
};

export type Defaults = {
  unit: string;
  discount: number;
  shipping_fee: number;
};

export type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  database_name: string;
  manager_id: string;
  opening_hours: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bank_info: BankInfo;
  is_vat_enabled: boolean;
  vat_rate: number;
  invoice_footer: string;
  printing_preferences: PrintingPreferences;
  backup_schedule: string;
  defaults: Defaults;
};

export type User = {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Staff';
  associated_store_ids: string[];
  is_active: boolean;
  is_superadmin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  password_reset_token: string | null;
  token_expiry_at: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_code: string | null;
  contact_person: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type Product = {
  id: string;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  brand: string;
  unit: string;
  import_price: number;
  wholesale_price: number;
  price: number;
  credit_price: number;
  stock: number;
  min_stock_level: number;
  images: string; // JSON string of URLs
  specs: string; // JSON string of specs
  warranty_info: string;
  supplier_id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  hint: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  tax_code: string | null;
  customer_type: 'Retail' | 'Wholesale';
  note: string | null;
  credit_limit: number | null;
  total_debt: number;
  debt_due_date: string | null;
  last_purchase_date: string | null;
  loyalty_points: number;
  loyalty_tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  status: 'Active' | 'Inactive' | 'Blocked';
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type Order = {
  id: string;
  order_code: string;
  customer_id: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  total_paid: number;
  payment_type: 'Cash' | 'Card' | 'Transfer' | 'Credit' | 'Installment';
  payment_details: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  expected_delivery_date: string | null;
  delivery_address: string | null;
  delivery_status: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled' | 'N/A';
  note: string | null;
  processed_by_user_id: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type InstallmentTerm = {
  id: string;
  order_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_at: string | null;
  payment_method: string | null;
  is_late: boolean;
  note: string | null;
  collected_by_user_id: string | null;
  created_at: string;
  updatedAt: string;
};

export type Bank = {
    id: string;
    name: string;
}

export type PurchaseOrder = {
    id: string;
    order_code: string;
    supplier_id: string;
    total_amount: number;
    status: 'pending' | 'ordered' | 'received' | 'cancelled';
    expected_delivery_date: string | null;
    received_date: string | null;
    note: string | null;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
}

export type PurchaseOrderItem = {
    id: string;
    purchase_order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    received_quantity: number;
}

export type StockAdjustment = {
    id: string;
    product_id: string;
    adjustment_type: 'increase' | 'decrease';
    quantity_change: number;
    reason: string;
    adjusted_by_user_id: string;
    created_at: string;
}

export type ReturnOrder = {
    id: string;
    order_id: string;
    customer_id: string;
    return_date: string;
    total_refund_amount: number;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'restocked';
    processed_by_user_id: string;
    created_at: string;
    updated_at: string;
}

export type ReturnOrderItem = {
    id: string;
    return_order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    condition: 'new' | 'used' | 'damaged';
    restocked: boolean;
}

export type Notification = {
    id: string;
    type: 'order' | 'inventory' | 'system';
    title: string;
    description: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export type Voucher = {
    id: string;
    name: string;
    description: string;
    points_cost: number;
    value: number;
    type: 'fixed' | 'percentage' | 'shipping';
}
