'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  File,
  PlusCircle,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockProducts } from '@/lib/data';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = mockProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = ['Tất cả', ...Array.from(new Set(mockProducts.map((p) => p.brand)))];

  const getProductsForTab = (tab: string) => {
    if(tab === 'Tất cả') return filteredProducts;
    return filteredProducts.filter(p => p.brand === tab);
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/300x300.png';
    } catch (e) {
      return 'https://placehold.co/300x300.png';
    }
  }

  return (
    <Tabs defaultValue="Tất cả">
      <div className="flex items-center">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm sản phẩm
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">Thêm sản phẩm mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin để thêm một sản phẩm vào kho.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Tên</Label>
                  <Input id="name" placeholder="Máy xới đất Kubota" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">Thương hiệu</Label>
                  <Input id="brand" placeholder="Kubota" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Giá</Label>
                  <Input id="price" type="number" placeholder="15000000" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Tồn kho</Label>
                  <Input id="stock" type="number" placeholder="25" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu sản phẩm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
       <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline">Sản phẩm</CardTitle>
            <CardDescription>
              Quản lý sản phẩm và xem tình trạng tồn kho.
            </CardDescription>
             <TabsList>
                {categories.map(cat => (
                     <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                ))}
            </TabsList>
          </CardHeader>
          <CardContent>
            {categories.map(cat => (
                <TabsContent key={cat} value={cat}>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {getProductsForTab(cat).map((product) => (
                      <Link href={`/products/${product.slug}`} key={product.productCode} className="block h-full">
                        <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                           <Image
                              alt={product.name}
                              className="aspect-square w-full object-cover"
                              height="300"
                              src={getImageUrl(product.images)}
                              width="300"
                              data-ai-hint={product.hint}
                          />
                          <CardContent className="p-4 flex flex-col flex-grow">
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                                <span className="text-sm text-muted-foreground">
                                    {product.stock} trong kho
                                </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    </div>
                </TabsContent>
            ))}
            
          </CardContent>
       </Card>
    </Tabs>
  );
}
