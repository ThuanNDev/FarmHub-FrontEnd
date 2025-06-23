
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import { useLanguage } from '@/store/LanguageContext';
import type { Category, Product } from '@/types';
import { getCategoryBySlug, getProductsByCategoryId } from '@/services/api';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { t } = useLanguage();

  const [category, setCategory] = React.useState<Category | null>(null);
  const [productsInCategory, setProductsInCategory] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const fetchedCategory = await getCategoryBySlug(params.slug);
      if (fetchedCategory) {
        setCategory(fetchedCategory);
        const fetchedProducts = await getProductsByCategoryId(fetchedCategory.categoryId);
        setProductsInCategory(fetchedProducts);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [params.slug]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!category) {
    notFound();
  }
  
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
                src={category.image || 'https://placehold.co/64x64.png'}
                alt={category.name}
                width={64}
                height={64}
                className="rounded-lg border"
                data-ai-hint="category icon"
              />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {t(category.isActive ? 'status.active' : 'status.inactive')}
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
                     <TableRow key={product.productId} onClick={() => router.push(`/products/${product.slug}`)} className="cursor-pointer">
                       <TableCell className="hidden sm:table-cell">
                         <Image
                           alt={product.name}
                           className="aspect-square rounded-md object-cover"
                           height="64"
                           src={getImageUrl(product.images)}
                           width="64"
                           data-ai-hint={product.hint}
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
