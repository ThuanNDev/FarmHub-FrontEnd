
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { mockCategories, mockProducts } from '@/lib/data';
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
import { useLanguage } from '@/contexts/LanguageContext';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const category = mockCategories.find((c) => c.slug === params.slug);
  const { t } = useLanguage();

  if (!category) {
    notFound();
  }
  
  const productsInCategory = mockProducts.filter(p => p.CategoryId === category.CategoryId && !p.is_deleted);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://picsum.photos/64/64';
    } catch (e) {
      return 'https://picsum.photos/64/64';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <Button asChild variant="outline" size="sm">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách thể loại
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
             <Image
                src={category.image || 'https://picsum.photos/64/64'}
                alt={category.name}
                width={64}
                height={64}
                className="rounded-lg border"
                data-ai-hint="category icon"
              />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {t(category.is_active ? 'status.active' : 'status.inactive')}
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <h3 className="font-headline text-xl mb-4">Sản phẩm trong thể loại</h3>
            {productsInCategory.length > 0 ? (
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
                   {productsInCategory.map((product) => (
                     <TableRow key={product.ProductId} onClick={() => router.push(`/products/${product.slug}`)} className="cursor-pointer">
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
                <p className="text-muted-foreground text-center py-8">Không có sản phẩm nào trong thể loại này.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
