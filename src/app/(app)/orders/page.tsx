'use client';

import { useState, useMemo } from 'react';
import { File, ListFilter, MoreHorizontal } from 'lucide-react';
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { mockOrders, mockCustomers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type Order = typeof mockOrders[0];

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

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

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.id === customerId)?.name || 'Khách lẻ';
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  const handlePrint = (order: Order) => {
    toast({ title: 'Tính năng đang phát triển', description: 'Chức năng in đơn hàng sẽ sớm ra mắt.' });
  };

  const handleEdit = (order: Order) => {
    if (order.status !== 'Pending') {
        toast({ variant: 'destructive', title: 'Không thể sửa', description: 'Chỉ có thể sửa đơn hàng đang chờ xử lý.'});
        return;
    }
    toast({ title: 'Tính năng đang phát triển', description: 'Chức năng sửa đơn hàng sẽ sớm ra mắt.' });
  };

  const handleOpenCancelDialog = (order: Order) => {
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      toast({ variant: 'destructive', title: 'Không thể hủy', description: 'Không thể hủy đơn hàng đã giao hoặc đã bị hủy.' });
      return;
    }
    setOrderToCancel(order);
  };
  
  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderToCancel.id ? { ...o, status: 'Cancelled', updated_at: new Date().toISOString() } : o
      )
    );
    toast({ title: 'Thành công', description: `Đơn hàng ${orderToCancel.order_code} đã được hủy.` });
    setOrderToCancel(null);
  };


  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="Pending">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="Delivered">Đã giao</TabsTrigger>
            <TabsTrigger value="Cancelled">
              Đã hủy
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-10 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Xuất file
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Đơn hàng</CardTitle>
              <CardDescription>
                Danh sách các đơn hàng gần đây từ cửa hàng của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã ĐH</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="hidden md:table-cell">Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead>
                      <span className="sr-only">Hành động</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_code}</TableCell>
                      <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status) as any}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total_amount)}
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
                            <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(order)}>In đơn</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(order)} disabled={order.status !== 'Pending'}>Sửa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenCancelDialog(order)} 
                              className="text-destructive" 
                              disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                            >
                              Hủy đơn
                            </DropdownMenuItem>
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
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ hủy đơn hàng <strong>{orderToCancel?.order_code}</strong>. Bạn không thể hoàn tác hành động này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToCancel(null)}>Không</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">Xác nhận hủy</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
