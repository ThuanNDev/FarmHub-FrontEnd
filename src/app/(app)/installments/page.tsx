'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Landmark } from 'lucide-react';
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
import { mockOrders, mockCustomers } from '@/lib/data';

type InstallmentOrder = (typeof mockOrders)[0];

export default function InstallmentsPage() {
  const [installmentOrders, setInstallmentOrders] = useState<InstallmentOrder[]>([]);
  const router = useRouter();

  useEffect(() => {
    const orders = mockOrders.filter(
      (order) => order.payment_type === 'Installment' && order.status !== 'Cancelled'
    );
    setInstallmentOrders(orders);
  }, []);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || 'Khách lẻ';
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getInstallmentStatus = (order: InstallmentOrder) => {
    const remaining = order.total_amount - order.total_paid;
    if (remaining <= 0) {
      return { text: 'Đã hoàn tất', variant: 'default' as const };
    }
    // Could add more logic here based on due dates if we had that data per installment
    return { text: 'Đang trả góp', variant: 'secondary' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Landmark className="h-6 w-6"/>
            Quản lý trả góp
        </CardTitle>
        <CardDescription>
          Theo dõi các đơn hàng mua theo hình thức trả góp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã ĐH</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Đã trả</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
              <TableHead>Tình trạng</TableHead>
              <TableHead>
                <span className="sr-only">Hành động</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installmentOrders.length > 0 ? (
              installmentOrders.map((order) => {
                const status = getInstallmentStatus(order);
                const remaining = order.total_amount - order.total_paid;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_code}</TableCell>
                    <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell className="text-right text-primary">{formatCurrency(order.total_paid)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(remaining)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.text}</Badge>
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
                          <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>Xem chi tiết đơn hàng</DropdownMenuItem>
                          <DropdownMenuItem>Ghi nhận thanh toán</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có đơn hàng trả góp nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Hiển thị <strong>{installmentOrders.length}</strong> đơn hàng trả góp.
        </div>
      </CardFooter>
    </Card>
  );
}
