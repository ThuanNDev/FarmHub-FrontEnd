
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2, Award, Gift } from 'lucide-react';
import { mockCustomers, mockOrders, mockVouchers } from '@/lib/data';
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
import { useLanguage } from '@/store/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [customer, setCustomer] = React.useState(mockCustomers.find((c) => c.customerId === params.id && !c.isDeleted));
  const [isRedeemDialogOpen, setRedeemDialogOpen] = React.useState(false);


  if (!customer) {
    notFound();
  }
  
  const customerOrders = mockOrders.filter(o => o.customerId === customer.customerId);
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy');
  }

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

  const handleRedeemVoucher = (voucher: typeof mockVouchers[0]) => {
    if (!customer) return;

    const newPoints = customer.loyaltyPoints - voucher.pointsCost;

    const customerInDb = mockCustomers.find(c => c.customerId === customer.customerId);
    if (customerInDb) {
      customerInDb.loyaltyPoints = newPoints;
    }
    
    setCustomer(prev => prev ? { ...prev, loyaltyPoints: newPoints } : undefined);

    toast({
      title: "Đổi voucher thành công!",
      description: `Bạn đã đổi voucher "${voucher.name}".`,
    });

    setRedeemDialogOpen(false);
  };

  return (
    <>
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <Button asChild variant="outline" size="sm">
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách khách hàng
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{customer.name}</CardTitle>
                    <CardDescription>{customer.customerType === 'Wholesale' ? 'Khách sỉ' : 'Khách lẻ'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.email || 'Chưa có'}</span>
                    </div>
                     <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>{customer.address || 'Chưa có'}</span>
                    </div>
                    <Separator />
                     <div className="space-y-2">
                        <h4 className="font-semibold">Thông tin thêm</h4>
                        <p className="text-sm"><span className="text-muted-foreground">Mã số thuế:</span> {customer.taxCode || 'N/A'}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Ghi chú:</span> {customer.note || 'Không có'}</p>
                     </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Tình trạng công nợ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Hạn mức</span>
                            <span className="font-medium">{formatCurrency(customer.creditLimit)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tổng nợ</span>
                            <span className="font-medium text-destructive">{formatCurrency(customer.totalDebt)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày đến hạn</span>
                            <span className="font-medium">{formatDate(customer.debtDueDate)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary"/>
                      Khách hàng thân thiết
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Điểm tích lũy</p>
                          <p className="text-2xl font-bold text-primary">{customer.loyaltyPoints.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm text-muted-foreground">Hạng</p>
                          <Badge variant="default" className="text-base">{customer.loyaltyTier}</Badge>
                      </div>
                  </div>
                  <Button className="w-full" onClick={() => setRedeemDialogOpen(true)}>
                      <Gift className="mr-2 h-4 w-4" /> Đổi điểm lấy voucher
                  </Button>
              </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Lịch sử đơn hàng</CardTitle>
                    <CardDescription>Tổng cộng {customerOrders.length} đơn hàng.</CardDescription>
                </CardHeader>
                <CardContent>
                {customerOrders.length > 0 ? (
                 <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Mã ĐH</TableHead>
                     <TableHead>Ngày</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className="text-right">Tổng tiền</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {customerOrders.map((order) => (
                     <TableRow key={order.orderId} onClick={() => router.push(`/orders/${order.orderId}`)} className="cursor-pointer">
                       <TableCell className="font-medium">{order.orderCode}</TableCell>
                       <TableCell>{formatDate(order.createdAt)}</TableCell>
                       <TableCell>
                         <Badge variant={getStatusVariant(order.status) as any}>{t(`status.${order.status.toLowerCase()}`)}</Badge>
                       </TableCell>
                       <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Khách hàng này chưa có đơn hàng nào.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>

    <Dialog open={isRedeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Đổi điểm thưởng</DialogTitle>
          <DialogDescription>
            Chọn voucher bạn muốn đổi. Điểm của bạn: {customer.loyaltyPoints.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {mockVouchers.map((voucher) => (
              <Card key={voucher.voucherId} className={cn(customer.loyaltyPoints < voucher.pointsCost && "bg-muted/50 opacity-60")}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{voucher.name}</h4>
                    <p className="text-sm text-muted-foreground">{voucher.description}</p>
                    <p className="text-sm font-bold text-primary mt-1">{voucher.pointsCost.toLocaleString()} điểm</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRedeemVoucher(voucher)}
                    disabled={customer.loyaltyPoints < voucher.pointsCost}
                  >
                    Đổi
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
