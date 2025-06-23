
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Package, CheckCircle, XCircle, Undo2, Hash, Calendar, DollarSign, StickyNote, RefreshCcw } from 'lucide-react';
import { mockReturnOrders, mockReturnOrderItems, mockOrders, mockProducts, mockCustomers, mockUsers } from '@/lib/data';
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
import { useLanguage } from '@/store/LanguageContext';
import { format } from 'date-fns';

type ReturnOrder = typeof mockReturnOrders[0];

export default function ReturnOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const initialRO = React.useMemo(() => mockReturnOrders.find((ro) => ro.returnOrderId === params.id), [params.id]);
  
  const [returnOrder, setReturnOrder] = React.useState<ReturnOrder | undefined>(initialRO);
  const { toast } = useToast();

  React.useEffect(() => {
    setReturnOrder(mockReturnOrders.find((ro) => ro.returnOrderId === params.id));
  }, [params.id]);

  if (!returnOrder) {
    notFound();
  }
  
  const originalOrder = mockOrders.find(o => o.orderId === returnOrder.orderId);
  const customer = mockCustomers.find(c => c.customerId === returnOrder.customerId);
  const processor = mockUsers.find(u => u.userId === returnOrder.processedByUserId);
  const items = mockReturnOrderItems.filter(item => item.returnOrderId === returnOrder.returnOrderId);
  
  const handleAction = (action: 'approve' | 'reject' | 'restock' | 'refund') => {
    const roInDb = mockReturnOrders.find(ro => ro.returnOrderId === returnOrder.returnOrderId);
    if (!roInDb) return;

    let newStatus = roInDb.status;
    let toastMessage = '';

    if (action === 'approve') {
      newStatus = 'approved';
      toastMessage = t('pages.returns.success_approve');
    } else if (action === 'reject') {
      newStatus = 'rejected';
      toastMessage = t('pages.returns.success_reject');
    } else if (action === 'refund') {
      newStatus = 'refunded';
      toastMessage = t('pages.returns.success_refund');
    } else if (action === 'restock') {
        const itemsToRestock = mockReturnOrderItems.filter(item => item.returnOrderId === returnOrder.returnOrderId && !item.restocked);
        itemsToRestock.forEach(item => {
            if (item.condition === 'new') {
                const product = mockProducts.find(p => p.productId === item.productId);
                if (product) {
                    product.stock += item.quantity;
                }
            }
            item.restocked = true;
        });
        toastMessage = t('pages.returns.success_restock', { count: itemsToRestock.length });
        if(itemsToRestock.every(i => i.restocked)) {
          newStatus = 'restocked';
        }
    }
    
    roInDb.status = newStatus;
    roInDb.updatedAt = new Date().toISOString();
    setReturnOrder({ ...roInDb });

    toast({ title: t('common.success'), description: toastMessage });
  };


  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'refunded':
      case 'restocked':
      case 'approved':
        return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getProduct = (productId: string) => mockProducts.find(p => p.productId === productId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/returns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách trả hàng
          </Link>
        </Button>
         <div className="flex gap-2">
            {returnOrder.status === 'pending' && (
                <>
                <Button size="sm" onClick={() => handleAction('approve')}><CheckCircle className="mr-2 h-4 w-4"/> Phê duyệt</Button>
                <Button size="sm" variant="destructive" onClick={() => handleAction('reject')}><XCircle className="mr-2 h-4 w-4"/> Từ chối</Button>
                </>
            )}
             {returnOrder.status === 'approved' && (
                <>
                <Button size="sm" onClick={() => handleAction('refund')}><DollarSign className="mr-2 h-4 w-4"/> Xác nhận hoàn tiền</Button>
                <Button size="sm" variant="outline" onClick={() => handleAction('restock')}><RefreshCcw className="mr-2 h-4 w-4"/> Nhập lại kho</Button>
                </>
             )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">Chi tiết đơn trả hàng #{returnOrder.returnOrderId.slice(-6)}</CardTitle>
              <CardDescription>
                Ngày tạo: {formatDate(returnOrder.createdAt)}
              </CardDescription>
            </div>
            <Badge className="text-base" variant={getStatusVariant(returnOrder.status)}>{t(`status.${returnOrder.status.toLowerCase()}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <User className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Khách hàng</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{customer?.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Hash className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Thông tin đơn hàng</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">Đơn gốc:</span> <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push(`/orders/${originalOrder?.orderId}`)}>{originalOrder?.orderCode}</Button></p>
                            <p><span className="font-semibold">Tổng hoàn tiền:</span> {formatCurrency(returnOrder.totalRefundAmount)}</p>
                            <p><span className="font-semibold">Ngày trả:</span> {formatDate(returnOrder.returnDate)}</p>
                            <p><span className="font-semibold">Người xử lý:</span> {processor?.fullName || 'Chưa có'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <StickyNote className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Lý do trả hàng</h3>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{returnOrder.reason || 'Không có.'}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                            <Package className="h-5 w-5 text-primary"/>
                            <h3 className="font-headline text-lg">Sản phẩm trả lại</h3>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="text-center">Số lượng</TableHead>
                                    <TableHead className="text-right">Giá hoàn trả</TableHead>
                                    <TableHead>Tình trạng</TableHead>
                                    <TableHead>Nhập kho</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {items.map(item => {
                                    const product = getProduct(item.productId);
                                    return (
                                        <TableRow key={item.returnOrderItemId}>
                                            <TableCell className="font-medium">{product?.name || 'Sản phẩm không tìm thấy'}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell><Badge variant="outline">{item.condition}</Badge></TableCell>
                                            <TableCell>{item.restocked ? <Badge variant="default">Đã nhập lại</Badge> : <Badge variant="secondary">Chưa</Badge>}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
