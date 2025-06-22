
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, MapPin, Truck, Calendar, Hash, StickyNote, Package, CheckCircle, XCircle } from 'lucide-react';
import { mockPurchaseOrders, mockSuppliers, mockUsers, mockPurchaseOrderItems, mockProducts } from '@/lib/data';
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

type PurchaseOrder = typeof mockPurchaseOrders[0];

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  
  const initialPO = React.useMemo(() => mockPurchaseOrders.find((o) => o.id === params.id), [params.id]);
  
  const [po, setPo] = React.useState<PurchaseOrder | undefined>(initialPO);
  const { toast } = useToast();

  React.useEffect(() => {
    setPo(mockPurchaseOrders.find((o) => o.id === params.id));
  }, [params.id]);

  if (!po) {
    notFound();
  }
  
  const supplier = mockSuppliers.find(s => s.id === po.supplier_id);
  const createdBy = mockUsers.find(u => u.id === po.created_by_user_id);
  const items = mockPurchaseOrderItems.filter(item => item.purchase_order_id === po.id);

  const handleCancelOrder = () => {
    const poInDb = mockPurchaseOrders.find(o => o.id === po.id);
    if (poInDb) {
        poInDb.status = 'cancelled';
        poInDb.updated_at = new Date().toISOString();
        setPo({ ...po, status: 'cancelled' });
        toast({
            title: 'Thành công',
            description: `Đơn nhập hàng ${po.order_code} đã được hủy.`,
        });
    }
  };

  const handleConfirmReceived = () => {
    const poInDb = mockPurchaseOrders.find(o => o.id === po.id);
    if (poInDb) {
        poInDb.status = 'received';
        poInDb.received_date = new Date().toISOString();
        poInDb.updated_at = poInDb.received_date;
        
        // Update stock
        const poItems = mockPurchaseOrderItems.filter(item => item.purchase_order_id === po.id);
        poItems.forEach(item => {
            const product = mockProducts.find(p => p.id === item.product_id);
            if(product) {
                product.stock += item.quantity;
                item.received_quantity = item.quantity; // Mark as received
            }
        });

        setPo({ ...po, status: 'received', received_date: poInDb.received_date });
        toast({
            title: 'Thành công',
            description: `Đã xác nhận nhận hàng cho đơn ${po.order_code}. Tồn kho đã được cập nhật.`,
        });
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'received': return 'default';
      case 'ordered': return 'outline';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getProduct = (productId: string) => mockProducts.find(p => p.id === productId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/purchases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
         <div className="flex gap-2">
            {po.status === 'ordered' && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
                            <CheckCircle className="mr-2 h-4 w-4"/> Xác nhận đã nhận hàng
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận đã nhận hàng?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Hành động này sẽ cập nhật trạng thái đơn hàng thành "Đã nhận" và tăng tồn kho sản phẩm.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Không</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmReceived} className="bg-primary hover:bg-primary/90">
                                Xác nhận
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {po.status !== 'received' && po.status !== 'cancelled' && (
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                    <XCircle className="mr-2 h-4 w-4"/> Hủy đơn nhập
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn hủy đơn hàng?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Đơn hàng <strong>{po.order_code}</strong> sẽ được chuyển sang trạng thái "Đã hủy".
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
            )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">Chi tiết đơn nhập hàng {po.order_code}</CardTitle>
              <CardDescription>
                Ngày tạo: {formatDate(po.created_at)} bởi {createdBy?.full_name || 'N/A'}
              </CardDescription>
            </div>
            <Badge className="text-base" variant={getStatusVariant(po.status)}>{po.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Truck className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Nhà cung cấp</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{supplier?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{supplier?.phone}</p>
                            <p className="text-sm text-muted-foreground">{supplier?.address}</p>
                            {supplier && <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push(`/suppliers/${supplier.id}`)}>Xem chi tiết NCC</Button>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Calendar className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Thông tin ngày</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">Ngày dự kiến nhận:</span> {formatDate(po.expected_delivery_date)}</p>
                            <p><span className="font-semibold">Ngày thực tế nhận:</span> {formatDate(po.received_date)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <StickyNote className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Ghi chú</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{po.note || 'Không có ghi chú.'}</p>
                        </CardContent>
                    </Card>
                </div>
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
                                    <TableHead className="text-right">Đơn giá nhập</TableHead>
                                    <TableHead className="text-right">Thành tiền</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {items.map(item => {
                                    const product = getProduct(item.product_id);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{product?.name || 'Sản phẩm không tìm thấy'}</TableCell>
                                            <TableCell className="text-center">{item.quantity} {product?.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                </TableBody>
                            </Table>
                            <Separator className="my-4"/>
                            <div className="space-y-2 text-right">
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(po.total_amount)}</span>
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
