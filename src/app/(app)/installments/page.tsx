
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Landmark, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from '@/components/ui/input';
import { mockOrders, mockCustomers, mockInstallmentTerms } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { RecordPaymentDialog, type PaymentFormValues } from '@/components/RecordPaymentDialog';
import { useStore } from '@/contexts/StoreContext';
import { useLanguage } from '@/contexts/LanguageContext';

type InstallmentOrder = (typeof mockOrders)[0];

export default function InstallmentsPage() {
  const [installmentOrders, setInstallmentOrders] = useState<InstallmentOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { store } = useStore();
  const { t } = useLanguage();

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InstallmentOrder | null>(null);

  useEffect(() => {
    const orders = mockOrders.filter(
      (order) => order.payment_type === 'Installment' && order.status !== 'Cancelled'
    );
    setInstallmentOrders(orders);
  }, []);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.CustomerId === customerId)?.name || 'Khách lẻ';
  };

  const filteredInstallmentOrders = useMemo(() => {
    if (!searchTerm) return installmentOrders;
    return installmentOrders.filter(order =>
      order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(order.CustomerId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, installmentOrders]);
  
  const handleOpenPaymentDialog = (order: InstallmentOrder) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handlePrintInstallmentReceipt = (order: InstallmentOrder, paymentValues: PaymentFormValues) => {
    const customer = mockCustomers.find(c => c.CustomerId === order.CustomerId);
    const updatedOrderInDb = mockOrders.find(o => o.OrderId === order.OrderId);

    if (!customer || !updatedOrderInDb) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không tìm thấy thông tin để in.' });
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

    const terms = mockInstallmentTerms.filter(t => t.OrderId === order.OrderId);
    const paidTerms = terms.filter(t => t.paid_at !== null).length;
    const totalTerms = terms.length;
    const remainingAmount = updatedOrderInDb.total_amount - updatedOrderInDb.total_paid;
    
    let installmentStatus = `Đã trả ${paidTerms}/${totalTerms} kỳ`;
    if (remainingAmount <= 0) {
        installmentStatus = "ĐÃ TẤT TOÁN HỢP ĐỒNG";
    }

    const receiptHtml = `
      <html>
        <head>
          <title>Biên nhận thanh toán ${order.order_code}</title>
          <style>
            @page { margin: 0mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 10pt; color: #000; background: #fff; line-height: 1.4; margin: 0; padding: 0; }
            .receipt-wrapper { width: 280px; margin: 0 auto; padding: 10px 5px; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { font-size: 14pt; margin: 0; font-weight: bold; }
            .header h2 { font-size: 12pt; margin: 5px 0; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 9pt; }
            .info { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
            .info p { margin: 3px 0; font-size: 9pt; }
            .summary { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000; }
            .summary .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 9pt; }
            .summary .row.total { font-weight: bold; font-size: 11pt; padding-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 9pt; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            <div class="header">
              <h1>${store.name}</h1>
              <p>${store.address}</p>
              <p>SĐT: ${store.phone}</p>
              <h2>Biên nhận thanh toán trả góp</h2>
            </div>
            <div class="info">
              <p><strong>Ngày:</strong> ${new Date().toLocaleString('vi-VN')}</p>
              <p><strong>Đơn hàng gốc:</strong> ${order.order_code}</p>
              <p><strong>Khách hàng:</strong> ${customer.name}</p>
              <p><strong>Điện thoại:</strong> ${customer.phone}</p>
            </div>
            <div class="summary">
                <div class="row total">
                    <span>THANH TOÁN KỲ NÀY:</span>
                    <span>${formatCurrency(paymentValues.amount)}</span>
                </div>
                 <div class="row">
                    <span>Hình thức:</span>
                    <span>${paymentValues.paymentMethod}</span>
                </div>
                 <div class="row">
                    <span>Ghi chú:</span>
                    <span>${paymentValues.note || 'Không có'}</span>
                </div>
            </div>
             <div class="summary">
                <div class="row">
                    <span>Tổng HĐ:</span>
                    <span>${formatCurrency(order.total_amount)}</span>
                </div>
                <div class="row">
                    <span>Đã thanh toán:</span>
                    <span>${formatCurrency(updatedOrderInDb.total_paid)}</span>
                </div>
                 <div class="row total">
                    <span>CÒN LẠI:</span>
                    <span>${formatCurrency(remainingAmount)}</span>
                </div>
                 <div class="row" style="font-weight: bold; justify-content: center; margin-top: 5px;">
                    <span colspan="2">${installmentStatus}</span>
                </div>
            </div>
            <div class="footer">
                <p>${store.invoice_footer || 'Cảm ơn quý khách!'}</p>
                <p>---</p>
                <p>Khách hàng ký</p>
                <br/><br/><br/>
                 <p>Người lập phiếu</p>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  const handleConfirmPayment = (values: PaymentFormValues) => {
    if (!selectedOrder) return;
    
    const orderInDb = mockOrders.find(o => o.OrderId === selectedOrder.OrderId);
    if(orderInDb) {
        orderInDb.total_paid += values.amount;
    }
    
    const nextUnpaidTerm = mockInstallmentTerms
        .filter(t => t.OrderId === selectedOrder.OrderId && t.paid_at === null)
        .sort((a,b) => a.installment_number - b.installment_number)[0];

    if (nextUnpaidTerm) {
        const termInDb = mockInstallmentTerms.find(t => t.InstallmentTermId === nextUnpaidTerm.InstallmentTermId);
        if (termInDb) {
            termInDb.paid_at = new Date().toISOString();
            termInDb.payment_method = values.paymentMethod;
            termInDb.note = `${termInDb.note || ''} | TT ${formatCurrency(values.amount)}: ${values.note || ''}`.trim();
        }
    }
    
    setInstallmentOrders([...mockOrders].filter(o => o.payment_type === 'Installment' && o.status !== 'Cancelled'));
    
    toast({
        title: 'Thành công',
        description: `Ghi nhận thanh toán ${formatCurrency(values.amount)} cho đơn hàng ${selectedOrder.order_code}.`,
    });
    
    handlePrintInstallmentReceipt(selectedOrder, values);

    setPaymentDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getInstallmentStatus = (order: InstallmentOrder) => {
    const remaining = order.total_amount - order.total_paid;
    if (remaining <= 0) {
      return { textKey: 'status.completed', variant: 'default' as const };
    }
    return { textKey: 'status.in_progress', variant: 'secondary' as const };
  };

  const getInstallmentDetails = (orderId: string) => {
    const terms = mockInstallmentTerms.filter(t => t.OrderId === orderId);
    if (terms.length === 0) {
      return { paidTerms: 0, totalTerms: 0, amountPerTerm: 0 };
    }
    const paidTerms = terms.filter(t => t.paid_at !== null).length;
    const totalTerms = terms.length;
    const amountPerTerm = terms[0]?.amount || 0;
    return { paidTerms, totalTerms, amountPerTerm };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                  <Landmark className="h-6 w-6"/>
                  Quản lý trả góp
              </CardTitle>
              <CardDescription>
                Theo dõi các đơn hàng mua theo hình thức trả góp.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Tìm theo mã ĐH, tên KH..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-center">Kỳ trả góp</TableHead>
                <TableHead className="text-right">Số tiền/kỳ</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstallmentOrders.length > 0 ? (
                filteredInstallmentOrders.map((order) => {
                  const status = getInstallmentStatus(order);
                  const remaining = order.total_amount - order.total_paid;
                  const { paidTerms, totalTerms, amountPerTerm } = getInstallmentDetails(order.OrderId);
                  return (
                    <TableRow key={order.OrderId}>
                      <TableCell className="font-medium">{order.order_code}</TableCell>
                      <TableCell>{getCustomerName(order.CustomerId)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell className="text-center font-medium">
                        {totalTerms > 0 ? `${paidTerms}/${totalTerms}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(amountPerTerm)}</TableCell>
                      <TableCell className="text-right text-primary">{formatCurrency(order.total_paid)}</TableCell>
                      <TableCell className="text-right text-destructive">{formatCurrency(remaining)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{t(status.textKey)}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/orders/${order.OrderId}`)}>Xem chi tiết đơn hàng</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenPaymentDialog(order)}>Ghi nhận thanh toán</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Không có đơn hàng trả góp nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Hiển thị <strong>{filteredInstallmentOrders.length}</strong> trên <strong>{installmentOrders.length}</strong> đơn hàng trả góp.
          </div>
        </CardFooter>
      </Card>

      {selectedOrder && (
        <RecordPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          title={`Thanh toán cho ĐH ${selectedOrder.order_code}`}
          description={`Tổng tiền còn lại: ${formatCurrency(selectedOrder.total_amount - selectedOrder.total_paid)}. Vui lòng xác nhận số tiền thanh toán.`}
          dueAmount={
            mockInstallmentTerms
                .filter(t => t.OrderId === selectedOrder.OrderId && t.paid_at === null)
                .sort((a,b) => a.installment_number - b.installment_number)[0]?.amount 
            || (selectedOrder.total_amount - selectedOrder.total_paid)
          }
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
