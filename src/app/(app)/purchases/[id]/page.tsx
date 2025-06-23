
'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, MapPin, Truck, Calendar, Hash, StickyNote, Package, CheckCircle, XCircle, Printer } from 'lucide-react';
import { mockPurchaseOrders, mockSuppliers, mockUsers, mockPurchaseOrderItems, mockProducts, mockStores } from '@/lib/data';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

type PurchaseOrder = typeof mockPurchaseOrders[0];

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const initialPO = React.useMemo(() => mockPurchaseOrders.find((o) => o.purchaseOrderId === params.id), [params.id]);
  
  const [po, setPo] = React.useState<PurchaseOrder | undefined>(initialPO);
  const { toast } = useToast();

  React.useEffect(() => {
    setPo(mockPurchaseOrders.find((o) => o.purchaseOrderId === params.id));
  }, [params.id]);

  if (!po) {
    notFound();
  }
  
  const supplier = mockSuppliers.find(s => s.supplierId === po.supplierId);
  const createdBy = mockUsers.find(u => u.userId === po.createdByUserId);
  const items = mockPurchaseOrderItems.filter(item => item.purchaseOrderId === po.purchaseOrderId);

  const handleCancelOrder = () => {
    const poInDb = mockPurchaseOrders.find(o => o.purchaseOrderId === po.purchaseOrderId);
    if (poInDb) {
        poInDb.status = 'cancelled';
        poInDb.updatedAt = new Date().toISOString();
        setPo({ ...po, status: 'cancelled' });
        toast({
            title: 'Thành công',
            description: `Đơn nhập hàng ${po.orderCode} đã được hủy.`,
        });
    }
  };

  const handleConfirmReceived = () => {
    const poInDb = mockPurchaseOrders.find(o => o.purchaseOrderId === po.purchaseOrderId);
    if (poInDb) {
        poInDb.status = 'received';
        poInDb.receivedDate = new Date().toISOString();
        poInDb.updatedAt = poInDb.receivedDate;
        
        // Update stock
        const poItems = mockPurchaseOrderItems.filter(item => item.purchaseOrderId === po.purchaseOrderId);
        poItems.forEach(item => {
            const product = mockProducts.find(p => p.productId === item.productId);
            if(product) {
                product.stock += item.quantity;
                item.receivedQuantity = item.quantity; // Mark as received
            }
        });

        setPo({ ...po, status: 'received', receivedDate: poInDb.receivedDate });
        toast({
            title: 'Thành công',
            description: `Đã xác nhận nhận hàng cho đơn ${po.orderCode}. Tồn kho đã được cập nhật.`,
        });
    }
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
      case 'received': return 'default';
      case 'ordered': return 'outline';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getProduct = (productId: string) => mockProducts.find(p => p.productId === productId);

  const handlePrint = () => {
    if (!po || !supplier || !createdBy) {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không đủ dữ liệu để in.' });
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

    const itemsHtml = items.map((item, index) => {
        const product = getProduct(item.productId);
        return `
            <tr class="item">
                <td class="text-center">${index + 1}</td>
                <td>${product?.name || 'Sản phẩm không tìm thấy'}</td>
                <td class="text-center">${product?.unit || 'cái'}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(item.totalPrice)}</td>
                <td></td>
                <td class="text-center"><div style="width: 16px; height: 16px; border: 1px solid #000; margin: auto;"></div></td>
            </tr>
        `;
    }).join('');

    const printHtml = `
      <html>
        <head>
          <title>Đơn Nhập Hàng ${po.orderCode}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000; }
            .container { width: 90%; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-section div { width: 48%; }
            .info-section h3 { margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-section p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2 !important; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .total-section { text-align: right; margin-bottom: 40px; }
            .total-section h2 { margin: 5px 0; }
            .signature-section { display: flex; justify-content: space-around; text-align: center; margin-top: 50px; }
            .signature-section div { width: 30%; }
            .signature-section p { margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ĐƠN NHẬP HÀNG</h1>
              <p>Mã đơn: ${po.orderCode}</p>
              <p>Ngày tạo: ${formatDate(po.createdAt)}</p>
            </div>
            
            <div class="info-section">
                <div>
                    <h3>Thông tin cửa hàng</h3>
                    <p><strong>Tên:</strong> ${mockStores[0].name}</p>
                    <p><strong>Địa chỉ:</strong> ${mockStores[0].address}</p>
                    <p><strong>Điện thoại:</strong> ${mockStores[0].phone}</p>
                    <p><strong>Người tạo:</strong> ${createdBy.fullName}</p>
                </div>
                 <div>
                    <h3>Thông tin nhà cung cấp</h3>
                    <p><strong>Tên:</strong> ${supplier.name}</p>
                    <p><strong>Địa chỉ:</strong> ${supplier.address || 'N/A'}</p>
                    <p><strong>Điện thoại:</strong> ${supplier.phone}</p>
                    <p><strong>Người liên hệ:</strong> ${supplier.contactPerson || 'N/A'}</p>
                </div>
            </div>

            <h3>Danh sách sản phẩm</h3>
            <table>
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th>Tên sản phẩm</th>
                  <th class="text-center">ĐVT</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-right">Đơn giá</th>
                  <th class="text-right">Thành tiền</th>
                  <th class="text-center" style="width: 20%;">Ghi chú</th>
                  <th class="text-center" style="width: 10%;">Đã nhận</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-section">
                <h2>Tổng cộng: ${formatCurrency(po.totalAmount)}</h2>
            </div>
            
            <div class="signature-section">
                <div>
                    <h4>Người lập phiếu</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Thủ kho</h4>
                    <p>(Ký, họ tên)</p>
                </div>
                 <div>
                    <h4>Nhà cung cấp</h4>
                    <p>(Ký, họ tên)</p>
                </div>
            </div>

          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };


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
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4"/> In đơn
            </Button>
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
                        Hành động này không thể hoàn tác. Đơn hàng <strong>{po.orderCode}</strong> sẽ được chuyển sang trạng thái "Đã hủy".
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
              <CardTitle className="font-headline text-2xl">Chi tiết đơn nhập hàng {po.orderCode}</CardTitle>
              <CardDescription>
                Ngày tạo: {formatDate(po.createdAt)} bởi {createdBy?.fullName || 'N/A'}
              </CardDescription>
            </div>
            <Badge className="text-base" variant={getStatusVariant(po.status)}>{t(`status.${po.status.toLowerCase()}`)}</Badge>
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
                            {supplier && <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push(`/suppliers/${supplier.supplierId}`)}>Xem chi tiết NCC</Button>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                           <Calendar className="h-5 w-5 text-primary"/>
                           <h3 className="font-headline text-lg">Thông tin ngày</h3>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p><span className="font-semibold">Ngày dự kiến nhận:</span> {formatDate(po.expectedDeliveryDate)}</p>
                            <p><span className="font-semibold">Ngày thực tế nhận:</span> {formatDate(po.receivedDate)}</p>
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
                                    const product = getProduct(item.productId);
                                    return (
                                        <TableRow key={item.purchaseOrderItemId}>
                                            <TableCell className="font-medium">{product?.name || 'Sản phẩm không tìm thấy'}</TableCell>
                                            <TableCell className="text-center">{item.quantity} {product?.unit}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                </TableBody>
                            </Table>
                            <Separator className="my-4"/>
                            <div className="space-y-2 text-right">
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(po.totalAmount)}</span>
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
