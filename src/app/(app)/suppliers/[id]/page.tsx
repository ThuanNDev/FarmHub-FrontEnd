
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Phone, User, Package, PackagePlus } from 'lucide-react';
import { mockSuppliers, mockProducts, mockPurchaseOrders } from '@/lib/data';
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

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supplier = mockSuppliers.find((s) => s.id === params.id && !s.is_deleted);

  if (!supplier) {
    notFound();
  }
  
  const productsFromSupplier = mockProducts.filter(p => p.supplier_id === supplier.id && !p.is_deleted);
  const purchaseOrdersFromSupplier = mockPurchaseOrders.filter(po => po.supplier_id === supplier.id);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/64x64.png';
    } catch (e) {
      return 'https://placehold.co/64x64.png';
    }
  };
  
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'received': return 'default';
      case 'ordered': return 'outline';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <Button asChild variant="outline" size="sm">
          <Link href="/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách nhà cung cấp
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{supplier.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.contact_person || 'Chưa có'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.email || 'Chưa có'}</span>
                    </div>
                     <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span>{supplier.address || 'Chưa có'}</span>
                    </div>
                    <Separator />
                     <div className="space-y-2">
                        <h4 className="font-semibold">Thông tin thêm</h4>
                        <p className="text-sm"><span className="text-muted-foreground">Mã số thuế:</span> {supplier.tax_code || 'N/A'}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Ghi chú:</span> {supplier.note || 'Không có'}</p>
                     </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <PackagePlus className="h-5 w-5"/>
                        Lịch sử nhập hàng
                    </CardTitle>
                    <CardDescription>Tổng cộng {purchaseOrdersFromSupplier.length} đơn hàng.</CardDescription>
                </CardHeader>
                <CardContent>
                {purchaseOrdersFromSupplier.length > 0 ? (
                 <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Mã ĐN</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead className="text-right">Tổng tiền</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {purchaseOrdersFromSupplier.map((po) => (
                     <TableRow key={po.id} onClick={() => router.push(`/purchases/${po.id}`)} className="cursor-pointer">
                       <TableCell className="font-medium">{po.order_code}</TableCell>
                       <TableCell>
                         <Badge variant={getStatusVariant(po.status)}>{po.status}</Badge>
                       </TableCell>
                       <TableCell className="text-right">{formatCurrency(po.total_amount)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Chưa có lịch sử nhập hàng.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Package className="h-5 w-5"/>
                        Sản phẩm cung cấp
                    </CardTitle>
                    <CardDescription>Tổng cộng {productsFromSupplier.length} sản phẩm.</CardDescription>
                </CardHeader>
                <CardContent>
                {productsFromSupplier.length > 0 ? (
                 <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="hidden w-[64px] sm:table-cell">Ảnh</TableHead>
                     <TableHead>Tên sản phẩm</TableHead>
                     <TableHead>Thương hiệu</TableHead>
                     <TableHead className="text-right">Giá bán</TableHead>
                     <TableHead className="text-center">Tồn kho</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {productsFromSupplier.map((product) => (
                     <TableRow key={product.id} onClick={() => router.push(`/products/${product.slug}`)} className="cursor-pointer">
                       <TableCell className="hidden sm:table-cell">
                         <Image
                           alt={product.name}
                           className="aspect-square rounded-md object-cover"
                           height="64"
                           src={getImageUrl(product.images)}
                           width="64"
                         />
                       </TableCell>
                       <TableCell className="font-medium">{product.name}</TableCell>
                       <TableCell>{product.brand}</TableCell>
                       <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                       <TableCell className="text-center">{product.stock}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Nhà cung cấp này chưa có sản phẩm nào.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
