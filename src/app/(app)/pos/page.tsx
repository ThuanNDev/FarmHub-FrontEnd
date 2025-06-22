'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Minus, X, Search, ArrowLeft, UserPlus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockProducts, mockCustomers, mockCategories, mockStores } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';

type Product = typeof mockProducts[0];
type CartItem = Product & { quantity: number };
type Customer = typeof mockCustomers[0];

const customerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống."),
  phone: z.string().min(1, "Số điện thoại không được để trống."),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal('')),
  address: z.string().optional(),
  tax_code: z.string().optional(),
  customer_type: z.enum(['Retail', 'Wholesale']),
  note: z.string().optional(),
  credit_limit: z.coerce.number().min(0).optional(),
  status: z.enum(['Active', 'Inactive', 'Blocked']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;


export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isAddCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('guest');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const { toast } = useToast();
  const { store } = useStore();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      tax_code: '',
      customer_type: 'Retail',
      note: '',
      credit_limit: 0,
      status: 'Active',
    },
  });

  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId === 'guest') return null;
    return customers.find(c => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart;
      }
      if (product.stock > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      }
      return prevCart;
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else if (newQuantity <= product.stock) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  }

  const handleAddNewCustomer = () => {
    form.reset({
      name: '', phone: '', email: '', address: '', tax_code: '', 
      customer_type: 'Retail', note: '', credit_limit: 0, status: 'Active'
    });
    setAddCustomerDialogOpen(true);
  };

  const onCustomerSubmit = (values: CustomerFormValues) => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
      ...values,
      total_debt: 0,
      debt_due_date: null,
      last_purchase_date: null,
      created_at: now,
      updated_at: now,
      is_deleted: false,
      credit_limit: values.credit_limit || null,
      address: values.address || null,
      tax_code: values.tax_code || null,
      note: values.note || null,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    toast({ title: "Thành công", description: "Khách hàng mới đã được thêm." });
    setAddCustomerDialogOpen(false);
  };
  
  const handleConfirmPayment = () => {
    const remaining = totalWithVat - amountPaid;
    let description = `Đơn hàng đã được tạo.`;

    if (remaining > 0 && selectedCustomer) {
        if (paymentMethod === 'Installment') {
            description += ` Trả trước ${formatCurrency(amountPaid)}, còn lại ${formatCurrency(remaining)} cho khách hàng ${selectedCustomer.name}.`;
        } else { // Assumes 'Debt'
            description += ` Ghi nợ ${formatCurrency(remaining)} cho khách hàng ${selectedCustomer.name}.`;
        }
    }

    toast({
      title: "Tạo đơn hàng thành công!",
      description: description,
    });
    setPaymentDialogOpen(false);
    clearCart();
    setSelectedCustomerId('guest');
  };

  const handleQuickPrint = () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Giỏ hàng trống',
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi in.',
      });
      return;
    }
  
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể mở cửa sổ in. Vui lòng cho phép pop-up.',
      });
      return;
    }
  
    const invoiceDate = new Date().toLocaleDateString('vi-VN');
    const orderCode = `HD${Date.now().toString().slice(-6)}`;
  
    const vatRate = store.is_vat_enabled ? (store.vat_rate || 0) : 0;
  
    const itemsHtml = cart.map(item => `
      <tr class="item">
        <td>
          <div class="item-name">${item.name}</div>
          <div class="item-details">SL: ${item.quantity} x ${formatCurrency(item.price)}</div>
        </td>
        <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');
  
    const vatHtml = store.is_vat_enabled && vatRate > 0 ? `
      <div class="row">
        <span>VAT (${vatRate}%):</span>
        <span>${formatCurrency(vatAmount)}</span>
      </div>
    ` : '';
  
    const invoiceFooterHtml = store.invoice_footer
      ? `<p>${store.invoice_footer.replace(/\n/g, '<br>')}</p>`
      : `<p>Cảm ơn quý khách và hẹn gặp lại!</p>`;
  
    let qrCodeHtml = '';
    if (paymentMethod === 'Transfer' && store?.bank_info && totalWithVat > 0) {
        const params = new URLSearchParams({
            amount: totalWithVat.toString(),
            addInfo: `Thanh toan don hang ${orderCode}`,
            accountName: store.bank_info.account_name,
        });
        const url = `https://img.vietqr.io/image/${store.bank_info.bank_id}-${store.bank_info.account_no}-print.png?${params.toString()}`;
        qrCodeHtml = `
            <div class="qr-code" style="text-align: center; margin-top: 15px;">
                <p style="font-weight: bold; margin-bottom: 5px; font-size: 9pt;">Quét mã QR để thanh toán</p>
                <img src="${url}" alt="QR Code" style="display: block; margin: 0 auto; width: 220px; height: auto;"/>
            </div>
        `;
    }
  
    const invoiceHtml = `
      <html>
        <head>
          <title>Hóa đơn ${orderCode}</title>
          <style>
            @page {
              margin: 0mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              color: #000;
              background: #fff;
              line-height: 1.4;
              margin: 0;
              padding: 0;
            }
            .invoice-wrapper {
              width: 280px; /* ~75mm, suitable for 80mm receipt paper */
              margin: 0 auto;
              padding: 10px 5px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 14pt;
              margin: 0;
              font-weight: bold;
            }
            .header p {
              margin: 2px 0;
              font-size: 9pt;
            }
            .info {
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            .info p {
              margin: 3px 0;
              font-size: 9pt;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .items-table th, .items-table td {
              text-align: left;
              padding: 4px 0;
              vertical-align: top;
              font-size: 9pt;
            }
            .items-table th {
              border-bottom: 1px solid #000;
              font-weight: bold;
            }
            .items-table .item-name {
              line-height: 1.2;
              word-break: break-word;
            }
            .items-table .item-details {
                font-size: 8pt;
                color: #555;
            }
            .items-table th:last-child, .items-table td:last-child {
              text-align: right;
              white-space: nowrap;
            }
            .totals {
              width: 100%;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .totals .row {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
                font-size: 9pt;
            }
            .totals .row.total {
                font-weight: bold;
                font-size: 11pt;
                padding-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 9pt;
            }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <div class="header">
              <h1>${store.name}</h1>
              <p>${store.address}</p>
              <p>SĐT: ${store.phone}</p>
            </div>

            <div class="info">
              <p><strong>Hóa đơn bán lẻ:</strong> ${orderCode}</p>
              <p><strong>Ngày:</strong> ${invoiceDate}</p>
              <p><strong>Khách hàng:</strong> ${selectedCustomer?.name || 'Khách lẻ'}</p>
              ${selectedCustomer ? `<p><strong>SĐT:</strong> ${selectedCustomer.phone}</p>` : ''}
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
               <div class="row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div class="row">
                <span>Giảm giá:</span>
                <span>-${formatCurrency(discount)}</span>
              </div>
              ${vatHtml}
              <div class="row total">
                <span>TỔNG CỘNG:</span>
                <span>${formatCurrency(totalWithVat)}</span>
              </div>
            </div>

            ${qrCodeHtml}

            <div class="footer">
              ${invoiceFooterHtml}
              <p>${store.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    const finalTotal = subtotal - discount;
    return finalTotal > 0 ? finalTotal : 0;
  }, [subtotal, discount]);

  const vatAmount = useMemo(() => {
    if (!store.is_vat_enabled || !store.vat_rate) return 0;
    return total * (store.vat_rate / 100);
  }, [total, store.is_vat_enabled, store.vat_rate]);

  const totalWithVat = useMemo(() => {
    return total + vatAmount;
  }, [total, vatAmount]);


  // Effect to initialize payment dialog state
  useEffect(() => {
    if (isPaymentDialogOpen) {
      setAmountPaid(totalWithVat);
      setPaymentMethod('Cash');
    }
  }, [isPaymentDialogOpen, totalWithVat]);

  // Effect to handle payment method changes (e.g., Debt)
  useEffect(() => {
    if (paymentMethod === 'Debt') {
      setAmountPaid(0);
    }
  }, [paymentMethod]);

  // Effect to generate QR code URL
  useEffect(() => {
    if (isPaymentDialogOpen) {
      const storeInfo = mockStores[0];
      if (paymentMethod === 'Transfer' && storeInfo?.bank_info && amountPaid > 0) {
        const orderCode = `DH${Date.now().toString().slice(-6)}`;
        const params = new URLSearchParams({
          amount: amountPaid.toString(),
          addInfo: `Thanh toan don hang ${orderCode}`,
          accountName: storeInfo.bank_info.account_name,
        });
        const url = `https://img.vietqr.io/image/${storeInfo.bank_info.bank_id}-${storeInfo.bank_info.account_no}-print.png?${params.toString()}`;
        setQrCodeUrl(url);
      } else {
        setQrCodeUrl('');
      }
    }
  }, [isPaymentDialogOpen, amountPaid, paymentMethod]);


  const categories = mockCategories.filter(c => !c.is_deleted && c.is_active);
  const products = mockProducts.filter(p => !p.is_deleted && p.is_active);
  
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter(p => p.category_id === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [products, activeCategory, searchTerm]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  }

  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/300x300.png';
    } catch (e) {
      return 'https://placehold.co/300x300.png';
    }
  }

  return (
    <>
      <div className="grid h-screen w-full grid-cols-10 gap-4 bg-muted/40 p-4">
        {/* Product Selection Area */}
        <div className="col-span-6 flex flex-col gap-4">
          <header className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-sm">
              <Button asChild variant="outline" size="icon" className="h-10 w-10">
                  <Link href="/">
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Quay lại Dashboard</span>
                  </Link>
              </Button>
              <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm sản phẩm bằng tên hoặc mã vạch..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 rounded-lg bg-background p-4 shadow-sm">
            <Tabs defaultValue="all" onValueChange={(val) => setActiveCategory(val === 'all' ? null : val)}>
                  <TabsList>
                      <TabsTrigger value="all">Tất cả</TabsTrigger>
                      {categories.map(cat => (
                      <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                      ))}
                  </TabsList>
                  <ScrollArea className="mt-4 h-[calc(100vh-200px)]">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pr-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
                          onClick={() => addToCart(product)}
                        >
                          <div className="relative">
                              <Image
                              src={getImageUrl(product.images)}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="aspect-square w-full object-cover"
                              data-ai-hint={product.hint}
                              />
                              <div className="absolute top-1 right-1 bg-background/80 text-foreground text-xs font-bold px-2 py-1 rounded-full">
                                  Tồn kho: {product.stock}
                              </div>
                          </div>
                          <CardContent className="p-2 text-center">
                            <p className="text-sm font-semibold truncate group-hover:text-primary">{product.name}</p>
                            <p className="text-sm text-muted-foreground font-bold">{formatCurrency(product.price)}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
              </Tabs>
          </main>
        </div>

        {/* Cart Area */}
        <div className="col-span-4">
          <Card className="flex h-full flex-col shadow-sm">
            <CardHeader className="p-4 border-b">
              <div className="flex items-center gap-2">
                  <Select value={selectedCustomerId} onValueChange={(value) => setSelectedCustomerId(value || 'guest')}>
                      <SelectTrigger>
                          <SelectValue placeholder="Chọn một khách hàng" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="guest">Khách lẻ</SelectItem>
                          {customers.filter(c => !c.is_deleted && c.status === 'Active').map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={handleAddNewCustomer}>
                      <UserPlus className="h-4 w-4" />
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                  {cart.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">Chọn sản phẩm để thêm vào giỏ hàng.</p>
                      </div>
                  ) : (
                  <div className="grid gap-4 p-4">
                      {cart.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                          <div className="col-span-5">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="col-span-4 flex items-center justify-center gap-1">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                          </Button>
                          <Input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="h-6 w-10 text-center p-0 border-0 shadow-none focus-visible:ring-0"
                          />
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                          </Button>
                          </div>
                          <p className="col-span-2 text-right font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                          <Button size="icon" variant="ghost" className="col-span-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => updateQuantity(item.id, 0)}>
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                      ))}
                  </div>
                  )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-4 border-t bg-muted/40">
              <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <Label htmlFor="discount">Giảm giá</Label>
                      <Input 
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="h-8 w-32 text-right"
                          placeholder="0"
                      />
                  </div>
                  {store.is_vat_enabled && store.vat_rate > 0 && (
                    <div className="flex justify-between">
                        <span>VAT ({store.vat_rate}%)</span>
                        <span className="font-medium">{formatCurrency(vatAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                      <span>Khách phải trả</span>
                      <span>{formatCurrency(totalWithVat)}</span>
                  </div>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={cart.length === 0} onClick={() => setPaymentDialogOpen(true)}>
                Tạo đơn hàng
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Thêm khách hàng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết của khách hàng.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCustomerSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khách hàng</FormLabel>
                    <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl><Input placeholder="0901234567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="nguyenvana@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl><Textarea placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl><Input placeholder="Tùy chọn" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn mức công nợ</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại khách hàng</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn loại khách" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Retail">Khách lẻ</SelectItem>
                          <SelectItem value="Wholesale">Khách sỉ</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Hoạt động</SelectItem>
                          <SelectItem value="Inactive">Không hoạt động</SelectItem>
                          <SelectItem value="Blocked">Bị chặn</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl><Textarea placeholder="Thông tin thêm về khách hàng..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu khách hàng</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">Hoàn tất đơn hàng</DialogTitle>
                <DialogDescription>
                    Kiểm tra thông tin, phương thức thanh toán và tạo đơn hàng.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Khách hàng</span>
                        <span className="font-medium">{selectedCustomer?.name || 'Khách lẻ'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span>{formatCurrency(totalWithVat)}</span>
                    </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                     <div>
                        <Label htmlFor="amount-paid">Số tiền thanh toán</Label>
                        <Input
                            id="amount-paid"
                            type="number"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                            className="text-right text-lg font-bold"
                        />
                    </div>
                    {(totalWithVat - amountPaid) > 0 && (
                        <div className="flex justify-between text-sm text-destructive font-semibold text-right">
                            <span>Còn lại</span>
                            <span>{formatCurrency(totalWithVat - amountPaid)}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Phương thức thanh toán</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                                <RadioGroupItem value="Cash" id="cash" className="peer sr-only" />
                                <Label htmlFor="cash" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Tiền mặt
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Card" id="card" className="peer sr-only" />
                                <Label htmlFor="card" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    Thẻ
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Transfer" id="transfer" className="peer sr-only" />
                                <Label htmlFor="transfer" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    C.Khoản
                                </Label>
                            </div>
                             <div>
                                <RadioGroupItem value="Debt" id="debt" className="peer sr-only" disabled={!selectedCustomer} />
                                <Label 
                                    htmlFor="debt" 
                                    className={cn(
                                        "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                        !selectedCustomer && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    Ghi nợ
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Installment" id="installment" className="peer sr-only" disabled={!selectedCustomer} />
                                <Label 
                                    htmlFor="installment" 
                                    className={cn(
                                        "flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                        !selectedCustomer && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    Trả góp
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {paymentMethod === 'Transfer' && (
                        <div className="flex flex-col items-center gap-2 pt-4">
                           {qrCodeUrl ? (
                            <Image
                                src={qrCodeUrl}
                                width={250}
                                height={250}
                                alt="QR Code"
                                data-ai-hint="payment qr code"
                            />
                           ) : (
                            <div className="flex h-[250px] w-[250px] items-center justify-center rounded-md bg-muted">
                                <p className="text-center text-sm text-muted-foreground">Không thể tạo mã QR.</p>
                            </div>
                           )}
                            <p className="text-sm text-muted-foreground">Quét mã để thanh toán</p>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="delivery-address">Địa chỉ giao hàng (nếu có)</Label>
                        <Textarea 
                            id="delivery-address" 
                            placeholder="Để trống nếu nhận tại cửa hàng"
                            defaultValue={selectedCustomer?.address || ''}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                <Button variant="outline" onClick={handleQuickPrint}>
                    <Printer className="mr-2 h-4 w-4"/>
                    Hoá đơn in nhanh
                </Button>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleConfirmPayment} className="bg-primary hover:bg-primary/90">Xác nhận & Tạo đơn</Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
