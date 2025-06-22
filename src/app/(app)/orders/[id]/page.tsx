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

type Order = typeof mockOrders[0];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  
  const initialOrder = React.useMemo(() => mockOrders.find((o) => o.id === params.id), [params.id]);
  
  const [order, setOrder] = React.useState<Order | undefined>(initialOrder);
  const { toast } = useToast();

  React.useEffect(() => {
    setOrder(mockOrders.find((o) => o.id === params.id));
  }, [params.id]);

  if (!order) {
    notFound();
  }
  
  const customer = mockCustomers.find(c => c.id === order.customer_id);
  const processor = mockUsers.find(u => u.id === order.processed_by_user_id);
  const items = mockOrderItems.filter(item => item.order_id === order.id);

  const handleCancelOrder = () => {
    const orderInMock = mockOrders.find(o => o.id === order.id);
    if (orderInMock) {
      orderInMock.status = 'Cancelled';
      orderInMock.delivery_status = 'Cancelled';
      orderInMock.updated_at = new Date().toISOString();
    }
    setOrder({ ...order, status: 'Cancelled' });
    toast({
      title: 'Thành công',
      description: `Đơn hàng ${order.order_code} đã được hủy.`,
    });
  };

  const handlePrintOrder = () => {
    toast({
      title: 'Tính năng đang phát triển',
      description: 'Chức năng in đơn hàng sẽ sớm được ra mắt.',
    });
  };

  const handleEditOrder = () => {
     if (order.status !== 'Pending') {
        toast({ variant: 'destructive', title: 'Không thể sửa', description: 'Chỉ có thể sửa đơn hàng đang chờ xử lý.'});
        return;
    }
    toast({
      title: 'Tính năng đang phát triển',
      description: 'Chức năng sửa đơn hàng sẽ sớm được ra mắt.',
    });
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </Button>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handlePrintOrder}>
             <Printer className="mr-2 h-4 w-4"/> In đơn
           </Button>
           <Button variant="outline" size="sm" onClick={handleEditOrder} disabled={order.status !== 'Pending'}>
             <Edit className="mr-2 h-4 w-4"/> Sửa
           </Button>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={order.status === 'Cancelled' || order.status === 'Delivered'}>
                  <XCircle className="mr-2 h-4 w-4"/> Hủy đơn
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bạn có chắc chắn muốn hủy đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Đơn hàng <strong>{order.order_code}</strong> sẽ được chuyển sang trạng thái "Đã hủy".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Không</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">
                    Xác nhận hủy
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
              <CardTitle className="font-headline text-2xl">Chi tiết đơn hàng {order.order_code}</CardTitle>
              <CardDescription>
                Ngày tạo: {formatDate(order.created_at)}
              </CardDescription>
            </div>
            <Badge className="text-base" variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <User className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Khách hàng</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{customer?.name || 'Khách lẻ'}</p>
                            <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                            <p className="text-sm text-muted-foreground">{customer?.email}</p>
                            {customer && <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push(`/customers/${customer.id}`)}>Xem chi tiết</Button>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Truck className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Giao hàng</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">Địa chỉ:</span> {order.delivery_address || 'Nhận tại cửa hàng'}</p>
                             <p><span className="font-semibold">Trạng thái:</span> {order.delivery_status}</p>
                            <p><span className="font-semibold">Ngày dự kiến:</span> {formatDate(order.expected_delivery_date)}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <CreditCard className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Thanh toán</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">Phương thức:</span> {order.payment_type}</p>
                            <p><span className="font-semibold">Chi tiết:</span> {order.payment_details}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <StickyNote className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Ghi chú</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{order.note || 'Không có ghi chú.'}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Right Column */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                            <Package className="h-5 w-5 text-primary"/>
                            <h3 className="font-headline text-lg">Sản phẩm trong đơn</h3>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="text-center">Số lượng</TableHead>
                                    <TableHead className="text-right">Đơn giá</TableHead>
                                    <TableHead className="text-right">Thành tiền</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product_name}</TableCell>
                                        <TableCell className="text-center">{item.quantity} {item.product_unit}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            <Separator className="my-4"/>
                            <div className="space-y-2 text-right">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tạm tính</span>
                                    <span>{formatCurrency(items.reduce((sum, item) => sum + item.total_price, 0))}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giảm giá</span>
                                    <span>- {formatCurrency(order.discount_amount)}</span>
                                 </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phí vận chuyển</span>
                                    <span>{formatCurrency(order.shipping_fee)}</span>
                                 </div>
                                 <Separator className="my-2"/>
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(order.total_amount)}</span>
                                 </div>
                                 <div className="flex justify-between text-primary">
                                    <span>Đã thanh toán</span>
                                    <span>{formatCurrency(order.total_paid)}</span>
                                 </div>
                                 <div className="flex justify-between text-destructive font-semibold">
                                    <span>Còn lại</span>
                                    <span>{formatCurrency(order.total_amount - order.total_paid)}</span>
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
