'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { mockProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const product = mockProducts.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const images = JSON.parse(product.images) as string[];
  const [selectedImage, setSelectedImage] = useState(images[0] || 'https://picsum.photos/600/600');
  const specs = JSON.parse(product.specs) as Record<string, string>;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex justify-start">
            <Button asChild variant="outline" size="sm">
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Link>
            </Button>
        </div>
        <Card>
            <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <div className="grid gap-4">
                        <div className="aspect-square w-full overflow-hidden rounded-lg border shadow-sm">
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                data-ai-hint={product.hint}
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={`overflow-hidden rounded-lg border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        width={100}
                                        height={100}
                                        className="w-full h-full aspect-square object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <Badge variant="outline">{product.brand}</Badge>
                            <h1 className="text-3xl font-bold font-headline mt-2">{product.name}</h1>
                        </div>
                        <p className="text-muted-foreground">{product.description}</p>
                        
                        <div className="flex items-end gap-4">
                           <div className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</div>
                           {product.credit_price && (
                               <div className="text-xl text-muted-foreground line-through">{formatCurrency(product.credit_price)}</div>
                           )}
                        </div>

                        <div className="flex items-center gap-2">
                            {product.stock > 0 ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="font-medium text-green-600">Còn hàng ({product.stock} {product.unit})</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 text-red-500" />
                                    <span className="font-medium text-red-600">Hết hàng</span>
                                </>
                            )}
                        </div>

                        <Separator className="my-2" />

                        <div className="grid gap-4">
                            <h3 className="font-semibold text-xl">Thông số kỹ thuật</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {Object.entries(specs).map(([key, value]) => (
                                    <React.Fragment key={key}>
                                        <div className="font-medium text-muted-foreground">{key}</div>
                                        <div>{value}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-2" />

                        <div className="grid gap-2">
                             <h3 className="font-semibold text-xl">Thông tin bảo hành</h3>
                             <p className="text-sm text-muted-foreground">{product.warranty_info}</p>
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
