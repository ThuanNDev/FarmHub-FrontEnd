
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, MapPin, Truck, Calendar, Hash, CreditCard, StickyNote, Package, Printer, Edit, XCircle } from 'lucide-react';
import { mockOrders, mockCustomers, mockUsers, mockOrderItems, mockProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/StoreContext';
import { useLanguage } from '@/store/LanguageContext';
import { format } from 'date-fns';

type Order = typeof mockOrders[0];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { store } = useStore();
  const { t } = useLanguage();
  
  const initialOrder = React.useMemo(() => mockOrders.find((o) => o.orderId === params.id), [params.id]);
  
  const [order, setOrder] = React.useState<Order | undefined>(initialOrder);
  const { toast } = useToast();

  React.useEffect(() => {
    setOrder(mockOrders.find((o) => o.orderId === params.id));
  }, [params.id]);

  if (!order) {
    notFound();
  }
  
  const customer = mockCustomers.find(c => c.customerId === order.customerId);
  const processor = mockUsers.find(u => u.userId === order.processedByUserId);
  const items = mockOrderItems.filter(item => item.orderId === order.orderId);

  const handleCancelOrder = () => {
    const orderInMock = mockOrders.find(o => o.orderId === order.orderId);
    if (orderInMock) {
      orderInMock.status = 'Cancelled';
      orderInMock.deliveryStatus = 'Cancelled';
      orderInMock.updatedAt = new Date().toISOString();
    }
    setOrder({ ...order, status: 'Cancelled' });
    toast({
      title: t('common.success'),
      description: `Đơn hàng ${order.orderCode} đã được hủy.`,
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  const handlePrintOrder = () => {
     if (!order || !processor) {
        toast({
            variant: "destructive",
            title: t('common.error'),
            description: "Không thể tải dữ liệu để in."
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
    
    const storeInfo = store;
    const paperSize = store.printingPreferences?.defaultPaperSize || 'k80';
    
    const itemsHtmlA5 = items.map(item => `
        <tr key=${item.orderItemId} class="border-b">
            <td class="p-2">${item.productName}</td>
            <td class="p-2 text-center">${item.quantity}</td>
            <td class="p-2 text-right">${formatCurrency(item.unitPrice)}</td>
            <td class="p-2 text-right">${formatCurrency(item.totalPrice)}</td>
        </tr>
    `).join('');

    const itemsHtmlThermal = items.map(item => `
      <tr class="item">
        <td>
          <div class="item-name">${item.productName}</div>
          <div class="item-details">SL: ${item.quantity} x ${formatCurrency(item.unitPrice)}</div>
        </td>
        <td class="text-right">${formatCurrency(item.totalPrice)}</td>
      </tr>
    `).join('');
    
    let invoiceHtml = '';
    
    if (paperSize === 'a5') {
       invoiceHtml = `
        <html>
        <head>
          <title>Hóa đơn ${order.orderCode}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000; background: #fff;}
            .a5-preview { background-color: white; color: black; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); margin: 0 auto; padding: 2rem; width: 148mm; min-height: 210mm; }
            header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1rem; border-bottom: 1px solid #000; }
            header .text-left { text-align: left; }
            header .text-right { text-align: right; }
            h1 { font-weight: bold; font-size: 1.5rem; line-height: 2rem; }
            h2 { font-weight: bold; font-size: 1.25rem; line-height: 1.75rem; text-transform: uppercase; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            section { margin-top: 1.5rem; margin-bottom: 1.5rem; }
            section h3 { font-weight: 600; margin-bottom: 0.5rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            table { width: 100%; text-align: left; font-size: 0.875rem; line-height: 1.25rem; border-collapse: collapse;}
            thead { background-color: #f3f4f6 !important; }
            th { padding: 0.5rem; font-weight: 600; }
            td { padding: 0.5rem; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .border-b { border-bottom: 1px solid #ddd; }
            .total-container { width: 40%; margin-left: auto; margin-top: 1.5rem; font-size: 0.875rem; line-height: 1.25rem; }
            .total-row { display: flex; justify-content: space-between; }
            .total-main { border-top: 1px solid #000; padding-top: 0.5rem; margin-top: 0.5rem; font-size: 1rem; line-height: 1.5rem; }
            .text-red-600 { color: #dc2626; }
            footer { margin-top: 3rem; text-align: center; font-size: 0.75rem; line-height: 1rem; color: #6b7281; border-top: 1px solid #000; padding-top: 1rem; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="a5-preview">
            <header>
                <div class="text-left">
                    <h1 class="font-bold text-2xl">${storeInfo.name}</h1>
                    <p class="text-xs">${storeInfo.address}</p>
                    <p class="text-xs">SĐT: ${storeInfo.phone}</p>
                </div>
                <div class="text-right">
                    <h2 class="font-bold text-xl uppercase">Hóa Đơn Bán Hàng</h2>
                    <p class="text-xs">Mã ĐH: ${order.orderCode}</p>
                    <p class="text-xs">Ngày: ${formatDate(order.createdAt)}</p>
                </div>
            </header>
            <section class="my-6">
                <h3 class="font-semibold mb-2">Thông tin khách hàng:</h3>
                <p class="text-sm"><strong>Tên:</strong> ${customer?.name || 'Khách lẻ'}</p>
                <p class="text-sm"><strong>SĐT:</strong> ${customer?.phone || 'N/A'}</p>
                <p class="text-sm"><strong>Địa chỉ:</strong> ${order.deliveryAddress || customer?.address || 'N/A'}</p>
            </section>
            <table class="w-full text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left font-semibold">Sản phẩm</th>
                        <th class="p-2 text-center font-semibold">SL</th>
                        <th class="p-2 text-right font-semibold">Đơn giá</th>
                        <th class="p-2 text-right font-semibold">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>${itemsHtmlA5}</tbody>
            </table>
             <div class="total-container">
                <div class="total-row"><span style="color: #6b7281;">Tạm tính:</span> <strong>${formatCurrency(items.reduce((s, i) => s + i.totalPrice, 0))}</strong></div>
                <div class="total-row"><span style="color: #6b7281;">Giảm giá:</span> <strong>-${formatCurrency(order.discountAmount)}</strong></div>
                <div class="total-row"><span style="color: #6b7281;">Phí VC:</span> <strong>${formatCurrency(order.shippingFee)}</strong></div>
                <div class="total-row total-main"><span style="font-weight: bold;">Tổng cộng:</span> <strong style="font-size: 1.125rem; line-height: 1.75rem;">${formatCurrency(order.totalAmount)}</strong></div>
                <div class="total-row"><span style="color: #6b7281;">Đã trả:</span> <strong>${formatCurrency(order.totalPaid)}</strong></div>
                <div class="total-row" style="color: #dc2626; font-weight: 600;"><span class="">Còn lại:</span> <strong>${formatCurrency(order.totalAmount - order.totalPaid)}</strong></div>
            </div>
            <footer class="mt-12 text-center text-xs text-gray-500 border-t pt-4">
                <p>${storeInfo.invoiceFooter || 'Cảm ơn quý khách!'}</p>
                <p>Nhân viên: ${processor?.fullName || 'N/A'}</p>
            </footer>
          </div>
        </body>
        </html>
       `;
   } else {
       const thermalClass = paperSize === 'k58' ? 'invoice-wrapper-k58' : 'invoice-wrapper-k80';
       invoiceHtml = `
        <html>
        <head>
          <title>Hóa đơn ${order.orderCode}</title>
          <style>
            @page { margin: 0mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 10pt; color: #000; background: #fff; line-height: 1.4; margin: 0; padding: 0; }
            .invoice-wrapper-k80 { width: 280px; margin: 0 auto; padding: 10px 5px; }
            .invoice-wrapper-k58 { width: 200px; margin: 0 auto; padding: 8px 3px; font-size: 9pt; }
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
          <div class="${thermalClass}">
            <div class="header">
              <h1>${storeInfo.name}</h1>
              <p>${storeInfo.address}</p>
              <p>${storeInfo.phone}</p>
            </div>

            <div class="info">
              <p><strong>Hóa đơn:</strong> ${order.orderCode}</p>
              <p><strong>Ngày:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>KH:</strong> ${customer?.name || 'Khách lẻ'}</p>
              ${customer ? `<p><strong>SĐT:</strong> ${customer.phone}</p>` : ''}
              <p><strong>NV:</strong> ${processor?.fullName || 'N/A'}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtmlThermal}
              </tbody>
            </table>

            <div class="totals">
              <div class="row">
                <span>Tạm tính:</span>
                <span>${formatCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
              </div>
              <div class="row">
                <span>Giảm giá:</span>
                <span>-${formatCurrency(order.discountAmount)}</span>
              </div>
               <div class="row">
                <span>Phí VC:</span>
                <span>${formatCurrency(order.shippingFee)}</span>
              </div>
              <div class="row total">
                <span>TỔNG CỘNG:</span>
                <span>${formatCurrency(order.totalAmount)}</span>
              </div>
              <div class="row">
                <span>Đã trả:</span>
                <span>${formatCurrency(order.totalPaid)}</span>
              </div>
              <div class="row">
                <span style="font-weight: bold;">Còn lại:</span>
                <span style="font-weight: bold;">${formatCurrency(order.totalAmount - order.totalPaid)}</span>
              </div>
            </div>

            <div class="footer">
              <p>${storeInfo.invoiceFooter || 'Cảm ơn quý khách và hẹn gặp lại!'}</p>
              <p>${storeInfo.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;
   }

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleEditOrder = () => {
     if (order.status !== 'Pending') {
        toast({ variant: 'destructive', title: t('pages.order_details.cannot_edit_title'), description: t('pages.order_details.cannot_edit_description')});
        return;
    }
    router.push(`/pos?orderId=${order.orderId}`);
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('pages.order_details.back_to_list')}
          </Link>
        </Button>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handlePrintOrder}>
             <Printer className="mr-2 h-4 w-4"/> {t('pages.order_details.print_order')}
           </Button>
           <Button variant="outline" size="sm" onClick={handleEditOrder} disabled={order.status !== 'Pending'}>
             <Edit className="mr-2 h-4 w-4"/> {t('common.edit')}
           </Button>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={order.status === 'Cancelled' || order.status === 'Delivered'}>
                  <XCircle className="mr-2 h-4 w-4"/> {t('pages.order_details.cancel_order')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                  <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t('pages.order_details.cancel_dialog_description', { code: order.orderCode }) }} />
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">
                    {t('pages.order_details.confirm_cancel')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">{t('pages.order_details.title', { code: order.orderCode })}</CardTitle>
              <CardDescription>
                {t('pages.order_details.created_date', { date: formatDate(order.createdAt) })}
              </CardDescription>
            </div>
            <Badge className="text-base" variant={getStatusVariant(order.status) as any}>{t(`status.${order.status.toLowerCase()}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <User className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">{t('pages.order_details.customer_info')}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{customer?.name || 'Khách lẻ'}</p>
                            <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                            <p className="text-sm text-muted-foreground">{customer?.email}</p>
                            {customer && <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push(`/customers/${customer.customerId}`)}>{t('pages.order_details.view_customer_details')}</Button>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Truck className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">{t('pages.order_details.shipping_info')}</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">{t('pages.order_details.shipping_address')}</span> {order.deliveryAddress || t('pages.order_details.shipping_address_pickup')}</p>
                             <p><span className="font-semibold">{t('pages.order_details.shipping_status')}</span> {order.deliveryStatus}</p>
                            <p><span className="font-semibold">{t('pages.order_details.shipping_expected_date')}</span> {formatDate(order.expectedDeliveryDate)}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <CreditCard className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">{t('pages.order_details.payment_info')}</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">{t('pages.order_details.payment_method')}</span> {order.paymentType}</p>
                            <p><span className="font-semibold">{t('pages.order_details.payment_details')}</span> {order.paymentDetails}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <StickyNote className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">{t('pages.order_details.note')}</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{order.note || t('pages.order_details.no_note')}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                            <Package className="h-5 w-5 text-primary"/>
                            <h3 className="font-headline text-lg">{t('pages.order_details.products_in_order')}</h3>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>{t('pages.order_details.product_name')}</TableHead>
                                    <TableHead className="text-center">{t('pages.order_details.quantity')}</TableHead>
                                    <TableHead className="text-right">{t('pages.order_details.unit_price')}</TableHead>
                                    <TableHead className="text-right">{t('pages.order_details.subtotal')}</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.orderItemId}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-center">{item.quantity} {item.productUnit}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            <Separator className="my-4"/>
                            <div className="space-y-2 text-right">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('pages.order_details.subtotal')}</span>
                                    <span>{formatCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('pages.order_details.discount')}</span>
                                    <span>- {formatCurrency(order.discountAmount)}</span>
                                 </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('pages.order_details.shipping_fee')}</span>
                                    <span>{formatCurrency(order.shippingFee)}</span>
                                 </div>
                                 <Separator className="my-2"/>
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>{t('pages.order_details.grand_total')}</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                 </div>
                                 <div className="flex justify-between text-primary">
                                    <span>{t('pages.order_details.paid')}</span>
                                    <span>{formatCurrency(order.totalPaid)}</span>
                                 </div>
                                 <div className="flex justify-between text-destructive font-semibold">
                                    <span>{t('pages.order_details.remaining')}</span>
                                    <span>{formatCurrency(order.totalAmount - order.totalPaid)}</span>
                                 </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
