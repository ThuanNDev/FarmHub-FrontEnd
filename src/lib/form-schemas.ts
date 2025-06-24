

import * as z from 'zod';
import { UserRole } from '@/types';

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Tên thể loại không được để trống." }),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  image: z.string().url({ message: "Vui lòng nhập URL hình ảnh hợp lệ." }).or(z.literal('')).optional(),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().default(true),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống."),
  phone: z.string().min(1, "Số điện thoại không được để trống."),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal('')),
  address: z.string().optional(),
  taxCode: z.string().optional(),
  customerType: z.enum(['Retail', 'Wholesale']),
  note: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  status: z.enum(['Active', 'Inactive', 'Blocked']),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: 'Tên đăng nhập hoặc email không được để trống.' }),
  password: z.string().min(1, { message: 'Mật khẩu không được để trống.' }),
});

export const productSchema = z.object({
  name: z.string().min(1, { message: 'Tên sản phẩm không được để trống.' }),
  productCode: z.string().min(1, { message: 'Mã sản phẩm không được để trống.' }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Vui lòng chọn thể loại.' }),
  supplierId: z.string().min(1, { message: 'Vui lòng chọn nhà cung cấp.' }),
  brand: z.string().min(1, { message: 'Thương hiệu không được để trống.' }),
  unit: z.string().min(1, { message: 'Đơn vị không được để trống.' }),
  importPrice: z.coerce.number().positive({ message: 'Giá nhập phải là một số dương.' }),
  price: z.coerce.number().positive({ message: 'Giá lẻ phải là số dương.' }),
  wholesalePrice: z.coerce.number().positive({ message: 'Giá sỉ phải là số dương.' }).optional(),
  creditPrice: z.coerce.number().positive({ message: 'Giá bán nợ phải là số dương.' }).optional(),
  stock: z.coerce.number().int().min(0, { message: 'Tồn kho phải là số nguyên không âm.' }),
  minStockLevel: z.coerce.number().int().min(0, { message: 'Ngưỡng tồn kho phải là số nguyên không âm.' }),
  warrantyInfo: z.string().optional(),
  isActive: z.boolean().default(true),
  images: z.string().optional(),
  specs: z.string().optional(),
  url: z.string().url({ message: 'Vui lòng nhập URL hợp lệ.' }).optional().or(z.literal('')),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Vui lòng chọn nhà cung cấp.'),
  expectedDeliveryDate: z.date().optional(),
  note: z.string().optional(),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, { message: 'Họ tên không được để trống.' }),
  username: z.string().min(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' }),
  email: z.string().email({ message: 'Email không hợp lệ.' }),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp.",
  path: ["confirmPassword"],
});

export const returnOrderSchema = z.object({
  reason: z.string().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(1, "Tên cửa hàng không được để trống."),
  address: z.string().min(1, "Địa chỉ không được để trống."),
  phone: z.string().min(1, "Số điện thoại không được để trống."),
  email: z.string().email("Email không hợp lệ."),
  openingHours: z.string().optional(),
  isActive: z.boolean().default(true),
  bankInfo: z.object({
    bankId: z.string().min(1, "Vui lòng chọn ngân hàng."),
    accountNo: z.string().min(1, "Số tài khoản không được để trống."),
    accountName: z.string().min(1, "Tên chủ tài khoản không được để trống."),
  }).optional(),
  isVatEnabled: z.boolean().default(true),
  vatRate: z.coerce.number().min(0, "VAT không được âm.").max(100, "VAT không thể lớn hơn 100%").optional(),
  invoiceFooter: z.string().optional(),
  printingPreferences: z.object({
      defaultPaperSize: z.enum(['k80', 'a5', 'k58']),
  }).optional(),
  backupSchedule: z.string().optional(),
  defaults: z.object({
    unit: z.string().optional(),
    discount: z.coerce.number().min(0, "Chiết khấu không thể âm.").optional(),
    shippingFee: z.coerce.number().min(0, "Phí vận chuyển không thể âm.").optional(),
  }).optional(),
});

export const stockAdjustmentSchema = z.object({
    productId: z.string().min(1, { message: "Vui lòng chọn một sản phẩm."}),
    adjustmentType: z.enum(['increase', 'decrease'], { required_error: 'Vui lòng chọn loại điều chỉnh.' }),
    quantityChange: z.coerce.number().int().positive({ message: "Số lượng phải là số nguyên dương."}),
    reason: z.string().min(1, { message: "Lý do không được để trống." }),
});

export const supplierSchema = z.object({
  name: z.string().min(1, { message: "Tên nhà cung cấp không được để trống." }),
  phone: z.string().min(1, { message: "Số điện thoại không được để trống." }),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal('')),
  address: z.string().optional(),
  taxCode: z.string().optional(),
  contactPerson: z.string().optional(),
  note: z.string().optional(),
});

export const userSchema = z.object({
  fullName: z.string().min(1, { message: "Họ tên không được để trống." }),
  username: z.string().min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
    }
    return true;
}, {
    message: "Mật khẩu phải có ít nhất 8 ký tự.",
    path: ["password"],
}).refine((data) => {
    return data.password === data.confirmPassword;
}, {
    message: "Mật khẩu không khớp.",
    path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại." }),
  newPassword: z.string().min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới không khớp.",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  otp: z.string().min(6, { message: 'Mã OTP phải có 6 chữ số.' }).max(6, { message: 'Mã OTP phải có 6 chữ số.' }),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: "Số tiền phải lớn hơn 0." }),
  paymentMethod: z.enum(['Cash', 'Card', 'Transfer'], { required_error: "Vui lòng chọn phương thức thanh toán." }),
  note: z.string().optional(),
});

export const storeSchema = z.object({
    name: z.string().min(1, "Tên cửa hàng không được để trống."),
    address: z.string().min(1, "Địa chỉ không được để trống."),
    phone: z.string().min(1, "Số điện thoại không được để trống."),
    email: z.string().email("Email không hợp lệ.").optional().or(z.literal('')),
    databaseName: z.string().min(1, "Tên cơ sở dữ liệu không được để trống.").regex(/^[a-z0-9_]+$/, "Chỉ chứa ký tự thường, số và dấu gạch dưới."),
    managerId: z.string().optional(),
    openingHours: z.string().optional(),
    isActive: z.boolean().default(true),
    bankInfo: z.object({
      bankId: z.string().optional(),
      accountNo: z.string().optional(),
      accountName: z.string().optional(),
    }).optional(),
    isVatEnabled: z.boolean().default(false),
    vatRate: z.coerce.number().min(0).optional(),
    invoiceFooter: z.string().optional(),
    printingPreferences: z.object({
      defaultPaperSize: z.enum(['k80', 'a5', 'k58']),
    }).optional(),
    backupSchedule: z.string().optional(),
    defaults: z.object({
      unit: z.string().optional(),
      discount: z.coerce.number().min(0).optional(),
      shippingFee: z.coerce.number().min(0).optional(),
    }).optional(),
});
