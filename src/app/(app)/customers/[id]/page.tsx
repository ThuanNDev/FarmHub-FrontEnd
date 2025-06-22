'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import { mockCustomers, mockOrders } from '@/lib/data';
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

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const customer = mockCustomers.find((c) => c.id === params.id && !c.is_deleted);

  if (!customer) {
    notFound();
  }
  
  const customerOrders = mockOrders.filter(o => o.customer_id === customer.id);
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
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
                    <CardDescription>{customer.customer_type === 'Wholesale' ? 'Khách sỉ' : 'Khách lẻ'}</CardDescription>
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
                        <p className="text-sm"><span className="text-muted-foreground">Mã số thuế:</span> {customer.tax_code || 'N/A'}</p>
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
                            <span className="font-medium">{formatCurrency(customer.credit_limit)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tổng nợ</span>
                            <span className="font-medium text-destructive">{formatCurrency(customer.total_debt)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Ngày đến hạn</span>
                            <span className="font-medium">{formatDate(customer.debt_due_date)}</span>
                        </div>
                    </div>
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
                     <TableRow key={order.id} onClick={() => router.push(`/orders/${order.id}`)} className="cursor-pointer">
                       <TableCell className="font-medium">{order.order_code}</TableCell>
                       <TableCell>{formatDate(order.created_at)}</TableCell>
                       <TableCell>
                         <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                       </TableCell>
                       <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
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
  );
}
