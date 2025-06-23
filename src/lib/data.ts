
import type { Store, User, Category, Supplier, Product, Customer, Order, OrderItem, InstallmentTerm, Bank, PurchaseOrder, PurchaseOrderItem, StockAdjustment, ReturnOrder, ReturnOrderItem, Notification, Voucher } from '@/types';

// All IDs are kept simple for mocking purposes. In a real DB, these would be UUIDs or CUIDs.
// Timestamps are in ISO 8601 format.

const now = new Date('2024-07-30T10:00:00Z');
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const monthsFromNow = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
}

export const mockStores: Store[] = [
  {
    storeId: 'store-001',
    name: 'Nông Cơ Xanh',
    address: '123 Đường Nông Sản, Huyện Cần Giờ, TP.HCM',
    phone: '02839998888',
    email: 'contact.hcm@nongcoxanh.vn',
    databaseName: 'nongcoxanh_main_db',
    userId: 'user-001',
    openingHours: 'Thứ 2 - Chủ Nhật: 7:00 - 18:00',
    isActive: true,
    createdAt: daysAgo(500),
    updatedAt: daysAgo(1),
    bankInfo: {
      bankId: 'SACOMBANK',
      accountNo: '050109114755',
      accountName: 'NGUYEN TRAN VAN THUAN'
    },
    isVatEnabled: false,
    vatRate: 8,
    invoiceFooter: 'Cảm ơn quý khách và hẹn gặp lại!',
    printingPreferences: {
      defaultPaperSize: 'k80' as 'k80' | 'a5' | 'k58'
    },
    backupSchedule: 'daily_2am',
    defaults: {
        unit: 'cái',
        discount: 0,
        shippingFee: 0,
    }
  }
];

export const mockUsers: User[] = [
    {
      userId: 'user-001',
      username: 'admin',
      passwordHash: '$2b$12$D.p.a.S.s.W.o.r.d.P.l.a.c.e.h.o.l.d.e.r',
      fullName: 'Tên Của Bạn',
      email: 'email@cuaban.com',
      phone: '0123456789',
      role: 'Admin',
      associatedStoreIds: ['store-001'],
      isActive: true,
      isSuperadmin: true,
      lastLoginAt: hoursAgo(1),
      createdAt: daysAgo(500),
      updatedAt: hoursAgo(1),
      passwordResetToken: null,
      tokenExpiryAt: null,
    },
    {
      userId: 'user-002',
      username: 'nhanvien1',
      passwordHash: '$2b$12$D.p.a.S.s.W.o.r.d.P.l.a.c.e.h.o.l.d.e.r',
      fullName: 'Nguyễn Thị Bích',
      email: 'bich.nguyen@nongcoxanh.com',
      phone: '0912345678',
      role: 'Staff',
      associatedStoreIds: ['store-001'],
      isActive: true,
      isSuperadmin: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(450),
      updatedAt: daysAgo(1),
      passwordResetToken: null,
      tokenExpiryAt: null,
    },
];

export let mockCategories: Category[] = [
  { 
    categoryId: 'cate-001', 
    name: 'Máy Nông Nghiệp', 
    slug: 'may-nong-nghiep',
    description: 'Các loại máy móc phục vụ nông nghiệp.',
    parentCategoryId: null,
    image: 'https://placehold.co/100x100.png',
    order: 1,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
    isDeleted: false
  },
  { 
    categoryId: 'cate-002', 
    name: 'Máy công trình', 
    slug: 'may-cong-trinh',
    description: 'Máy móc cho xây dựng và công trình.',
    parentCategoryId: null,
    image: 'https://placehold.co/100x100.png',
    order: 2,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
    isDeleted: false
  },
  { 
    categoryId: 'cate-003', 
    name: 'Phụ tùng',
    slug: 'phu-tung', 
    description: 'Linh kiện, phụ tùng thay thế cho các loại máy.',
    parentCategoryId: null,
    image: 'https://placehold.co/100x100.png',
    order: 3,
    isActive: true,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
    isDeleted: false
  },
  { 
    categoryId: 'cate-004', 
    name: 'Máy cưa xích',
    slug: 'may-cua-xich', 
    description: 'Lam, xích, bugi, nòng cho máy cưa.',
    parentCategoryId: 'cate-001',
    image: 'https://placehold.co/100x100.png',
    order: 1,
    isActive: true,
    createdAt: daysAgo(364),
    updatedAt: daysAgo(364),
    isDeleted: false
  },
  { 
    categoryId: 'cate-005', 
    name: 'Máy cắt cỏ',
    slug: 'may-cat-co', 
    description: 'Đầu bò, lưỡi cắt, dây cước.',
    parentCategoryId: 'cate-001',
    image: 'https://placehold.co/100x100.png',
    order: 2,
    isActive: true,
    createdAt: daysAgo(364),
    updatedAt: daysAgo(364),
    isDeleted: false
  },
];

export let mockSuppliers: Supplier[] = [
  {
    supplierId: "supp-001",
    name: "Công ty TNHH STIHL Việt Nam",
    phone: "02838123456",
    email: "contact@stihl.vn",
    address: "KCN Tân Bình, Quận Tân Phú, TP.HCM",
    taxCode: "0300123456",
    contactPerson: "Anh Minh",
    note: "Nhà phân phối chính hãng STIHL.",
    createdAt: daysAgo(300),
    updatedAt: daysAgo(60),
    isDeleted: false
  },
  {
    supplierId: "supp-002",
    name: "Nhà phân phối Husqvarna Toàn Quốc",
    phone: "02435556789",
    email: "info@husqvarna-vn.com",
    address: "Cụm CN Ngọc Hồi, Huyện Thanh Trì, Hà Nội",
    taxCode: "0100987654",
    contactPerson: "Chị Lan",
    note: "Chuyên các dòng máy Thụy Điển.",
    createdAt: daysAgo(400),
    updatedAt: daysAgo(50),
    isDeleted: false
  },
  {
    supplierId: "supp-003",
    name: "Công ty Honda Việt Nam",
    phone: "02438889999",
    email: "support@honda.com.vn",
    address: "Phúc Thắng, Phúc Yên, Vĩnh Phúc",
    taxCode: "0100114842",
    contactPerson: "Anh Hùng",
    note: "Cung cấp động cơ và máy bơm nước.",
    createdAt: daysAgo(350),
    updatedAt: daysAgo(80),
    isDeleted: false
  }
];


export let mockProducts: Product[] = [
  {
    productId: "prod-001",
    productCode: "ST-MS170",
    name: "Máy cưa xích STIHL MS 170",
    slug: "may-cua-xich-stihl-ms-170",
    description: "Dòng máy cưa nhỏ gọn, lý tưởng cho công việc cắt tỉa cành cây, cưa củi và các công việc nhẹ trong vườn nhà.",
    categoryId: "cate-004",
    brand: "STIHL",
    unit: "bộ",
    importPrice: 2100000,
    wholesalePrice: 2500000,
    price: 2800000,
    creditPrice: 3000000,
    stock: 30,
    minStockLevel: 5,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"30.1 cm³\", \"Công suất\": \"1.2 kW\", \"Trọng lượng\": \"4.1 kg\", \"Chiều dài lam\": \"12-16 inch\"}",
    warrantyInfo: "Bảo hành 6 tháng",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(10),
    hint: 'chainsaw',
    url: null
  },
  {
    productId: "prod-002",
    productCode: "HUS-125R",
    name: "Máy cắt cỏ Husqvarna 125R",
    slug: "may-cat-co-husqvarna-125r",
    description: "Máy cắt cỏ đeo vai, động cơ mạnh mẽ, tiết kiệm nhiên liệu. Dễ khởi động, tay cầm chống rung, phù hợp cho việc phát quang diện tích nhỏ và vừa.",
    categoryId: "cate-005",
    brand: "Husqvarna",
    unit: "bộ",
    importPrice: 3500000,
    wholesalePrice: 4200000,
    price: 4500000,
    creditPrice: 4800000,
    stock: 25,
    minStockLevel: 5,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"28 cm³\", \"Công suất\": \"0.8 kW\", \"Trọng lượng\": \"5.0 kg\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(195),
    updatedAt: daysAgo(5),
    hint: 'brush cutter',
    url: null
  },
  {
    productId: "prod-003",
    productCode: "PT-LAM-16",
    name: "Lam máy cưa 16 inch",
    slug: "lam-may-cua-16-inch",
    description: "Lam 16 inch (40cm) phù hợp cho các dòng máy cưa STIHL và Husqvarna cỡ nhỏ và vừa.",
    categoryId: "cate-003",
    brand: "Oregon",
    unit: "cái",
    importPrice: 250000,
    wholesalePrice: 300000,
    price: 350000,
    creditPrice: 400000,
    stock: 100,
    minStockLevel: 20,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Loại lam\": \"Lam trượt\", \"Chân xích\": \"3/8p\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(150),
    updatedAt: daysAgo(7),
    hint: 'chainsaw bar',
    url: null
  },
  {
    productId: "prod-004",
    productCode: "PT-DAUBO",
    name: "Đầu bò máy cắt cỏ",
    slug: "dau-bo-may-cat-co",
    description: "Bộ nhông truyền động (đầu bò) cho máy cắt cỏ, loại 28mm, 9 khía.",
    categoryId: "cate-003",
    brand: "VN-OEM",
    unit: "cái",
    importPrice: 150000,
    wholesalePrice: 200000,
    price: 250000,
    creditPrice: 280000,
    stock: 80,
    minStockLevel: 15,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Đường kính ống\": \"28mm\", \"Số khía\": \"9\"}",
    warrantyInfo: "Bao test",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(4),
    hint: 'gear head',
    url: null
  },
  {
    productId: "prod-005",
    productCode: "PT-NONG-381",
    name: "Nòng máy cưa STIHL 381",
    slug: "nong-may-cua-stihl-381",
    description: "Bộ nòng xi lanh completo cho máy cưa STIHL MS 381.",
    categoryId: "cate-003",
    brand: "STIHL",
    unit: "bộ",
    importPrice: 800000,
    wholesalePrice: 1000000,
    price: 1200000,
    creditPrice: 1300000,
    stock: 15,
    minStockLevel: 3,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Đường kính piston\": \"52mm\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3),
    hint: 'cylinder piston',
    url: null
  },
  {
    productId: "prod-006",
    productCode: "HD-GX160",
    name: "Động cơ xăng Honda GX160",
    slug: "dong-co-xang-honda-gx160",
    description: "Động cơ xăng 4 thì, dung tích 163cc, cốt thẳng, thường dùng cho máy bơm nước, máy phát điện, máy nén khí.",
    categoryId: "cate-001",
    brand: "Honda",
    unit: "cái",
    importPrice: 2800000,
    wholesalePrice: 3200000,
    price: 3500000,
    creditPrice: 3700000,
    stock: 40,
    minStockLevel: 10,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Loại động cơ\": \"4 thì, 1 xi lanh, xupap treo\", \"Công suất\": \"4.8 HP\", \"Dung tích xi lanh\": \"163 cm³\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-003",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(250),
    updatedAt: daysAgo(15),
    hint: 'gasoline engine',
    url: null
  },
  {
    productId: "prod-007",
    productCode: "ST-SR420",
    name: "Máy phun thuốc STIHL SR 420",
    slug: "may-phun-thuoc-stihl-sr-420",
    description: "Máy phun thuốc trừ sâu dạng đeo lưng, công suất mạnh mẽ, dùng cho phun thuốc dạng lỏng và dạng bột. Rất hiệu quả cho cây ăn trái và hoa màu.",
    categoryId: "cate-001",
    brand: "STIHL",
    unit: "cái",
    importPrice: 8500000,
    wholesalePrice: 9500000,
    price: 10500000,
    creditPrice: 11000000,
    stock: 12,
    minStockLevel: 2,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"56.5 cm³\", \"Bình chứa\": \"13 L\", \"Tầm phun\": \"12 m\"}",
    warrantyInfo: "Bảo hành 6 tháng",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(80),
    updatedAt: daysAgo(30),
    hint: 'backpack sprayer',
    url: null
  },
  {
    productId: "prod-008",
    productCode: "PT-NHOT-2T",
    name: "Nhớt 2 thì STIHL",
    slug: "nhot-2-thi-stihl",
    description: "Nhớt pha xăng chuyên dụng cho động cơ 2 thì, tỷ lệ pha 1:50, giúp bảo vệ động cơ, giảm khói.",
    categoryId: "cate-003",
    brand: "STIHL",
    unit: "lít",
    importPrice: 120000,
    wholesalePrice: 135000,
    price: 150000,
    creditPrice: 160000,
    stock: 200,
    minStockLevel: 50,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích\": \"1 Lít\", \"Tiêu chuẩn\": \"API TC, JASO FD\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(280),
    updatedAt: daysAgo(5),
    hint: '2-stroke oil',
    url: null
  },
  {
    productId: "prod-009",
    productCode: "HUS-445",
    name: "Máy cưa xích Husqvarna 445",
    slug: "may-cua-xich-husqvarna-445",
    description: "Dòng máy cưa bán chuyên nghiệp, mạnh mẽ, phù hợp cho việc đốn hạ cây vừa và nhỏ, công nghệ X-Torq tiết kiệm nhiên liệu.",
    categoryId: "cate-004",
    brand: "Husqvarna",
    unit: "bộ",
    importPrice: 7500000,
    wholesalePrice: 8500000,
    price: 9200000,
    creditPrice: 9500000,
    stock: 18,
    minStockLevel: 4,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"45.7 cm³\", \"Công suất\": \"2.1 kW\", \"Trọng lượng\": \"4.9 kg\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(70),
    updatedAt: daysAgo(25),
    hint: 'professional chainsaw',
    url: null
  },
  {
    productId: "prod-010",
    productCode: "HD-WB20XT",
    name: "Máy bơm nước Honda WB20XT",
    slug: "may-bom-nuoc-honda-wb20xt",
    description: "Máy bơm nước lưu lượng lớn, sử dụng động cơ Honda GX120, chuyên dùng cho tưới tiêu, bơm ao hồ, công trình xây dựng.",
    categoryId: "cate-001",
    brand: "Honda",
    unit: "bộ",
    importPrice: 4500000,
    wholesalePrice: 5200000,
    price: 5800000,
    creditPrice: 6000000,
    stock: 22,
    minStockLevel: 5,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Đường kính họng hút xả\": \"50mm (2 inch)\", \"Lưu lượng tối đa\": \"670 lít/phút\", \"Đẩy cao tối đa\": \"32 m\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-003",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
    hint: 'water pump',
    url: null
  },
  {
    productId: "prod-011",
    productCode: "PT-BUGINGK",
    name: "Bugi NGK BPMR7A",
    slug: "bugi-ngk-bpmr7a",
    description: "Bugi NGK chính hãng, phù hợp cho hầu hết các loại máy cưa, máy cắt cỏ.",
    categoryId: "cate-003",
    brand: "NGK",
    unit: "cái",
    importPrice: 45000,
    wholesalePrice: 60000,
    price: 70000,
    creditPrice: 80000,
    stock: 500,
    minStockLevel: 100,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Loại bugi\": \"Điện trở\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(270),
    updatedAt: daysAgo(4),
    hint: 'spark plug',
    url: null
  },
  {
    productId: "prod-012",
    productCode: "PT-DAYCUOC",
    name: "Dây cước cắt cỏ vuông",
    slug: "day-cuoc-cat-co-vuong",
    description: "Dây cước vuông 3.0mm, gai, siêu bền, chuyên dùng để cắt các loại cỏ dày, cỏ già.",
    categoryId: "cate-003",
    brand: "VN-OEM",
    unit: "cuộn",
    importPrice: 60000,
    wholesalePrice: 75000,
    price: 90000,
    creditPrice: 100000,
    stock: 150,
    minStockLevel: 30,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Kích thước\": \"3.0 mm\", \"Hình dạng\": \"Vuông gai\", \"Chiều dài\": \"~50m\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(140),
    updatedAt: daysAgo(3),
    hint: 'trimmer line',
    url: null
  },
  {
    productId: "prod-013",
    productCode: "ST-MS382",
    name: "Máy cưa xích STIHL MS 382",
    slug: "may-cua-xich-stihl-ms-382",
    description: "Dòng máy cưa chuyên nghiệp, công suất lớn, bền bỉ, dành cho khai thác gỗ chuyên nghiệp.",
    categoryId: "cate-004",
    brand: "STIHL",
    unit: "bộ",
    importPrice: 11000000,
    wholesalePrice: 13000000,
    price: 14500000,
    creditPrice: 15000000,
    stock: 10,
    minStockLevel: 2,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"72.2 cm³\", \"Công suất\": \"3.9 kW\", \"Trọng lượng\": \"6.2 kg\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
    hint: 'heavy-duty chainsaw',
    url: null
  },
  {
    productId: "prod-014",
    productCode: "HUS-541",
    name: "Máy cắt cỏ Husqvarna 541RS",
    slug: "may-cat-co-husqvarna-541rs",
    description: "Máy cắt cỏ chuyên nghiệp, hiệu suất cao, thiết kế tối ưu cho công việc nặng và thời gian dài.",
    categoryId: "cate-005",
    brand: "Husqvarna",
    unit: "bộ",
    importPrice: 6800000,
    wholesalePrice: 7800000,
    price: 8500000,
    creditPrice: 8800000,
    stock: 15,
    minStockLevel: 3,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Dung tích xi lanh\": \"41.5 cm³\", \"Công suất\": \"1.6 kW\", \"Trọng lượng\": \"7.1 kg\"}",
    warrantyInfo: "Bảo hành 12 tháng",
    supplierId: "supp-002",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(6),
    hint: 'professional brush cutter',
    url: null
  },
  {
    productId: "prod-015",
    productCode: "PT-XICH-3/8",
    name: "Xích cưa 3/8 34 mắt",
    slug: "xich-cua-3-8-34-mat",
    description: "Xích cưa chân 3/8, 34 mắt, phù hợp cho lam 16 inch.",
    categoryId: "cate-003",
    brand: "Oregon",
    unit: "sợi",
    importPrice: 180000,
    wholesalePrice: 220000,
    price: 250000,
    creditPrice: 270000,
    stock: 120,
    minStockLevel: 30,
    images: "[\"https://placehold.co/600x400.png\"]",
    specs: "{\"Bước xích\": \"3/8p\", \"Số mắt\": \"34\"}",
    warrantyInfo: "Không bảo hành",
    supplierId: "supp-001",
    isActive: true,
    isDeleted: false,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(2),
    hint: 'chainsaw chain',
    url: null
  }
];


export let mockCustomers: Customer[] = [
  { 
    customerId: 'cust-001', 
    name: 'Anh Ba Phi', 
    phone: '0901112222', 
    email: 'baphi@email.com',
    address: 'Thôn 1, Xã E-Kmat, TP. Buôn Ma Thuột, Đắk Lắk',
    taxCode: null,
    customerType: 'Wholesale',
    note: 'Chuyên canh tác cà phê, mua sỉ.',
    creditLimit: 50000000,
    totalDebt: 15000000,
    debtDueDate: daysFromNow(20),
    lastPurchaseDate: daysAgo(15),
    loyaltyPoints: 15200,
    loyaltyTier: 'Gold',
    status: 'Active',
    createdAt: daysAgo(700),
    updatedAt: daysAgo(15),
    isDeleted: false
  },
  { 
    customerId: 'cust-002', 
    name: 'Chú Tư Cảnh', 
    phone: '0987654321', 
    email: 'tucanh@email.com',
    address: '123 Đường Trần Phú, Phường 4, TP. Đà Lạt, Lâm Đồng',
    taxCode: null,
    customerType: 'Retail',
    note: 'Khách hàng thân thiết, mua lẻ.',
    creditLimit: 0,
    totalDebt: 0,
    debtDueDate: null,
    lastPurchaseDate: daysAgo(5),
    loyaltyPoints: 5800,
    loyaltyTier: 'Silver',
    status: 'Active',
    createdAt: daysAgo(400),
    updatedAt: daysAgo(5),
    isDeleted: false
  },
  { 
    customerId: 'cust-003', 
    name: 'Trang trại Hoa Lan Đà Lạt', 
    phone: '0918000111', 
    email: 'trangtraihoalan@dalat.com',
    address: 'Vạn Thành, Phường 5, TP. Đà Lạt, Lâm Đồng',
    taxCode: '0301234567',
    customerType: 'Wholesale',
    note: 'Mua máy phun thuốc và vật tư định kỳ.',
    creditLimit: 20000000,
    totalDebt: 5500000,
    debtDueDate: daysFromNow(45),
    lastPurchaseDate: daysAgo(10),
    loyaltyPoints: 8900,
    loyaltyTier: 'Silver',
    status: 'Active',
    createdAt: daysAgo(360),
    updatedAt: daysAgo(10),
    isDeleted: false
  },
  { 
    customerId: 'cust-004', 
    name: 'Ông Sáu Miệt Vườn', 
    phone: '0903888777', 
    email: 'sauvuon@gmail.com',
    address: 'Xã Phú Hựu, Huyện Châu Thành, Đồng Tháp',
    taxCode: null,
    customerType: 'Retail',
    note: 'Chuyên sầu riêng, hay mua máy cưa, máy cắt cỏ.',
    creditLimit: 0,
    totalDebt: 0,
    debtDueDate: null,
    lastPurchaseDate: daysAgo(25),
    loyaltyPoints: 2300,
    loyaltyTier: 'Bronze',
    status: 'Active',
    createdAt: daysAgo(600),
    updatedAt: daysAgo(25),
    isDeleted: false
  },
  { 
    customerId: 'cust-005', 
    name: 'Công ty Cảnh Quan Sài Gòn', 
    phone: '02837779999', 
    email: 'info@canhquansaigon.vn',
    address: '258 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    taxCode: '0300987654',
    customerType: 'Wholesale',
    note: 'Đối tác lớn, yêu cầu xuất hóa đơn VAT.',
    creditLimit: 100000000,
    totalDebt: 45800000,
    debtDueDate: daysFromNow(25),
    lastPurchaseDate: daysAgo(3),
    loyaltyPoints: 45000,
    loyaltyTier: 'Diamond',
    status: 'Active',
    createdAt: daysAgo(300),
    updatedAt: daysAgo(3),
    isDeleted: false
  },
  { 
    customerId: 'cust-006', 
    name: 'Bà Hai Bến Tre', 
    phone: '0939123123', 
    email: '',
    address: 'Huyện Mỏ Cày Nam, Bến Tre',
    taxCode: null,
    customerType: 'Retail',
    note: 'Chỉ mua tiền mặt, không ghi nợ.',
    creditLimit: 0,
    totalDebt: 0,
    debtDueDate: null,
    lastPurchaseDate: daysAgo(60),
    loyaltyPoints: 1200,
    loyaltyTier: 'Bronze',
    status: 'Active',
    createdAt: daysAgo(200),
    updatedAt: daysAgo(60),
    isDeleted: false
  },
  { 
    customerId: 'cust-007', 
    name: 'Anh Tùng - Thầu xây dựng', 
    phone: '0945678999', 
    email: 'tungxd@yahoo.com',
    address: 'TP. Thủ Đức, TP.HCM',
    taxCode: null,
    customerType: 'Retail',
    note: 'Thường mua máy móc công suất lớn.',
    creditLimit: 10000000,
    totalDebt: 0,
    debtDueDate: null,
    lastPurchaseDate: daysAgo(20),
    loyaltyPoints: 750,
    loyaltyTier: 'Bronze',
    status: 'Inactive',
    createdAt: daysAgo(380),
    updatedAt: daysAgo(20),
    isDeleted: false
  }
];


export let mockOrders: Order[] = [
  { 
    orderId: 'ord-001', 
    orderCode: `DH${new Date(daysAgo(1)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
    customerId: 'cust-001',
    totalAmount: 2800000,
    discountAmount: 0,
    shippingFee: 0,
    totalPaid: 2800000,
    paymentType: 'Cash',
    paymentDetails: 'Tiền mặt',
    status: 'Delivered',
    expectedDeliveryDate: null,
    deliveryAddress: null,
    deliveryStatus: 'Completed',
    note: 'Khách lấy tại cửa hàng',
    processedByUserId: 'user-001',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0)
  },
  { 
    orderId: 'ord-002', 
    orderCode: `DH${new Date(daysAgo(2)).toISOString().slice(2, 10).replace(/-/g, '')}005`,
    customerId: 'cust-002',
    totalAmount: 4500000,
    discountAmount: 0,
    shippingFee: 0,
    totalPaid: 4500000,
    paymentType: 'Cash',
    paymentDetails: 'Thanh toán tại quầy',
    status: 'Delivered',
    expectedDeliveryDate: null,
    deliveryAddress: null,
    deliveryStatus: 'N/A',
    note: null,
    processedByUserId: 'user-002',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2)
  },
  { 
    orderId: 'ord-003', 
    orderCode: `DH${new Date(daysAgo(3)).toISOString().slice(2, 10).replace(/-/g, '')}002`,
    customerId: 'cust-001',
    totalAmount: 9000000,
    discountAmount: 500000,
    shippingFee: 0,
    totalPaid: 3000000,
    paymentType: 'Installment',
    paymentDetails: 'Trả góp 3 tháng',
    status: 'Pending',
    expectedDeliveryDate: daysFromNow(7),
    deliveryAddress: 'Thôn 1, Xã E-Kmat, TP. Buôn Ma Thuột, Đắk Lắk',
    deliveryStatus: 'Processing',
    note: 'Hẹn lịch giao hàng trước 1 ngày',
    processedByUserId: 'user-001',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  { 
    orderId: 'ord-004', 
    orderCode: `DH${new Date(daysAgo(4)).toISOString().slice(2, 10).replace(/-/g, '')}010`,
    customerId: 'cust-005',
    totalAmount: 250000,
    discountAmount: 0,
    shippingFee: 0,
    totalPaid: 0,
    paymentType: 'Credit',
    paymentDetails: 'Ghi nợ',
    status: 'Cancelled',
    expectedDeliveryDate: daysFromNow(1),
    deliveryAddress: '258 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    deliveryStatus: 'Cancelled',
    note: 'Khách hàng báo hủy do đổi ý.',
    processedByUserId: 'user-002',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4)
  },
  { 
    orderId: 'ord-005', 
    orderCode: `DH${new Date(daysAgo(10)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
    customerId: 'cust-005',
    totalAmount: 58500000,
    discountAmount: 1000000,
    shippingFee: 50000,
    totalPaid: 57550000,
    paymentType: 'Card',
    paymentDetails: 'Visa **** 1234 - Đã thanh toán',
    status: 'Pending',
    expectedDeliveryDate: daysFromNow(5),
    deliveryAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    deliveryStatus: 'Processing',
    note: 'Giao hàng trong giờ hành chính',
    processedByUserId: 'user-002',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10)
  },
  { 
    orderId: 'ord-006', 
    orderCode: `DH${new Date(daysAgo(45)).toISOString().slice(2, 10).replace(/-/g, '')}003`,
    customerId: 'cust-003',
    totalAmount: 10500000,
    discountAmount: 0,
    shippingFee: 0,
    totalPaid: 5000000,
    paymentType: 'Credit',
    paymentDetails: 'Thanh toán trước 5tr, còn lại ghi nợ.',
    status: 'Delivered',
    expectedDeliveryDate: null,
    deliveryAddress: 'Vạn Thành, Phường 5, TP. Đà Lạt, Lâm Đồng',
    deliveryStatus: 'Completed',
    note: 'Khách quen',
    processedByUserId: 'user-001',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44)
  },
];

export let mockOrderItems: OrderItem[] = [
  {
    orderItemId: 'item-001', orderId: 'ord-001', productId: 'prod-001',
    productName: 'Máy cưa xích STIHL MS 170', productUnit: 'bộ',
    quantity: 1, unitPrice: 2800000, totalPrice: 2800000,
  },
  {
    orderItemId: 'item-002', orderId: 'ord-002', productId: 'prod-002',
    productName: 'Máy cắt cỏ Husqvarna 125R', productUnit: 'bộ',
    quantity: 1, unitPrice: 4500000, totalPrice: 4500000,
  },
  {
    orderItemId: 'item-003', orderId: 'ord-003', productId: 'prod-002',
    productName: 'Máy cắt cỏ Husqvarna 125R', productUnit: 'bộ',
    quantity: 2, unitPrice: 4500000, totalPrice: 9000000,
  },
  {
    orderItemId: 'item-004', orderId: 'ord-004', productId: 'prod-004',
    productName: 'Đầu bò máy cắt cỏ', productUnit: 'cái',
    quantity: 1, unitPrice: 250000, totalPrice: 250000,
  },
  {
    orderItemId: 'item-006', orderId: 'ord-005', productId: 'prod-002',
    productName: 'Máy cắt cỏ Husqvarna 125R', productUnit: 'bộ',
    quantity: 13, unitPrice: 4500000, totalPrice: 58500000
  },
  {
    orderItemId: 'item-007', orderId: 'ord-006', productId: 'prod-007',
    productName: 'Máy phun thuốc STIHL SR 420', productUnit: 'cái',
    quantity: 1, unitPrice: 10500000, totalPrice: 10500000,
  },
];

export let mockInstallmentTerms: InstallmentTerm[] = [
  {
    installmentTermId: 'inst-001', orderId: 'ord-003', installmentNumber: 1,
    dueDate: monthsFromNow(1), amount: 2000000,
    paidAt: null, paymentMethod: null, isLate: false, note: 'Kỳ đầu tiên',
    collectedByUserId: null, createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    installmentTermId: 'inst-002', orderId: 'ord-003', installmentNumber: 2,
    dueDate: monthsFromNow(2), amount: 2000000,
    paidAt: null, paymentMethod: null, isLate: false, note: null,
    collectedByUserId: null, createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    installmentTermId: 'inst-003', orderId: 'ord-003', installmentNumber: 3,
    dueDate: monthsFromNow(3), amount: 2000000,
    paidAt: null, paymentMethod: null, isLate: false, note: null,
    collectedByUserId: null, createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
];

export const mockChartData = (() => {
    const data = [];
    const today = new Date('2024-07-30T10:00:00Z');
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('vi-VN', { month: 'short' });
        const revenue = Math.floor(Math.random() * (45000000 - 10000000 + 1)) + 10000000;
        data.push({ month: monthName.charAt(0).toUpperCase() + monthName.slice(1), revenue });
    }
    return data;
})();


export const mockBanks: Bank[] = [
    { bankId: 'VIETCOMBANK', name: 'Vietcombank (VCB)' },
    { bankId: 'TPBANK', name: 'TPBank' },
    { bankId: 'MBBANK', name: 'MB Bank' },
    { bankId: 'ACBBANK', name: 'ACB' },
    { bankId: 'TECHCOMBANK', name: 'Techcombank' },
    { bankId: 'BIDV', name: 'BIDV' },
    { bankId: 'VIETINBANK', name: 'VietinBank' },
    { bankId: 'AGRIBANK', name: 'Agribank' },
    { bankId: 'VPBANK', name: 'VPBank' },
    { bankId: 'SACOMBANK', name: 'Sacombank' },
];

export let mockPurchaseOrders: PurchaseOrder[] = [
    {
      purchaseOrderId: 'po-001',
      orderCode: `PN${new Date(daysAgo(10)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
      supplierId: 'supp-001',
      totalAmount: 21000000,
      status: 'received',
      expectedDeliveryDate: daysAgo(5),
      receivedDate: daysAgo(6),
      note: 'Nhập máy cưa STIHL.',
      createdByUserId: 'user-001',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(6),
    },
    {
      purchaseOrderId: 'po-002',
      orderCode: `PN${new Date(daysAgo(5)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
      supplierId: 'supp-002',
      totalAmount: 35000000,
      status: 'ordered',
      expectedDeliveryDate: daysFromNow(5),
      receivedDate: null,
      note: 'Nhập máy cắt cỏ Husqvarna.',
      createdByUserId: 'user-001',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      purchaseOrderId: 'po-003',
      orderCode: `PN${new Date(daysAgo(3)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
      supplierId: 'supp-001',
      totalAmount: 4000000,
      status: 'pending',
      expectedDeliveryDate: daysFromNow(10),
      receivedDate: null,
      note: 'Nhập phụ tùng STIHL.',
      createdByUserId: 'user-002',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
     {
      purchaseOrderId: 'po-004',
      orderCode: `PN${new Date(daysAgo(15)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
      supplierId: 'supp-002',
      totalAmount: 15000000,
      status: 'cancelled',
      expectedDeliveryDate: daysAgo(10),
      receivedDate: null,
      note: 'Hủy do thay đổi kế hoạch.',
      createdByUserId: 'user-002',
      createdAt: daysAgo(15),
      updatedAt: daysAgo(14),
    },
    {
        purchaseOrderId: 'po-005',
        orderCode: `PN${new Date(daysAgo(40)).toISOString().slice(2, 10).replace(/-/g, '')}001`,
        supplierId: 'supp-003',
        totalAmount: 84000000,
        status: 'received',
        expectedDeliveryDate: daysAgo(35),
        receivedDate: daysAgo(35),
        note: 'Nhập 30 động cơ Honda GX160',
        createdByUserId: 'user-001',
        createdAt: daysAgo(40),
        updatedAt: daysAgo(35),
    }
  ];
  
  export let mockPurchaseOrderItems: PurchaseOrderItem[] = [
    // PO-001
    {
      purchaseOrderItemId: 'poi-001',
      purchaseOrderId: 'po-001',
      productId: 'prod-001',
      quantity: 10,
      unitPrice: 2100000,
      totalPrice: 21000000,
      receivedQuantity: 10,
    },
    // PO-002
    {
      purchaseOrderItemId: 'poi-002',
      purchaseOrderId: 'po-002',
      productId: 'prod-002',
      quantity: 10,
      unitPrice: 3500000,
      totalPrice: 35000000,
      receivedQuantity: 0,
    },
    // PO-003
    {
      purchaseOrderItemId: 'poi-004',
      purchaseOrderId: 'po-003',
      productId: 'prod-005',
      quantity: 5,
      unitPrice: 800000,
      totalPrice: 4000000,
      receivedQuantity: 0,
    },
     // PO-004
    {
      purchaseOrderItemId: 'poi-005',
      purchaseOrderId: 'po-004',
      productId: 'prod-004',
      quantity: 100,
      unitPrice: 150000,
      totalPrice: 15000000,
      receivedQuantity: 0,
    },
    // PO-005
    {
        purchaseOrderItemId: 'poi-006',
        purchaseOrderId: 'po-005',
        productId: 'prod-006',
        quantity: 30,
        unitPrice: 2800000,
        totalPrice: 84000000,
        receivedQuantity: 30,
    }
  ];

export let mockStockAdjustments: StockAdjustment[] = [
  {
    stockAdjustmentId: 'adj-001',
    productId: 'prod-001',
    adjustmentType: 'decrease',
    quantityChange: -1,
    reason: 'Hàng mẫu bị hư hỏng khi trưng bày',
    adjustedByUserId: 'user-001',
    createdAt: daysAgo(1),
  },
  {
    stockAdjustmentId: 'adj-002',
    productId: 'prod-008',
    adjustmentType: 'decrease',
    quantityChange: -2,
    reason: 'Thất thoát do đổ vỡ',
    adjustedByUserId: 'user-002',
    createdAt: daysAgo(50),
  },
  {
    stockAdjustmentId: 'adj-003',
    productId: 'prod-004',
    adjustmentType: 'increase',
    quantityChange: 5,
    reason: 'Kiểm kho cuối tháng, tìm thấy hàng thất lạc',
    adjustedByUserId: 'user-001',
    createdAt: daysAgo(60),
  }
];

export let mockReturnOrders: ReturnOrder[] = [
    {
        returnOrderId: 'ret-001',
        orderId: 'ord-001',
        customerId: 'cust-001',
        returnDate: daysAgo(2),
        totalRefundAmount: 2800000,
        reason: 'Khách đổi ý, muốn mua sản phẩm khác.',
        status: 'refunded',
        processedByUserId: 'user-002',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
    },
    {
        returnOrderId: 'ret-002',
        orderId: 'ord-002',
        customerId: 'cust-002',
        returnDate: daysAgo(1),
        totalRefundAmount: 4500000,
        reason: 'Sản phẩm lỗi kỹ thuật, không khởi động được.',
        status: 'pending',
        processedByUserId: 'user-001',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
    }
];

export let mockReturnOrderItems: ReturnOrderItem[] = [
    {
        returnOrderItemId: 'item-ret-001',
        returnOrderId: 'ret-001',
        productId: 'prod-001',
        quantity: 1,
        unitPrice: 2800000,
        condition: 'new',
        restocked: true,
    },
    {
        returnOrderItemId: 'item-ret-002',
        returnOrderId: 'ret-002',
        productId: 'prod-002',
        quantity: 1,
        unitPrice: 4500000,
        condition: 'damaged',
        restocked: false,
    }
];

export const mockNotifications: Notification[] = [];

// Statically generate notifications to avoid hydration issues
const staticGeneration = () => {
    if (mockNotifications.length > 0) return; // Only generate once

    const baseDate = new Date('2024-07-30T10:00:00Z');

    // Inventory warnings
    const lowStockProducts = mockProducts.filter(p => p.stock > 0 && p.stock <= p.minStockLevel);
    if (lowStockProducts.length > 0) {
        mockNotifications.push({
            notificationId: `notif-inv-${lowStockProducts[0].productId}`,
            type: 'inventory',
            title: 'Sản phẩm sắp hết hàng',
            description: `${lowStockProducts[0].name} chỉ còn ${lowStockProducts[0].stock} sản phẩm.`,
            link: `/products/${lowStockProducts[0].slug}`,
            isRead: false,
            createdAt: new Date(baseDate.getTime() - (1 * 3600000)).toISOString() // 1 hour ago
        });
    }
    if (lowStockProducts.length > 1) {
        mockNotifications.push({
            notificationId: `notif-inv-${lowStockProducts[1].productId}`,
            type: 'inventory',
            title: 'Sản phẩm sắp hết hàng',
            description: `${lowStockProducts[1].name} chỉ còn ${lowStockProducts[1].stock} sản phẩm.`,
            link: `/products/${lowStockProducts[1].slug}`,
            isRead: false,
            createdAt: new Date(baseDate.getTime() - (5 * 3600000)).toISOString() // 5 hours ago
        });
    }

    // Pending orders
    const pendingOrders = mockOrders.filter(o => o.status === 'Pending');
    if (pendingOrders.length > 0) {
        mockNotifications.push({
            notificationId: `notif-ord-pending`,
            type: 'order',
            title: 'Đơn hàng chờ xử lý',
            description: `Bạn có ${pendingOrders.length} đơn hàng đang chờ xử lý.`,
            link: '/orders',
            isRead: false,
            createdAt: new Date(baseDate.getTime() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        });
    }

    // System notifications
    mockNotifications.push({
        notificationId: `notif-sys-update`,
        type: 'system',
        title: 'Cập nhật hệ thống',
        description: 'Phiên bản mới v1.2.0 đã được cài đặt thành công.',
        link: undefined,
        isRead: true,
        createdAt: new Date(baseDate.getTime() - 86400000 * 2).toISOString() // 2 days ago
    });

    // Payment notification
    const paidOrder = mockOrders.find(o => o.status === 'Delivered');
    if (paidOrder) {
        mockNotifications.push({
            notificationId: `notif-ord-paid-${paidOrder.orderId}`,
            type: 'order',
            title: 'Thanh toán thành công',
            description: `Đơn hàng ${paidOrder.orderCode} đã được thanh toán.`,
            link: `/orders/${paidOrder.orderId}`,
            isRead: true,
            createdAt: new Date(baseDate.getTime() - 86400000 * 3).toISOString() // 3 days ago
        });
    }

    // Sort by date
    mockNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

staticGeneration();
    
export const mockVouchers: Voucher[] = [
  { voucherId: 'v-001', name: 'Giảm giá 50.000đ', description: 'Áp dụng cho đơn hàng bất kỳ.', pointsCost: 5000, value: 50000, type: 'fixed' },
  { voucherId: 'v-002', name: 'Giảm giá 100.000đ', description: 'Cho đơn hàng từ 1.000.000đ.', pointsCost: 9500, value: 100000, type: 'fixed' },
  { voucherId: 'v-003', name: 'Giảm giá 10%', description: 'Giảm tối đa 200.000đ.', pointsCost: 15000, value: 10, type: 'percentage' },
  { voucherId: 'v-004', name: 'Miễn phí vận chuyển', description: 'Hỗ trợ tối đa 50.000đ phí ship.', pointsCost: 4000, value: 50000, type: 'shipping' },
  { voucherId: 'v-005', name: 'Giảm giá 500.000đ', description: 'Cho đơn hàng từ 5.000.000đ.', pointsCost: 48000, value: 500000, type: 'fixed' }
];



