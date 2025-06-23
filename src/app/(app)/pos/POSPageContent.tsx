
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Minus, X, Search, ArrowLeft, UserPlus, Printer, Leaf, User, ChevronsUpDown, Gift } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockProducts, mockCustomers, mockCategories, mockStores, mockUsers, mockOrders, mockOrderItems, mockInstallmentTerms, mockVouchers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/StoreContext';
import { useLanguage } from '@/store/LanguageContext';
import { customerSchema } from '@/lib/form-schemas';
import type { Product, Customer, Voucher, PriceTier } from '@/types';

type CartItem = Product & {
  quantity: number;
  appliedPrice: number;
};
type CustomerFormValues = z.infer<typeof customerSchema>;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export default function POSPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [globalPriceTier, setGlobalPriceTier] = useState<PriceTier>('retail');
  const [isCustomerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [customerTender, setCustomerTender] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [installmentTermCount, setInstallmentTermCount] = useState(3);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { store } = useStore();
  const { t } = useLanguage();

  const currentUser = useMemo(() => mockUsers.find(u => u.isActive), []);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      customerType: 'Retail',
      note: '',
      creditLimit: 0,
      status: 'Active',
    },
  });

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
        setEditingOrderId(orderId);
        const orderToEdit = mockOrders.find(o => o.orderId === orderId);
        if (orderToEdit) {
            const itemsToEdit = mockOrderItems.filter(i => i.orderId === orderId);
            const customer = mockCustomers.find(c => c.customerId === orderToEdit.customerId);

            setSelectedCustomerId(orderToEdit.customerId || 'guest');
            // This is a simplification. Full voucher logic in edit mode is complex.
            setDiscount(orderToEdit.discountAmount); 
            setSelectedVoucher(null); // Vouchers are not carried over to edit mode for simplicity

            setCart(itemsToEdit.map(item => {
                const product = mockProducts.find(p => p.productId === item.productId);
                return {
                    ...(product as Product), // assume product is found
                    quantity: item.quantity,
                    appliedPrice: item.unitPrice,
                };
            }));
            if (customer) {
                setGlobalPriceTier(customer.customerType === 'Wholesale' ? 'wholesale' : 'retail');
            }
        }
    }
  }, [searchParams]);

  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId === 'guest') return null;
    return customers.find(c => c.customerId === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const filteredCustomersForSearch = useMemo(() => {
    const activeCustomers = customers.filter(c => !c.isDeleted && c.status === 'Active');
    if (!customerSearch) return activeCustomers;
    return activeCustomers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
         c.phone.includes(customerSearch)
    );
}, [customers, customerSearch]);

  const Shortcut = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        {children}
    </kbd>
  );

  // Set global price tier based on customer type
  useEffect(() => {
    const customer = customers.find(c => c.customerId === selectedCustomerId);
    const newTier = customer?.customerType === 'Wholesale' ? 'wholesale' : 'retail';
    setGlobalPriceTier(newTier);
  }, [selectedCustomerId, customers]);

  // Update all cart item prices when global price tier changes
  useEffect(() => {
    setCart(prevCart => prevCart.map(item => ({
        ...item,
        appliedPrice: getPriceByTier(item, globalPriceTier)
    })));
  }, [globalPriceTier]);


  const getPriceByTier = (product: Product, tier: PriceTier): number => {
    switch(tier) {
      case 'wholesale': return product.wholesalePrice || product.price;
      case 'credit': return product.creditPrice || product.price;
      default: return product.price;
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.productId);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return prevCart.map((item) =>
            item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        toast({
          variant: 'destructive',
          title: 'Hết hàng',
          description: `Số lượng sản phẩm ${product.name} trong kho không đủ.`
        });
        return prevCart;
      }
      if (product.stock > 0) {
        const newCartItem: CartItem = { 
            ...product, 
            quantity: 1,
            appliedPrice: getPriceByTier(product, globalPriceTier),
        };
        return [...prevCart, newCartItem];
      }
      toast({
        variant: 'destructive',
        title: 'Hết hàng',
        description: `Sản phẩm ${product.name} đã hết hàng.`
      });
      return prevCart;
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    } else if (newQuantity <= product.stock) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedVoucher(null);
    setEditingOrderId(null);
    router.replace('/pos', { scroll: false });
  }

  const handleAddNewCustomer = () => {
    form.reset({
      name: '', phone: '', email: '', address: '', taxCode: '', 
      customerType: 'Retail', note: '', creditLimit: 0, status: 'Active'
    });
    setAddCustomerDialogOpen(true);
  };

  const onCustomerSubmit = (values: CustomerFormValues) => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      customerId: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
      ...values,
      totalDebt: 0,
      debtDueDate: null,
      lastPurchaseDate: null,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      creditLimit: values.creditLimit || null,
      address: values.address || null,
      taxCode: values.taxCode || null,
      note: values.note || null,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    toast({ title: t('common.success'), description: t('pages.customers.success_add') });
    setAddCustomerDialogOpen(false);
  };
  
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.appliedPrice * item.quantity, 0);
  }, [cart]);

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher || subtotal === 0) {
      return 0;
    }
    
    let discountValue = 0;
    if (selectedVoucher.type === 'fixed') {
      discountValue = selectedVoucher.value;
    } else if (selectedVoucher.type === 'percentage') {
      // The mock voucher has a cap of 200.000đ in its description
      const maxDiscount = 200000;
      discountValue = Math.min(subtotal * (selectedVoucher.value / 100), maxDiscount);
    }
    
    return Math.min(discountValue, subtotal);
  }, [selectedVoucher, subtotal]);

  const total = useMemo(() => {
    const finalTotal = subtotal - discount - voucherDiscount;
    return finalTotal > 0 ? finalTotal : 0;
  }, [subtotal, discount, voucherDiscount]);

  const vatAmount = useMemo(() => {
    if (!store.isVatEnabled || !store.vatRate) return 0;
    return total * (store.vatRate / 100);
  }, [total, store.isVatEnabled, store.vatRate]);

  const totalWithVat = useMemo(() => {
    return total + vatAmount;
  }, [total, vatAmount]);

  const handleConfirmPayment = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: t('pos.error_empty_cart') });
      return;
    }
    
    if (!currentUser) {
        toast({ variant: 'destructive', title: t('common.error'), description: t('pos.error_no_user')});
        return;
    }

    const now = new Date();
    const deliveryAddress = (document.getElementById('delivery-address') as HTMLTextAreaElement)?.value || selectedCustomer?.address || '';
    const finalAmountPaid = paymentMethod === 'Cash' ? Math.min(customerTender, totalWithVat) : amountPaid;
    const remaining = totalWithVat - finalAmountPaid;

    if (remaining > 0 && !selectedCustomer) {
        toast({
            variant: 'destructive',
            title: t('pos.error_debt_for_guest_title'),
            description: t('pos.error_debt_for_guest_desc'),
        });
        return;
    }

    if (editingOrderId) {
        // --- UPDATE EXISTING ORDER ---
        const orderIndex = mockOrders.findIndex(o => o.orderId === editingOrderId);
        if (orderIndex === -1) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không tìm thấy đơn hàng để cập nhật.' });
            return;
        }

        const originalOrder = mockOrders[orderIndex];
        const originalItems = mockOrderItems.filter(item => item.orderId === editingOrderId);

        // Revert old stock
        originalItems.forEach(item => {
            const product = mockProducts.find(p => p.productId === item.productId);
            if (product) product.stock += item.quantity;
        });

        // Apply new stock
        cart.forEach(item => {
            const product = mockProducts.find(p => p.productId === item.productId);
            if (product) product.stock -= item.quantity;
        });
        
        // Update order
        originalOrder.totalAmount = totalWithVat;
        originalOrder.discountAmount = discount + voucherDiscount;
        originalOrder.totalPaid = finalAmountPaid;
        originalOrder.paymentType = paymentMethod as any;
        originalOrder.deliveryAddress = deliveryAddress;
        originalOrder.note = (document.getElementById('note') as HTMLTextAreaElement)?.value || originalOrder.note;
        originalOrder.updatedAt = now.toISOString();

        // Update order items
        const newOrderItems = cart.map(item => ({
            orderItemId: `item-${originalOrder.orderId}-${item.productId}`,
            orderId: originalOrder.orderId,
            productId: item.productId,
            productName: item.name,
            productUnit: item.unit,
            quantity: item.quantity,
            unitPrice: item.appliedPrice,
            totalPrice: item.appliedPrice * item.quantity,
        }));
        // Remove old items and add new ones
        const otherItems = mockOrderItems.filter(item => item.orderId !== editingOrderId);
        mockOrderItems.length = 0;
        mockOrderItems.push(...otherItems, ...newOrderItems);
        
        toast({ title: "Thành công", description: `Đơn hàng ${originalOrder.orderCode} đã được cập nhật.` });

    } else {
        // --- CREATE NEW ORDER ---
        const newOrderCode = `DH${now.toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;
        let description = t('pos.success_order_created', { code: newOrderCode });

        const newOrder: (typeof mockOrders)[0] = {
            orderId: `ord-${now.getTime()}`,
            orderCode: newOrderCode,
            customerId: selectedCustomerId,
            totalAmount: totalWithVat,
            discountAmount: discount + voucherDiscount,
            shippingFee: 0, 
            totalPaid: finalAmountPaid,
            paymentType: paymentMethod as any,
            paymentDetails: `Thanh toán tại POS bằng ${paymentMethod}`,
            status: 'Delivered' as const,
            expectedDeliveryDate: null,
            deliveryAddress: deliveryAddress,
            deliveryStatus: deliveryAddress ? 'Processing' as const : 'Completed' as const,
            note: (document.getElementById('note') as HTMLTextAreaElement)?.value || 'Đơn hàng tạo tại POS',
            processedByUserId: currentUser.userId,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        mockOrders.unshift(newOrder);
        
        cart.forEach(item => {
            const newOrderItem = {
                orderItemId: `item-${newOrder.orderId}-${item.productId}`,
                orderId: newOrder.orderId,
                productId: item.productId,
                productName: item.name,
                productUnit: item.unit,
                quantity: item.quantity,
                unitPrice: item.appliedPrice,
                totalPrice: item.appliedPrice * item.quantity,
            };
            mockOrderItems.push(newOrderItem);
            
            const productInDb = mockProducts.find(p => p.productId === item.productId);
            if (productInDb) {
                productInDb.stock -= item.quantity;
            }
        });

        if (selectedVoucher && selectedCustomer) {
            const customerInDb = mockCustomers.find(c => c.customerId === selectedCustomer.customerId);
            if (customerInDb) {
                const newPoints = customerInDb.loyaltyPoints - selectedVoucher.pointsCost;
                customerInDb.loyaltyPoints = newPoints < 0 ? 0 : newPoints;
            }
        }

        if (remaining > 0 && selectedCustomer) {
            const customerInDb = mockCustomers.find(c => c.customerId === selectedCustomer.customerId);
            if (customerInDb) {
                if (paymentMethod === 'Installment') {
                    const termCount = installmentTermCount; 
                    const amountPerTerm = Math.ceil(remaining / termCount);
                    for (let i = 1; i <= termCount; i++) {
                        const dueDate = new Date(now);
                        dueDate.setMonth(dueDate.getMonth() + i);
                        const newTerm: (typeof mockInstallmentTerms)[0] = {
                            installmentTermId: `inst-${newOrder.orderId}-${i}`,
                            orderId: newOrder.orderId,
                            installmentNumber: i,
                            dueDate: dueDate.toISOString(),
                            amount: amountPerTerm,
                            paidAt: null,
                            paymentMethod: null,
                            isLate: false,
                            note: `Kỳ ${i}/${termCount}`,
                            collectedByUserId: null,
                            createdAt: now.toISOString(),
                            updatedAt: now.toISOString(),
                        };
                        mockInstallmentTerms.push(newTerm);
                    }
                    description += t('pos.success_installment', { amount: formatCurrency(remaining), count: termCount });
                } else {
                    customerInDb.totalDebt += remaining;
                    customerInDb.lastPurchaseDate = now.toISOString();
                    description += t('pos.success_on_credit', { amount: formatCurrency(remaining), name: selectedCustomer.name });
                }
            }
        }
        toast({ title: t('common.success'), description: description });
    }

    setPaymentDialogOpen(false);
    clearCart();
    setSelectedCustomerId('guest');
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setVoucherDialogOpen(false);
    let discountValue = 0;
    if (voucher.type === 'fixed') {
        discountValue = voucher.value;
    } else if (voucher.type === 'percentage') {
        const maxDiscount = 200000;
        discountValue = Math.min(subtotal * (voucher.value / 100), maxDiscount);
    }
    toast({
        title: "Đã áp dụng voucher",
        description: `Bạn được giảm ${formatCurrency(Math.min(discountValue, subtotal))}.`,
    });
  };

  const handleQuickPrint = useCallback(() => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: t('pos.error_empty_cart'),
        description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi in.',
      });
      return;
    }
  
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Không thể mở cửa sổ in. Vui lòng cho phép pop-up.',
      });
      return;
    }
  
    const invoiceDate = new Date().toLocaleDateString('vi-VN');
    const orderCode = `HD${Date.now().toString().slice(-6)}`;
    const vatRate = store.isVatEnabled ? (store.vatRate || 0) : 0;
    const itemsHtml = cart.map(item => `
      <tr class="item">
        <td>
          <div class="item-name">${item.name}</div>
          <div class="item-details">SL: ${item.quantity} x ${formatCurrency(item.appliedPrice)}</div>
        </td>
        <td class="text-right">${formatCurrency(item.appliedPrice * item.quantity)}</td>
      </tr>
    `).join('');
  
    const vatHtml = store.isVatEnabled && vatRate > 0 ? `
      <div class="row">
        <span>VAT (${vatRate}%):</span>
        <span>${formatCurrency(vatAmount)}</span>
      </div>
    ` : '';
  
    const invoiceFooterHtml = store.invoiceFooter
      ? `<p>${store.invoiceFooter.replace(/\n/g, '<br>')}</p>`
      : `<p>Cảm ơn quý khách và hẹn gặp lại!</p>`;
  
    let qrCodeHtml = '';
    if (paymentMethod === 'Transfer' && store?.bankInfo && totalWithVat > 0) {
        const params = new URLSearchParams({
            amount: totalWithVat.toString(),
            addInfo: `Thanh toan don hang ${orderCode}`,
            accountName: store.bankInfo.accountName,
        });
        const url = `https://img.vietqr.io/image/${store.bankInfo.bankId}-${store.bankInfo.accountNo}-print.png?${params.toString()}`;
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
            @page { margin: 0mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; line-height: 1.4; margin: 0; padding: 0; }
            .invoice-wrapper { width: 280px; margin: 0 auto; padding: 10px 5px; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { font-size: 14pt; margin: 0; font-weight: bold; }
            .header p { margin: 2px 0; font-size: 9pt; }
            .info { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
            .info p { margin: 3px 0; font-size: 9pt; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .items-table th, .items-table td { text-align: left; padding: 4px 0; vertical-align: top; font-size: 9pt; }
            .items-table th { border-bottom: 1px solid #000; font-weight: bold; }
            .items-table .item-name { line-height: 1.2; word-break: break-word; }
            .items-table .item-details { font-size: 8pt; color: #555; }
            .items-table th:last-child, .items-table td:last-child { text-align: right; white-space: nowrap; }
            .totals { width: 100%; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #000; }
            .totals .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 9pt; }
            .totals .row.total { font-weight: bold; font-size: 11pt; padding-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 9pt; }
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
              <p><strong>Khách hàng:</strong> ${selectedCustomer?.name || t('pos.guest')}</p>
              ${selectedCustomer ? `<p><strong>SĐT:</strong> ${selectedCustomer.phone}</p>` : ''}
              <p><strong>Nhân viên:</strong> ${currentUser?.fullName || 'N/A'}</p>
              <p><strong>Thanh toán:</strong> ${t(`pos.${paymentMethod.toLowerCase()}`)}</p>
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
                <span>${t('pos.subtotal')}:</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div class="row">
                <span>${t('pos.discount')}:</span>
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
  }, [cart, t, toast, store, selectedCustomer, currentUser, paymentMethod, subtotal, vatAmount, totalWithVat, discount]);

  const remainingAmountInDialog = useMemo(() => {
    if (!isPaymentDialogOpen) return 0;
    const remaining = paymentMethod === 'Cash' 
        ? totalWithVat - customerTender
        : totalWithVat - amountPaid;
    return remaining > 0 ? remaining : 0;
  }, [isPaymentDialogOpen, paymentMethod, totalWithVat, customerTender, amountPaid]);

  useEffect(() => {
    if (isPaymentDialogOpen) {
      setAmountPaid(totalWithVat);
      setPaymentMethod('Cash');
      setShowQrCode(false);
      setCustomerTender(totalWithVat);
    }
  }, [isPaymentDialogOpen, totalWithVat]);

  useEffect(() => {
    if (paymentMethod === 'Debt' || paymentMethod === 'Installment') {
      setAmountPaid(0);
    } else {
      setAmountPaid(totalWithVat);
      setCustomerTender(totalWithVat);
    }
  }, [paymentMethod, totalWithVat]);

  useEffect(() => {
    if (isPaymentDialogOpen) {
      const storeInfo = mockStores[0];
      if (paymentMethod === 'Transfer' && storeInfo?.bankInfo && totalWithVat > 0) {
        const orderCode = `DH${Date.now().toString().slice(-6)}`;
        const params = new URLSearchParams({
          amount: totalWithVat.toString(),
          addInfo: `Thanh toan don hang ${orderCode}`,
          accountName: storeInfo.bankInfo.accountName,
        });
        const url = `https://img.vietqr.io/image/${storeInfo.bankInfo.bankId}-${storeInfo.bankInfo.accountNo}-print.png?${params.toString()}`;
        setQrCodeUrl(url);
      } else {
        setQrCodeUrl('');
      }
    }
  }, [isPaymentDialogOpen, totalWithVat, paymentMethod]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPaymentDialogOpen && event.key === 'F9') {
        event.preventDefault();
        handleQuickPrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaymentDialogOpen, handleQuickPrint]);

  const categories = mockCategories.filter(c => !c.isDeleted && c.isActive);
  const products = mockProducts.filter(p => !p.isDeleted && p.isActive);
  
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter(p => p.categoryId === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [products, activeCategory, searchTerm]);
  
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://picsum.photos/300/300';
    } catch (e) {
      return 'https://picsum.photos/300/300';
    }
  }

  return (
    <>
      <div className="grid h-screen w-full grid-cols-10 gap-4 bg-muted/40 p-4">
        <div className="col-span-6 flex flex-col gap-4">
          <header className="flex h-16 items-center justify-between gap-4 rounded-lg bg-background p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="icon" className="h-10 w-10">
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">{t('pos.back_to_dashboard')}</span>
                </Link>
              </Button>
              <div className="hidden items-center gap-2 md:flex">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-semibold">{store.name}</span>
              </div>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('pos.search_placeholder')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden items-center gap-2 text-sm font-medium md:flex">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{currentUser?.fullName || 'Nhân viên'}</span>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 rounded-lg bg-background p-4 shadow-sm">
            <Tabs defaultValue="all" onValueChange={(val) => setActiveCategory(val === 'all' ? null : val)}>
                  <TabsList>
                      <TabsTrigger value="all">{t('pos.all_categories')}</TabsTrigger>
                      {categories.map(cat => (
                      <TabsTrigger key={cat.categoryId} value={cat.categoryId}>{cat.name}</TabsTrigger>
                      ))}
                  </TabsList>
                  <ScrollArea className="mt-4 h-[calc(100vh-200px)]">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pr-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.productId}
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
                                  {t('pos.stock', { stock: product.stock })}
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

        <div className="col-span-4">
          <Card className="flex h-full flex-col shadow-sm">
            <CardHeader className="p-4 border-b">
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-3 flex items-center gap-2">
                    <Popover open={isCustomerPopoverOpen} onOpenChange={setCustomerPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                {selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.phone}` : t('pos.select_customer_placeholder')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                             <Input placeholder={t('pos.search_customer_placeholder')} value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="m-2 w-[calc(100%-1rem)]" />
                             <Separator/>
                             <ScrollArea className="h-60">
                                <div className="p-2 space-y-1">
                                <Button variant="ghost" className="w-full justify-start font-normal" onClick={() => { setSelectedCustomerId('guest'); setCustomerPopoverOpen(false); }}>
                                    {t('pos.guest')}
                                </Button>
                                {filteredCustomersForSearch.map(customer => (
                                    <Button key={customer.customerId} variant="ghost" className="w-full justify-start font-normal h-auto py-2 text-left" onClick={() => { setSelectedCustomerId(customer.customerId); setCustomerPopoverOpen(false); setCustomerSearch(''); }}>
                                        <div>
                                            <p>{customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                        </div>
                                    </Button>
                                ))}
                                </div>
                             </ScrollArea>
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleAddNewCustomer} aria-label={t('pos.add_customer')}>
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="col-span-2">
                  <Select value={globalPriceTier} onValueChange={(value) => setGlobalPriceTier(value as PriceTier)}>
                      <SelectTrigger>
                          <SelectValue placeholder={t('pos.select_price_tier')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="retail">{t('pos.price_tier_retail')}</SelectItem>
                          <SelectItem value="wholesale">{t('pos.price_tier_wholesale')}</SelectItem>
                          <SelectItem value="credit">{t('pos.price_tier_credit')}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2">
                <Button variant="outline" className="w-full" onClick={() => setVoucherDialogOpen(true)} disabled={!selectedCustomer}>
                    <Gift className="mr-2 h-4 w-4" />
                    {selectedCustomer ? `Dùng điểm (${selectedCustomer.loyaltyPoints.toLocaleString()})` : 'Chọn khách hàng để dùng điểm'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-360px)]">
                  {cart.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                          <p className="text-center text-muted-foreground">{t('pos.empty_cart')}</p>
                      </div>
                  ) : (
                  <div className="grid gap-y-2 p-4">
                      {cart.map((item) => (
                        <div key={item.productId} className="grid grid-cols-12 items-center gap-2 border-b pb-2 last:border-b-0 last:pb-0">
                          <div className="col-span-6">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(item.appliedPrice)}</p>
                          </div>
                          <div className="col-span-3 flex items-center justify-center gap-1">
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                                  <Minus className="h-3 w-3" />
                              </Button>
                              <Input 
                                  type="number" 
                                  value={item.quantity} 
                                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                  className="h-6 w-10 text-center p-0 border-0 shadow-none focus-visible:ring-0"
                              />
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                          <p className="col-span-2 text-right font-medium text-sm">{formatCurrency(item.appliedPrice * item.quantity)}</p>
                          <div className="col-span-1 flex justify-end">
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => updateQuantity(item.productId, 0)}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                  )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-4 border-t bg-muted/40">
              <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span>{t('pos.subtotal')}</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <Label htmlFor="discount">{t('pos.discount')}</Label>
                      <Input 
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="h-8 w-32 text-right"
                          placeholder="0"
                      />
                  </div>
                  {selectedVoucher && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                        <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => setSelectedVoucher(null)}>
                            <X className="h-3 w-3" />
                        </Button>
                        <span>Voucher: {selectedVoucher.name}</span>
                        </div>
                        <span className="font-medium">-{formatCurrency(voucherDiscount)}</span>
                    </div>
                  )}
                  {store.isVatEnabled && store.vatRate > 0 && (
                    <div className="flex justify-between">
                        <span>{t('pos.vat_rate', { rate: store.vatRate })}</span>
                        <span className="font-medium">{formatCurrency(vatAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                      <span>{t('pos.total_due')}</span>
                      <span>{formatCurrency(totalWithVat)}</span>
                  </div>
              </div>
              <Button size="lg" disabled={cart.length === 0} onClick={() => setPaymentDialogOpen(true)} className="w-full">
                {editingOrderId ? 'Cập nhật đơn hàng' : t('pos.create_order')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isAddCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{t('pos.add_customer_title')}</DialogTitle>
            <DialogDescription>
              {t('pos.add_customer_description')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCustomerSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_name')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_name_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_phone')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_phone_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('pages.customers.form_email')}</FormLabel>
                    <FormControl><Input type="email" placeholder={t('pages.customers.form_email_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('pages.customers.form_address')}</FormLabel>
                    <FormControl><Textarea placeholder={t('pages.customers.form_address_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_tax_code')}</FormLabel>
                    <FormControl><Input placeholder={t('pages.customers.form_tax_code_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_credit_limit')}</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.customers.form_type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('pages.customers.form_type_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Retail">{t('pages.customers.form_type_retail')}</SelectItem>
                          <SelectItem value="Wholesale">{t('pages.customers.form_type_wholesale')}</SelectItem>
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
                    <FormLabel>{t('pages.customers.form_status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('pages.customers.form_status_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">{t('pages.customers.form_status_active')}</SelectItem>
                          <SelectItem value="Inactive">{t('pages.customers.form_status_inactive')}</SelectItem>
                          <SelectItem value="Blocked">{t('pages.customers.form_status_blocked')}</SelectItem>
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
                    <FormLabel>{t('pages.customers.form_note')}</FormLabel>
                    <FormControl><Textarea placeholder={t('pages.customers.form_note_placeholder')} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="font-headline">{t('pos.payment_dialog_title')}</DialogTitle>
                <DialogDescription>
                    {t('pos.payment_dialog_description')}
                </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-8 py-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('pos.payment_method')}</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                                <RadioGroupItem value="Cash" id="cash" className="peer sr-only" />
                                <Label htmlFor="cash" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    {t('pos.cash')}
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Card" id="card" className="peer sr-only" />
                                <Label htmlFor="card" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    {t('pos.card')}
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="Transfer" id="transfer" className="peer sr-only" />
                                <Label htmlFor="transfer" className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    {t('pos.transfer')}
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
                                    {t('pos.debt')}
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
                                    {t('pos.installment')}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {paymentMethod === 'Transfer' && (
                        <div className="flex flex-col items-center gap-2 pt-4">
                            {!showQrCode && (
                                <Button type="button" variant="outline" onClick={() => setShowQrCode(true)}>
                                    {t('pos.show_qr')}
                                </Button>
                            )}
                            {showQrCode && qrCodeUrl ? (
                                <Image
                                    src={qrCodeUrl}
                                    width={250}
                                    height={250}
                                    alt="QR Code"
                                    data-ai-hint="payment qr code"
                                />
                            ) : showQrCode ? (
                                <div className="flex h-[250px] w-[250px] items-center justify-center rounded-md bg-muted">
                                <p className="text-center text-sm text-muted-foreground">{t('pos.qr_code_error')}</p>
                                </div>
                            ) : null}
                            {showQrCode && <p className="text-sm text-muted-foreground">{t('pos.qr_code_scan')}</p>}
                        </div>
                    )}
                    {paymentMethod === 'Installment' && (
                        <div className="space-y-2">
                           <Label htmlFor="installment-terms">Số kỳ trả góp</Label>
                           <Input 
                                id="installment-terms"
                                type="number" 
                                value={installmentTermCount} 
                                onChange={(e) => setInstallmentTermCount(Math.max(1, Number(e.target.value) || 1))}
                            />
                        </div>
                    )}
                     <div className="space-y-2">
                        <Label htmlFor="delivery-address">{t('pos.shipping_address')}</Label>
                        <Textarea 
                            id="delivery-address" 
                            placeholder={t('pos.shipping_address_placeholder')}
                            defaultValue={selectedCustomer?.address || ''}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="note">Ghi chú đơn hàng</Label>
                        <Textarea id="note" placeholder="Ghi chú thêm..." />
                    </div>
                </div>

                <div className="space-y-4 rounded-lg bg-muted p-4">
                    <h3 className="font-headline text-lg">{t('pos.order_summary')}</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>{t('pos.customer')}</span>
                            <span className="font-medium">{selectedCustomer?.name || t('pos.guest')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>{t('pages.order_details.grand_total')}</span>
                            <span>{formatCurrency(totalWithVat)}</span>
                        </div>
                    </div>
                    <Separator />
                    
                    {paymentMethod === 'Cash' && (
                        <div className="space-y-4">
                             <div className="grid gap-2">
                                <Label htmlFor="customer-tender">{t('pos.customer_tender')}</Label>
                                <Input
                                    id="customer-tender"
                                    type="number"
                                    value={customerTender}
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => setCustomerTender(Number(e.target.value) || 0)}
                                    className="text-right text-2xl font-bold h-12"
                                />
                            </div>
                             <div className="grid grid-cols-3 gap-2">
                                <Button type="button" variant="outline" onClick={() => setCustomerTender(totalWithVat)}>{t('pos.exact_amount')}</Button>
                                <Button type="button" variant="outline" onClick={() => setCustomerTender(500000)}>500.000</Button>
                                <Button type="button" variant="outline" onClick={() => setCustomerTender(1000000)}>1.000.000</Button>
                            </div>
                             <Separator />
                            <div className="flex justify-between font-bold text-xl text-primary p-2 rounded-md bg-background">
                                <span>{t('pos.change_due')}:</span>
                                <span>{formatCurrency(Math.max(0, customerTender - totalWithVat))}</span>
                            </div>
                        </div>
                    )}
                    
                    {paymentMethod !== 'Cash' && (
                        <div className="space-y-2">
                            <div>
                                <Label htmlFor="amount-paid">{t('pos.amount_to_pay')}</Label>
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
                                    <span>{t('pos.remaining_amount')}</span>
                                    <span>{formatCurrency(totalWithVat - amountPaid)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {remainingAmountInDialog > 0 && (
                        <Card className="mt-4 p-3 bg-background border-primary/50">
                            <CardDescription className="text-xs text-center">
                                {selectedCustomer
                                    ? t('pos.debt_notice', { amount: formatCurrency(remainingAmountInDialog), name: selectedCustomer.name })
                                    : t('pos.debt_notice_guest')
                                }
                            </CardDescription>
                        </Card>
                    )}
                </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                <Button type="button" variant="outline" onClick={handleQuickPrint}>
                    <Printer className="mr-2 h-4 w-4"/>
                    {t('pos.quick_print')}
                    <Shortcut>F9</Shortcut>
                </Button>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setPaymentDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button 
                      onClick={handleConfirmPayment} 
                      disabled={remainingAmountInDialog > 0 && !selectedCustomer}
                    >
                      {t('pos.confirm_and_create')}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isVoucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Áp dụng Voucher</DialogTitle>
            <DialogDescription>
                Điểm của bạn: {selectedCustomer?.loyaltyPoints.toLocaleString() || 0}. Chọn voucher để áp dụng vào đơn hàng.
            </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
                {mockVouchers.map((voucher) => {
                    const canAfford = selectedCustomer && selectedCustomer.loyaltyPoints >= voucher.pointsCost;
                    const isApplicable = voucher.type !== 'shipping';
                    return (
                    <Card key={voucher.voucherId} className={cn((!canAfford || !isApplicable) && "bg-muted/50 opacity-60")}>
                        <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">{voucher.name}</h4>
                            <p className="text-sm text-muted-foreground">{voucher.description}</p>

                            <p className="text-sm font-bold text-primary mt-1">{voucher.pointsCost.toLocaleString()} điểm</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleApplyVoucher(voucher)}
                            disabled={!canAfford || !isApplicable}
                        >
                            Áp dụng
                        </Button>
                        </CardContent>
                    </Card>
                    )
                })}
            </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

    
