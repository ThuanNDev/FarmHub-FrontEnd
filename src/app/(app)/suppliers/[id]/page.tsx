'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Phone, User, Package } from 'lucide-react';
import { mockSuppliers, mockProducts } from '@/lib/data';
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
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/64x64.png';
    } catch (e) {
      return 'https://placehold.co/64x64.png';
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
        <div className="md:col-span-1">
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
                     <TableHead className="text-right">Giá</TableHead>
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
