
'use client';
import React, { useState, useMemo, useRef } from 'react';
import { Search, Printer, ChevronsUpDown, Trash2 } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockOrders, mockProducts, mockCustomers, mockOrderItems, mockStores, mockUsers } from '@/lib/data';
import { Barcode } from '@/components/ui/barcode';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/StoreContext';

type Order = typeof mockOrders[0];
type Product = typeof mockProducts[0];
type ProductToPrint = Product & { labelCount: number };

export default function PrintingPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const { store } = useStore();
  const paperSize = store.defaultPaperSize || 'k80';

  // Invoice State
  const [orderCode, setOrderCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);

  // Barcode State
  const [productsToPrint, setProductsToPrint] = useState<ProductToPrint[]>([]);

  const handlePrint = () => {
    const printableArea = printRef.current;
    if (!printableArea) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không tìm thấy khu vực để in.' });
      return;
    }
  
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > * {
          display: none !important;
        }
        #printable-content, #printable-content * {
          display: block !important;
          visibility: visible !important;
        }
        #printable-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    const printDiv = document.createElement('div');
    printDiv.id = "printable-content";
    printDiv.innerHTML = printableArea.innerHTML;
    document.body.appendChild(printDiv);
    
    window.print();
    
    document.body.removeChild(printDiv);
    document.head.removeChild(style);
  };
  
  const handleSearchOrder = () => {
    const order = mockOrders.find(o => o.orderCode.toLowerCase() === orderCode.toLowerCase().trim());
    if (order) {
      setFoundOrder(order);
      toast({ title: 'Thành công', description: `Đã tìm thấy đơn hàng ${order.orderCode}.` });
    } else {
      setFoundOrder(null);
      toast({ variant: 'destructive', title: 'Không tìm thấy', description: `Không có đơn hàng nào khớp với mã "${orderCode}".` });
    }
  };

  const addProductToPrintList = (product: Product) => {
    if (productsToPrint.some(p => p.productId === product.productId)) return;
    setProductsToPrint(prev => [...prev, { ...product, labelCount: 12 }]);
  }

  const updateLabelCount = (productId: string, count: number) => {
    const newCount = Math.max(0, count);
    setProductsToPrint(prev => prev.map(p => p.productId === productId ? { ...p, labelCount: newCount } : p));
  }

  const removeProductFromPrintList = (productId: string) => {
    setProductsToPrint(prev => prev.filter(p => p.productId !== productId));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Printer /> Công cụ in ấn
        </CardTitle>
        <CardDescription>
          In hóa đơn, biên lai, hoặc mã vạch cho sản phẩm. Khổ giấy mặc định được cài đặt trong trang Cài đặt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invoice">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">In Hóa Đơn / Biên Lai</TabsTrigger>
            <TabsTrigger value="barcode">In Tem Mã Vạch</TabsTrigger>
          </TabsList>
          
          {/* Invoice Printing Tab */}
          <TabsContent value="invoice" className="mt-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tùy chọn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="order-code">Tìm theo mã đơn hàng</Label>
                      <div className="flex items-center gap-2">
                        <Input id="order-code" placeholder="VD: DH20240725001" value={orderCode} onChange={e => setOrderCode(e.target.value)} />
                        <Button size="icon" onClick={handleSearchOrder}><Search className="h-4 w-4" /></Button>
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label>Khổ giấy mặc định</Label>
                      <p className="text-sm font-semibold text-primary">{paperSize === 'k80' ? 'K80 (80mm)' : paperSize === 'a5' ? 'A5' : 'K58 (58mm)'}</p>
                      <p className="text-xs text-muted-foreground">Thay đổi trong trang Cài đặt.</p>
                     </div>
                  </CardContent>
                </Card>
                <Button onClick={handlePrint} disabled={!foundOrder} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Printer className="mr-2 h-4 w-4"/> In Hóa Đơn
                </Button>
              </div>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Xem trước</CardTitle>
                  </CardHeader>
                  <CardContent className="bg-muted p-4 rounded-lg min-h-[60vh] overflow-y-auto">
                    <div ref={printRef}>
                      <InvoicePreview order={foundOrder} paperSize={paperSize} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Barcode Printing Tab */}
          <TabsContent value="barcode" className="mt-4">
            <div className="grid md:grid-cols-3 gap-6">
                 <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Sản phẩm cần in tem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ProductSelector onProductSelect={addProductToPrintList} />
                            <Separator />
                            <ScrollArea className="h-80">
                                <div className="space-y-2 pr-4">
                                {productsToPrint.map(p => (
                                    <div key={p.productId} className="flex items-center gap-2 p-2 border rounded-md">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.productCode}</p>
                                        </div>
                                        <Input type="number" value={p.labelCount} onChange={e => updateLabelCount(p.productId, parseInt(e.target.value))} className="w-16 h-8 text-center" />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProductFromPrintList(p.productId)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                {productsToPrint.length === 0 && <p className="text-sm text-center text-muted-foreground pt-10">Chưa có sản phẩm nào được chọn.</p>}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Button onClick={handlePrint} disabled={productsToPrint.length === 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Printer className="mr-2 h-4 w-4"/> In Tem Mã Vạch
                    </Button>
                 </div>
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Xem trước</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-muted p-4 rounded-lg min-h-[60vh] overflow-y-auto">
                            <div ref={printRef}>
                                <BarcodePreview products={productsToPrint} />
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// --- Internal Components ---

const ProductSelector = ({ onProductSelect }: { onProductSelect: (product: Product) => void }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {
        if (!search) return mockProducts.filter(p => p.isActive && !p.isDeleted);
        return mockProducts.filter(p =>
            p.isActive && !p.isDeleted &&
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.productCode.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    Chọn hoặc tìm sản phẩm...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Input placeholder="Tìm theo tên hoặc mã..." value={search} onChange={(e) => setSearch(e.target.value)} className="m-2 w-[calc(100%-1rem)]" />
                <Separator />
                <ScrollArea className="h-72">
                    <div className="p-2 space-y-1">
                        {filteredProducts.map((product) => (
                            <Button key={product.productId} variant="ghost" className="w-full justify-start font-normal h-auto py-2 text-left" onClick={() => { onProductSelect(product); setOpen(false); setSearch(''); }}>
                                <div>
                                    <p>{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.productCode}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

const BarcodePreview = ({ products }: { products: ProductToPrint[] }) => {
    const allLabels = useMemo(() => {
        return products.flatMap(p => Array.from({ length: p.labelCount }, () => p));
    }, [products]);

    if(allLabels.length === 0) {
        return <p className="text-center text-muted-foreground pt-20">Chọn sản phẩm và số lượng để xem trước.</p>;
    }
    
    return (
      <div className="barcode-grid grid grid-cols-4 gap-x-1 gap-y-2">
        {allLabels.map((product, index) => (
          <div key={`${product.productId}-${index}`} className="barcode-label flex flex-col items-center justify-center p-1 border border-dashed border-gray-400 text-black bg-white">
            <p className="text-[8px] font-bold text-center leading-tight truncate w-full">{product.name}</p>
            <p className="text-[7px] font-semibold">{new Intl.NumberFormat('vi-VN').format(product.price)} ₫</p>
            <Barcode value={product.productCode} options={{ height: 25, width: 1, fontSize: 10, margin: 2 }} />
            <p className="text-[7px] tracking-wider">{product.productCode}</p>
          </div>
        ))}
      </div>
    );
};


const InvoicePreview = ({ order, paperSize }: { order: Order | null, paperSize: 'k80' | 'a5' | 'k58' }) => {
    if (!order) {
        return <p className="text-center text-muted-foreground pt-20">Tìm kiếm một đơn hàng để xem trước.</p>;
    }
    
    const storeInfo = mockStores[0];
    const customer = mockCustomers.find(c => c.customerId === order.customerId);
    const items = mockOrderItems.filter(i => i.orderId === order.orderId);
    const processor = mockUsers.find(u => u.userId === order.processedByUserId);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

    if (paperSize === 'a5') {
        return (
            <div className="bg-white text-black shadow-lg mx-auto p-8 w-[148mm] min-h-[210mm] a5-preview">
                <header className="flex justify-between items-start pb-4 border-b">
                    <div className="text-left">
                        <h1 className="font-bold text-2xl">{storeInfo.name}</h1>
                        <p className="text-xs">${storeInfo.address}</p>
                        <p className="text-xs">SĐT: ${storeInfo.phone}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-xl uppercase">Hóa Đơn Bán Hàng</h2>
                        <p className="text-xs">Mã ĐH: ${order.orderCode}</p>
                        <p className="text-xs">Ngày: ${formatDate(order.createdAt)}</p>
                    </div>
                </header>
                <section className="my-6">
                    <h3 className="font-semibold mb-2">Thông tin khách hàng:</h3>
                    <p className="text-sm"><strong>Tên:</strong> ${customer?.name || 'Khách lẻ'}</p>
                    <p className="text-sm"><strong>SĐT:</strong> ${customer?.phone || 'N/A'}</p>
                    <p className="text-sm"><strong>Địa chỉ:</strong> ${order.deliveryAddress || customer?.address || 'N/A'}</p>
                </section>
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left font-semibold">Sản phẩm</th>
                            <th className="p-2 text-center font-semibold">SL</th>
                            <th className="p-2 text-right font-semibold">Đơn giá</th>
                            <th className="p-2 text-right font-semibold">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.orderItemId} className="border-b">
                                <td className="p-2">${item.productName}</td>
                                <td className="p-2 text-center">${item.quantity}</td>
                                <td className="p-2 text-right">${formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right">${formatCurrency(item.totalPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="w-2/5 ml-auto mt-6 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Tạm tính:</span> <strong>${formatCurrency(items.reduce((s, i) => s + i.totalPrice, 0))}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Giảm giá:</span> <strong>-${formatCurrency(order.discountAmount)}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Phí VC:</span> <strong>${formatCurrency(order.shippingFee)}</strong></div>
                    <div className="flex justify-between border-t pt-2 mt-2 text-base"><span className="font-bold">Tổng cộng:</span> <strong className="text-lg">${formatCurrency(order.totalAmount)}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Đã trả:</span> <strong>${formatCurrency(order.totalPaid)}</strong></div>
                    <div className="flex justify-between text-red-600 font-bold"><span className="">Còn lại:</span> <strong>${formatCurrency(order.totalAmount - order.totalPaid)}</strong></div>
                </div>
                <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                    <p>${storeInfo.invoiceFooter}</p>
                    <p>Nhân viên: ${processor?.fullName || 'N/A'}</p>
                </footer>
            </div>
        );
    }

    const thermalClass = paperSize === 'k58' ? 'w-[58mm]' : 'w-[80mm]';
    return (
        <div className={cn("bg-white text-black p-2 font-mono mx-auto shadow-lg", thermalClass)}>
            <div className="text-center">
                <h1 className="font-bold text-lg">{storeInfo.name}</h1>
                <p className="text-[10px]">${storeInfo.address}</p>
                <p className="text-[10px]">SĐT: ${storeInfo.phone}</p>
            </div>
            <div className="my-2 border-b border-dashed border-black"></div>
            <div className="text-center">
                <h2 className="font-bold text-base">HÓA ĐƠN BÁN LẺ</h2>
                <p className="text-[10px]">Mã: ${order.orderCode}</p>
                <p className="text-[10px]">Ngày: ${formatDate(order.createdAt)}</p>
            </div>
            <div className="my-2 border-b border-dashed border-black"></div>
             <div className="text-[10px]">
                <p><strong>KH:</strong> ${customer?.name || 'Khách lẻ'}</p>
                <p><strong>NV:</strong> ${processor?.fullName || 'N/A'}</p>
             </div>
             <table className="w-full text-[10px] my-2">
                <thead>
                    <tr className="border-t border-b border-dashed border-black">
                        <th className="p-1 text-left">Tên hàng</th>
                        <th className="p-1 text-right">SL</th>
                        <th className="p-1 text-right">T.Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.orderItemId}>
                            <td className="p-1 align-top">
                                <div>${item.productName}</div>
                                <div className="pl-1">@{formatCurrency(item.unitPrice)}</div>
                            </td>
                            <td className="p-1 text-right align-top">${item.quantity}</td>
                            <td className="p-1 text-right align-top">${formatCurrency(item.totalPrice)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
              <div className="text-xs my-2 border-t border-dashed border-black pt-2 space-y-1">
                <div className="flex justify-between"><span>Tạm tính:</span> <span>${formatCurrency(items.reduce((s, i) => s + i.totalPrice, 0))}</span></div>
                <div className="flex justify-between"><span>Giảm giá:</span> <span>-${formatCurrency(order.discountAmount)}</span></div>
                <div className="flex justify-between font-bold text-sm"><span>TỔNG CỘNG:</span> <span>${formatCurrency(order.totalAmount)}</span></div>
                <div className="flex justify-between"><span>Đã trả:</span> <span>${formatCurrency(order.totalPaid)}</span></div>
                <div className="flex justify-between font-bold"><span>CÒN LẠI:</span> <span>${formatCurrency(order.totalAmount - order.totalPaid)}</span></div>
              </div>
              <div className="my-2 border-t border-dashed border-black text-center text-[10px] pt-2">
                <p>${storeInfo.invoiceFooter}</p>
                <p>${storeInfo.email}</p>
              </div>
        </div>
    );
};
