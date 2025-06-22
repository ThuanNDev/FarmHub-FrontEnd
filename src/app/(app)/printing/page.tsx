'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, Printer, ChevronsUpDown, Trash2, Plus, Minus } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockOrders, mockProducts, mockCustomers, mockOrderItems, mockStores, mockUsers } from '@/lib/data';
import { Barcode } from '@/components/ui/barcode';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Order = typeof mockOrders[0];
type Product = typeof mockProducts[0];
type ProductToPrint = Product & { labelCount: number };

export default function PrintingPage() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Invoice State
  const [orderCode, setOrderCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [paperSize, setPaperSize] = useState<'k80' | 'a5'>('k80');

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
    
    // Temporarily add the printable content to the body for printing
    const printDiv = document.createElement('div');
    printDiv.id = "printable-content";
    printDiv.innerHTML = printableArea.innerHTML;
    document.body.appendChild(printDiv);
    
    window.print();
    
    // Clean up
    document.body.removeChild(printDiv);
    document.head.removeChild(style);
  };
  
  const handleSearchOrder = () => {
    const order = mockOrders.find(o => o.order_code.toLowerCase() === orderCode.toLowerCase().trim());
    if (order) {
      setFoundOrder(order);
      toast({ title: 'Thành công', description: `Đã tìm thấy đơn hàng ${order.order_code}.` });
    } else {
      setFoundOrder(null);
      toast({ variant: 'destructive', title: 'Không tìm thấy', description: `Không có đơn hàng nào khớp với mã "${orderCode}".` });
    }
  };

  const addProductToPrintList = (product: Product) => {
    if (productsToPrint.some(p => p.id === product.id)) return;
    setProductsToPrint(prev => [...prev, { ...product, labelCount: 12 }]);
  }

  const updateLabelCount = (productId: string, count: number) => {
    const newCount = Math.max(0, count);
    setProductsToPrint(prev => prev.map(p => p.id === productId ? { ...p, labelCount: newCount } : p));
  }

  const removeProductFromPrintList = (productId: string) => {
    setProductsToPrint(prev => prev.filter(p => p.id !== productId));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Printer /> Công cụ in ấn
        </CardTitle>
        <CardDescription>
          In hóa đơn, biên lai, hoặc mã vạch cho sản phẩm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invoice">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">In Hóa Đơn / Biên Lai</TabsTrigger>
            <TabsTrigger value="barcode">In Mã Vạch Sản Phẩm</TabsTrigger>
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
                      <Label>Chọn khổ giấy</Label>
                        <RadioGroup defaultValue="k80" value={paperSize} onValueChange={(val: 'k80' | 'a5') => setPaperSize(val)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="k80" id="k80" />
                                <Label htmlFor="k80">Giấy in nhiệt (K80 - 80mm)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="a5" id="a5" />
                                <Label htmlFor="a5">Giấy A5</Label>
                            </div>
                        </RadioGroup>
                     </div>
                  </CardContent>
                </Card>
                <Button onClick={handlePrint} disabled={!foundOrder} className="w-full bg-accent hover:bg-accent/90">
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
                                    <div key={p.id} className="flex items-center gap-2 p-2 border rounded-md">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.product_code}</p>
                                        </div>
                                        <Input type="number" value={p.labelCount} onChange={e => updateLabelCount(p.id, parseInt(e.target.value))} className="w-16 h-8 text-center" />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProductFromPrintList(p.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                {productsToPrint.length === 0 && <p className="text-sm text-center text-muted-foreground pt-10">Chưa có sản phẩm nào được chọn.</p>}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Button onClick={handlePrint} disabled={productsToPrint.length === 0} className="w-full bg-accent hover:bg-accent/90">
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
        if (!search) return mockProducts.filter(p => p.is_active && !p.is_deleted);
        return mockProducts.filter(p =>
            p.is_active && !p.is_deleted &&
            (p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.product_code.toLowerCase().includes(search.toLowerCase()))
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
                            <Button key={product.id} variant="ghost" className="w-full justify-start font-normal h-auto py-2 text-left" onClick={() => { onProductSelect(product); setOpen(false); setSearch(''); }}>
                                <div>
                                    <p>{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.product_code}</p>
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
          <div key={`${product.id}-${index}`} className="barcode-label flex flex-col items-center justify-center p-1 border border-dashed border-gray-400 text-black bg-white">
            <p className="text-[8px] font-bold text-center leading-tight truncate w-full">{product.name}</p>
            <p className="text-[7px] font-semibold">{new Intl.NumberFormat('vi-VN').format(product.price)} ₫</p>
            <Barcode value={product.product_code} options={{ height: 25, width: 1, fontSize: 10, margin: 2 }} />
            <p className="text-[7px] tracking-wider">{product.product_code}</p>
          </div>
        ))}
      </div>
    );
};


const InvoicePreview = ({ order, paperSize }: { order: Order | null, paperSize: 'k80' | 'a5' }) => {
    if (!order) {
        return <p className="text-center text-muted-foreground pt-20">Tìm kiếm một đơn hàng để xem trước.</p>;
    }
    
    const storeInfo = mockStores[0];
    const customer = mockCustomers.find(c => c.id === order.customer_id);
    const items = mockOrderItems.filter(i => i.order_id === order.id);
    const processor = mockUsers.find(u => u.id === order.processed_by_user_id);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

    if (paperSize === 'a5') {
        return (
            <div className="bg-white text-black shadow-lg mx-auto p-8 w-[148mm] min-h-[210mm] a5-preview">
                <header className="flex justify-between items-start pb-4 border-b">
                    <div className="text-left">
                        <h1 className="font-bold text-2xl">{storeInfo.name}</h1>
                        <p className="text-xs">{storeInfo.address}</p>
                        <p className="text-xs">SĐT: {storeInfo.phone}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-xl uppercase">Hóa Đơn Bán Hàng</h2>
                        <p className="text-xs">Mã ĐH: {order.order_code}</p>
                        <p className="text-xs">Ngày: {formatDate(order.created_at)}</p>
                    </div>
                </header>
                <section className="my-6">
                    <h3 className="font-semibold mb-2">Thông tin khách hàng:</h3>
                    <p className="text-sm"><strong>Tên:</strong> {customer?.name || 'Khách lẻ'}</p>
                    <p className="text-sm"><strong>SĐT:</strong> {customer?.phone || 'N/A'}</p>
                    <p className="text-sm"><strong>Địa chỉ:</strong> {order.delivery_address || customer?.address || 'N/A'}</p>
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
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{item.product_name}</td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                                <td className="p-2 text-right">{formatCurrency(item.total_price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="w-2/5 ml-auto mt-6 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Tạm tính:</span> <strong>{formatCurrency(items.reduce((s, i) => s + i.total_price, 0))}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Giảm giá:</span> <strong>-{formatCurrency(order.discount_amount)}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Phí VC:</span> <strong>{formatCurrency(order.shipping_fee)}</strong></div>
                    <div className="flex justify-between border-t pt-2 mt-2 text-base"><span className="font-bold">Tổng cộng:</span> <strong className="text-lg">{formatCurrency(order.total_amount)}</strong></div>
                    <div className="flex justify-between"><span className="text-gray-600">Đã trả:</span> <strong>{formatCurrency(order.total_paid)}</strong></div>
                    <div className="flex justify-between text-red-600 font-bold"><span className="">Còn lại:</span> <strong>{formatCurrency(order.total_amount - order.total_paid)}</strong></div>
                </div>
                <footer className="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                    <p>{storeInfo.invoice_footer}</p>
                    <p>Nhân viên: {processor?.full_name || 'N/A'}</p>
                </footer>
            </div>
        );
    }

    return (
        <div className="bg-white text-black p-2 font-mono w-[80mm] mx-auto k80-preview shadow-lg">
            <div className="text-center">
                <h1 className="font-bold text-lg">{storeInfo.name}</h1>
                <p className="text-[10px]">{storeInfo.address}</p>
                <p className="text-[10px]">SĐT: {storeInfo.phone}</p>
            </div>
            <div className="my-2 border-b border-dashed border-black"></div>
            <div className="text-center">
                <h2 className="font-bold text-base">HÓA ĐƠN BÁN LẺ</h2>
                <p className="text-[10px]">Mã: {order.order_code}</p>
                <p className="text-[10px]">Ngày: {formatDate(order.created_at)}</p>
            </div>
            <div className="my-2 border-b border-dashed border-black"></div>
             <div className="text-[10px]">
                <p><strong>KH:</strong> {customer?.name || 'Khách lẻ'}</p>
                <p><strong>NV:</strong> {processor?.full_name || 'N/A'}</p>
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
                        <tr key={item.id}>
                            <td className="p-1 align-top">
                                <div>{item.product_name}</div>
                                <div className="pl-1">@{formatCurrency(item.unit_price)}</div>
                            </td>
                            <td className="p-1 text-right align-top">{item.quantity}</td>
                            <td className="p-1 text-right align-top">{formatCurrency(item.total_price)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
              <div className="text-xs my-2 border-t border-dashed border-black pt-2 space-y-1">
                <div className="flex justify-between"><span>Tạm tính:</span> <span>{formatCurrency(items.reduce((s, i) => s + i.total_price, 0))}</span></div>
                <div className="flex justify-between"><span>Giảm giá:</span> <span>-{formatCurrency(order.discount_amount)}</span></div>
                <div className="flex justify-between font-bold text-sm"><span>TỔNG CỘNG:</span> <span>{formatCurrency(order.total_amount)}</span></div>
                <div className="flex justify-between"><span>Đã trả:</span> <span>{formatCurrency(order.total_paid)}</span></div>
                <div className="flex justify-between font-bold"><span>CÒN LẠI:</span> <span>{formatCurrency(order.total_amount - order.total_paid)}</span></div>
              </div>
              <div className="my-2 border-t border-dashed border-black text-center text-[10px] pt-2">
                <p>{storeInfo.invoice_footer}</p>
                <p>{storeInfo.email}</p>
              </div>
        </div>
    );
};
