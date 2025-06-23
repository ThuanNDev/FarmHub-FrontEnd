

'use client';

import { useState, useMemo } from 'react';
import { File, MoreHorizontal, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { mockOrders, mockCustomers, mockOrderItems, mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStore } from '@/contexts/StoreContext';
import { format } from 'date-fns';

type Order = typeof mockOrders[0];

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { store } = useStore();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.customerId === customerId)?.name || t('pos.guest');
  };

  const filteredOrders = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let ordersToFilter = sortedOrders;
    if (activeTab !== 'all') {
        ordersToFilter = sortedOrders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
    }
    
    if (searchTerm) {
        ordersToFilter = ordersToFilter.filter(order => 
            order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCustomerName(order.customerId).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return ordersToFilter;
  }, [orders, activeTab, searchTerm, t]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  }
  
  const formatDateForPrint = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  const handlePrint = (order: Order) => {
    const customer = mockCustomers.find(c => c.customerId === order.customerId);
    const processor = mockUsers.find(u => u.userId === order.processedByUserId);
    const items = mockOrderItems.filter(item => item.orderId === order.orderId);

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
   
   const itemsHtmlThermal = items.map(item => `
     <tr class="item">
       <td>
         <div class="item-name">${item.productName}</div>
         <div class="item-details">SL: ${item.quantity} x ${formatCurrency(item.unitPrice)}</div>
       </td>
       <td class="text-right">${formatCurrency(item.totalPrice)}</td>
     </tr>
   `).join('');
   
   const thermalClass = paperSize === 'k58' ? 'invoice-wrapper-k58' : 'invoice-wrapper-k80';
   const invoiceHtml = `
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
          <p><strong>Ngày:</strong> ${formatDateForPrint(order.createdAt)}</p>
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

   printWindow.document.write(invoiceHtml);
   printWindow.document.close();
   printWindow.focus();
   setTimeout(() => {
     printWindow.print();
     printWindow.close();
   }, 250);
  };

  const handleEdit = (order: Order) => {
    if (order.status !== 'Pending') {
        toast({ variant: 'destructive', title: t('pages.order_details.cannot_edit_title'), description: t('pages.orders.action_cannot_edit')});
        return;
    }
    router.push(`/pos?orderId=${order.orderId}`);
  };

  const handleOpenCancelDialog = (order: Order) => {
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      toast({ variant: 'destructive', title: 'Không thể hủy', description: t('pages.orders.action_cannot_cancel') });
      return;
    }
    setOrderToCancel(order);
  };
  
  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.orderId === orderToCancel.orderId ? { ...o, status: 'Cancelled', deliveryStatus: 'Cancelled', updatedAt: new Date().toISOString() } : o
      )
    );
    toast({ title: t('common.success'), description: t('pages.orders.success_cancel', { code: orderToCancel.orderCode }) });
    setOrderToCancel(null);
  };

  const handleRecreateOrder = (cancelledOrder: Order) => {
    const now = new Date();
    const newOrderCode = `DH${now.toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      ...cancelledOrder,
      orderId: `ord-${now.getTime()}`,
      orderCode: newOrderCode,
      status: 'Pending',
      deliveryStatus: 'Processing',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const originalItems = mockOrderItems.filter(item => item.orderId === cancelledOrder.orderId);
    const newItems = originalItems.map(item => ({
      ...item,
      orderItemId: `item-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      orderId: newOrder.orderId,
    }));
    
    mockOrderItems.push(...newItems);
    mockOrders.unshift(newOrder);

    setOrders(prevOrders => [newOrder, ...prevOrders]);

    toast({
      title: t('common.success'),
      description: t('pages.orders.success_recreate', { code: newOrder.orderCode }),
    });
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('pages.orders.error_no_export_data'),
      });
      return;
    }

    const headers = [
      t('pages.orders.table_code'),
      t('pages.orders.table_customer'),
      t('pages.orders.table_date'),
      t('pages.orders.table_status'),
      t('pages.orders.table_total'),
      t('pages.order_details.paid'),
      t('pages.order_details.remaining'),
      t('pages.order_details.payment_method')
    ];
    
    const rows = filteredOrders.map(order => [
      `"${order.orderCode}"`,
      `"${getCustomerName(order.customerId)}"`,
      `"${formatDate(order.createdAt)}"`,
      `"${t(`status.${order.status.toLowerCase()}`)}"`,
      order.totalAmount,
      order.totalPaid,
      order.totalAmount - order.totalPaid,
      `"${order.paymentType}"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `don_hang_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    
    toast({
        title: t('common.success'),
        description: t('pages.orders.success_export', { count: filteredOrders.length, fileName }),
    });
  };


  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">{t('pages.orders.tab_all')}</TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              {t('pages.orders.tab_pending')}
            </TabsTrigger>
            <TabsTrigger 
              value="delivered"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t('pages.orders.tab_delivered')}
            </TabsTrigger>
            <TabsTrigger 
              value="cancelled"
              className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
            >
              {t('pages.orders.tab_cancelled')}
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t('pages.orders.search_placeholder')}
                    className="pl-8 sm:w-[200px] md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button size="sm" variant="outline" className="h-10 gap-1" onClick={handleExport}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {t('common.export_file')}
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('pages.orders.title')}</CardTitle>
              <CardDescription>
                {t('pages.orders.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.orders.table_code')}</TableHead>
                    <TableHead>{t('pages.orders.table_customer')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('pages.orders.table_date')}</TableHead>
                    <TableHead>{t('pages.orders.table_status')}</TableHead>
                    <TableHead className="text-right">{t('pages.orders.table_total')}</TableHead>
                    <TableHead>
                      <span className="sr-only">{t('common.actions')}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.orderId} onClick={() => router.push(`/orders/${order.orderId}`)} className="cursor-pointer">
                      <TableCell className="font-medium">{order.orderCode}</TableCell>
                      <TableCell>{getCustomerName(order.customerId)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status) as any}>
                          {t(`status.${order.status.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'Cancelled' ? (
                                <DropdownMenuItem onSelect={() => handleRecreateOrder(order)}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    <span>{t('pages.orders.action_recreate')}</span>
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem onSelect={() => handlePrint(order)}>{t('pages.orders.action_print')}</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleEdit(order)} disabled={order.status !== 'Pending'}>{t('common.edit')}</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onSelect={() => handleOpenCancelDialog(order)} 
                                        className="text-destructive" 
                                        disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                                    >
                                        {t('pages.orders.action_cancel')}
                                    </DropdownMenuItem>
                                </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

       <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.orders.cancel_dialog_description', { code: orderToCancel?.orderCode })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
