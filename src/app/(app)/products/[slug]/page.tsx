
'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Package, DollarSign, Warehouse, Tag, Truck, Info, Calendar } from 'lucide-react';
import { mockProducts, mockCategories, mockSuppliers } from '@/lib/data';
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
  
  const category = mockCategories.find(c => c.id === product.category_id);
  const supplier = mockSuppliers.find(s => s.id === product.supplier_id);
  
  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
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
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                    {/* Column 1: Images */}
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

                    {/* Column 2: Core Details */}
                    <div className="grid gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{product.brand}</Badge>
                                {product.is_active ?
                                    <Badge variant="default">Đang kinh doanh</Badge>
                                    : <Badge variant="destructive">Ngừng kinh doanh</Badge>
                                }
                            </div>
                            <h1 className="text-3xl font-bold font-headline mt-2">{product.name}</h1>
                            <p className="text-muted-foreground mt-1">SKU: {product.product_code}</p>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/> Giá cả</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="font-medium text-muted-foreground">Giá bán lẻ</div>
                                <div className="font-bold text-lg text-primary">{formatCurrency(product.price)}</div>
                                
                                <div className="font-medium text-muted-foreground">Giá bán sỉ</div>
                                <div>{formatCurrency(product.wholesale_price)}</div>

                                <div className="font-medium text-muted-foreground">Giá bán nợ</div>
                                <div>{formatCurrency(product.credit_price)}</div>

                                <div className="font-medium text-muted-foreground">Giá nhập</div>
                                <div>{formatCurrency(product.import_price)}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                             <h3 className="font-semibold text-xl flex items-center gap-2"><Warehouse className="w-5 h-5 text-primary"/> Tồn kho</h3>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="font-medium text-muted-foreground">Trong kho</div>
                                <div className="flex items-center gap-2">
                                    {product.stock > 0 ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className={product.stock > 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                                        {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Hết hàng'}
                                    </span>
                                </div>

                                <div className="font-medium text-muted-foreground">Ngưỡng tồn kho tối thiểu</div>
                                <div>{product.min_stock_level} {product.unit}</div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Other Details */}
                     <div className="grid gap-6">
                        {product.description && (
                            <div>
                                <h3 className="font-semibold text-xl flex items-center gap-2"><Info className="w-5 h-5 text-primary"/> Mô tả sản phẩm</h3>
                                <p className="text-muted-foreground mt-2 text-sm">{product.description}</p>
                            </div>
                        )}

                        <Separator />

                        <div className="grid gap-4">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><Package className="w-5 h-5 text-primary"/> Thông tin chung</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="font-medium text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4"/> Thể loại</div>
                                <div>{category?.name || 'N/A'}</div>

                                <div className="font-medium text-muted-foreground flex items-center gap-2"><Truck className="w-4 h-4"/> Nhà cung cấp</div>
                                <div>{supplier?.name || 'N/A'}</div>

                                <div className="font-medium text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4"/> Đơn vị tính</div>
                                <div>{product.unit}</div>
                                
                                <div className="font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/> Ngày tạo</div>
                                <div>{formatDate(product.created_at)}</div>
                            </div>
                        </div>

                         <Separator />

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

                        <Separator />

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
