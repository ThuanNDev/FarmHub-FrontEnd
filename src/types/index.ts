
// All IDs are kept simple for mocking purposes. In a real DB, these would be UUIDs or CUIDs.
// Timestamps are in ISO 8601 format.

export type BankInfo = {
  bankId: string;
  accountNo: string;
  accountName: string;
};

export type PrintingPreferences = {
  defaultPaperSize: 'k80' | 'a5' | 'k58';
};

export type Defaults = {
  unit: string;
  discount: number;
  shippingFee: number;
};

export type Store = {
  storeId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  databaseName: string;
  userId: string; // manager_id
  openingHours: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bankInfo: BankInfo;
  isVatEnabled: boolean;
  vatRate: number;
  invoiceFooter: string;
  printingPreferences: PrintingPreferences;
  backupSchedule: string;
  defaults: Defaults;
};

export type User = {
  userId: string;
  username: string;
  passwordHash?: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Staff' | 'viewer';
  associatedStoreIds: string[] | null;
  isActive: boolean;
  isSuperadmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  passwordResetToken: string | null;
  tokenExpiryAt: string | null;
};

export type Category = {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: string | null;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type Supplier = {
  supplierId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string | null;
  contactPerson: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type Product = {
  productId: string;
  productCode: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brand: string;
  unit: string;
  importPrice: number;
  wholesalePrice: number;
  price: number;
  creditPrice: number;
  stock: number;
  minStockLevel: number;
  images: string; // JSON string of URLs
  specs: string; // JSON string of specs
  warrantyInfo: string;
  supplierId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  hint: string;
  url: string | null;
};

export type Customer = {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  taxCode: string | null;
  customerType: 'Retail' | 'Wholesale';
  note: string | null;
  creditLimit: number | null;
  totalDebt: number;
  debtDueDate: string | null;
  lastPurchaseDate: string | null;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  status: 'Active' | 'Inactive' | 'Blocked';
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type Order = {
  orderId: string;
  orderCode: string;
  customerId: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalPaid: number;
  paymentType: 'Cash' | 'Card' | 'Transfer' | 'Credit' | 'Installment';
  paymentDetails: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  expectedDeliveryDate: string | null;
  deliveryAddress: string | null;
  deliveryStatus: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled' | 'N/A';
  note: string | null;
  processedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  orderItemId: string;
  orderId: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type InstallmentTerm = {
  installmentTermId: string;
  orderId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAt: string | null;
  paymentMethod: string | null;
  isLate: boolean;
  note: string | null;
  collectedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Bank = {
    bankId: string;
    name: string;
}

export type PurchaseOrder = {
    purchaseOrderId: string;
    orderCode: string;
    supplierId: string;
    totalAmount: number;
    status: 'pending' | 'ordered' | 'received' | 'cancelled';
    expectedDeliveryDate: string | null;
    receivedDate: string | null;
    note: string | null;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
}

export type PurchaseOrderItem = {
    purchaseOrderItemId: string;
    purchaseOrderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
}

export type StockAdjustment = {
    stockAdjustmentId: string;
    productId: string;
    adjustmentType: 'increase' | 'decrease';
    quantityChange: number;
    reason: string;
    adjustedByUserId: string;
    createdAt: string;
}

export type ReturnOrder = {
    returnOrderId: string;
    orderId: string;
    customerId: string;
    returnDate: string;
    totalRefundAmount: number;
    reason: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'restocked';
    processedByUserId: string;
    createdAt: string;
    updatedAt: string;
}

export type ReturnOrderItem = {
    returnOrderItemId: string;
    returnOrderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    condition: 'new' | 'used' | 'damaged';
    restocked: boolean;
}

export type Notification = {
    notificationId: string;
    type: 'order' | 'inventory' | 'system';
    title: string;
    description: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export type Voucher = {
    voucherId: string;
    name: string;
    description: string;
    pointsCost: number;
    value: number;
    type: 'fixed' | 'percentage' | 'shipping';
}

export type PriceTier = 'retail' | 'wholesale' | 'credit';