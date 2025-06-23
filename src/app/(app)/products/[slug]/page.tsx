
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, CheckCircle, XCircle, Package, DollarSign, Warehouse, Tag, Truck, Info, Calendar, Edit, Trash2 } from 'lucide-react';
import { mockProducts, mockCategories, mockSuppliers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { productSchema } from '@/lib/form-schemas';

type Product = (typeof mockProducts)[0];
type ProductFormValues = z.infer<typeof productSchema>;


export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialProduct = mockProducts.find((p) => p.slug === params.slug && !p.isDeleted);
  
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (product) {
      const images = JSON.parse(product.images) as string[];
      setSelectedImage(images[0] || 'https://picsum.photos/600/600');
    }
  }, [product]);
  
  useEffect(() => {
    if (isEditDialogOpen && product) {
        let imageString = '';
        try {
            imageString = JSON.parse(product.images).join(', ');
        } catch (e) {
            console.error("Failed to parse product images", e);
        }
        form.reset({
          name: product.name,
          productCode: product.productCode,
          description: product.description,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          brand: product.brand,
          unit: product.unit,
          importPrice: product.importPrice,
          price: product.price,
          wholesalePrice: product.wholesalePrice || undefined,
          creditPrice: product.creditPrice || undefined,
          stock: product.stock,
          minStockLevel: product.minStockLevel,
          warrantyInfo: product.warrantyInfo,
          isActive: product.isActive,
          images: imageString,
        });
    }
  }, [isEditDialogOpen, product, form]);

  if (!product) {
    notFound();
  }

  const images = JSON.parse(product.images) as string[];
  const specs = JSON.parse(product.specs) as Record<string, string>;
  
  const category = mockCategories.find(c => c.categoryId === product.categoryId);
  const supplier = mockSuppliers.find(s => s.supplierId === product.supplierId);
  
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

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const productIndex = mockProducts.findIndex(p => p.productId === product.productId);
    if (productIndex > -1) {
      mockProducts[productIndex].isDeleted = true;
    }
    toast({ title: 'Thành công', description: 'Sản phẩm đã được xóa.' });
    router.push('/products');
  };
  
  const onSubmit = (values: ProductFormValues) => {
    if (!product) return;

    const imagesAsJsonString = values.images
        ? JSON.stringify(values.images.split(',').map(url => url.trim()).filter(url => url))
        : '[]';
    
    const now = new Date().toISOString();
    const newSlug = slugify(values.name);

    const updatedProductData = {
        ...product,
        ...values,
        images: imagesAsJsonString,
        slug: newSlug,
        wholesalePrice: values.wholesalePrice || values.price,
        creditPrice: values.creditPrice || values.price,
        description: values.description || '',
        warrantyInfo: values.warrantyInfo || 'Không có',
        updatedAt: now,
    };

    const productIndex = mockProducts.findIndex(p => p.productId === product.productId);
    if (productIndex !== -1) {
        mockProducts[productIndex] = updatedProductData;
    }

    setProduct(updatedProductData);
    toast({ title: 'Thành công', description: 'Sản phẩm đã được cập nhật.' });
    setEditDialogOpen(false);

    if (product.slug !== newSlug) {
        router.replace(`/products/${newSlug}`);
    }
  };

  if (!selectedImage) {
    return null; 
  }
  
  const activeCategories = mockCategories.filter(c => c.isActive && !c.isDeleted);
  const activeSuppliers = mockSuppliers.filter(s => !s.isDeleted);

  return (
    <>
    <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Link>
            </Button>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                    <Edit className="mr-2 h-4 w-4"/> Sửa
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4"/> Xóa
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
                                <strong> "{product?.name}"</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
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
                                {product.isActive ?
                                    <Badge variant="default">Đang kinh doanh</Badge>
                                    : <Badge variant="destructive">Ngừng kinh doanh</Badge>
                                }
                            </div>
                            <h1 className="text-3xl font-bold font-headline mt-2">{product.name}</h1>
                            <p className="text-muted-foreground mt-1">SKU: {product.productCode}</p>
                        </div>

                        <Separator />

                        <div className="grid gap-4">
                            <h3 className="font-semibold text-xl flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/> Giá cả</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="font-medium text-muted-foreground">Giá bán lẻ</div>
                                <div className="font-bold text-lg text-primary">{formatCurrency(product.price)}</div>
                                
                                <div className="font-medium text-muted-foreground">Giá bán sỉ</div>
                                <div>{formatCurrency(product.wholesalePrice)}</div>

                                <div className="font-medium text-muted-foreground">Giá bán nợ</div>
                                <div>{formatCurrency(product.creditPrice)}</div>

                                <div className="font-medium text-muted-foreground">Giá nhập</div>
                                <div>{formatCurrency(product.importPrice)}</div>
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
                                <div>{product.minStockLevel} {product.unit}</div>
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
                                <div>{isClient ? formatDate(product.createdAt) : <>&nbsp;</>}</div>
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
                             <p className="text-sm text-muted-foreground">{product.warrantyInfo}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>

    <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết cho sản phẩm này.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Máy xới đất Kubota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã sản phẩm (SKU)</FormLabel>
                      <FormControl>
                        <Input placeholder="KUB-XOI-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thương hiệu</FormLabel>
                      <FormControl>
                        <Input placeholder="Kubota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thể loại</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn một thể loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activeCategories.map((category) => (
                              <SelectItem key={category.categoryId} value={category.categoryId}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhà cung cấp</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhà cung cấp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activeSuppliers.map((supplier) => (
                              <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả chi tiết về sản phẩm..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Hình ảnh</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Dán các URL hình ảnh, cách nhau bằng dấu phẩy" {...field} />
                      </FormControl>
                      <FormDescription>
                        Cung cấp một hoặc nhiều URL hình ảnh, phân tách bằng dấu phẩy.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <FormField
                            control={form.control}
                            name="importPrice"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá nhập</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="12000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá lẻ</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="15000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="wholesalePrice"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá sỉ</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="14000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="creditPrice"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá bán nợ</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="16000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Đơn vị</FormLabel>
                        <FormControl>
                        <Input placeholder="chiếc, kg, lít..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tồn kho</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tồn kho tối thiểu</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               <FormField
                  control={form.control}
                  name="warrantyInfo"
                  render={({ field }) => {
                    const warrantyMonths = field.value?.match(/\d+/)?.[0] || '0';
                    return (
                    <FormItem>
                      <FormLabel>Thông tin bảo hành</FormLabel>
                       <Select
                        onValueChange={(months) => {
                            const newValue = months === '0' 
                                ? 'Không bảo hành' 
                                : `Bảo hành ${months} tháng`;
                            field.onChange(newValue);
                        }}
                        value={warrantyMonths}
                    >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thời gian bảo hành" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Không bảo hành</SelectItem>
                          <SelectItem value="3">3 tháng</SelectItem>
                          <SelectItem value="6">6 tháng</SelectItem>
                          <SelectItem value="12">12 tháng</SelectItem>
                          <SelectItem value="18">18 tháng</SelectItem>
                          <SelectItem value="24">24 tháng</SelectItem>
                          <SelectItem value="36">36 tháng</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                    )
                  }}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                       <div className="space-y-0.5">
                        <FormLabel>Trạng thái</FormLabel>
                        <FormDescription>
                          Sản phẩm này sẽ hiển thị trong cửa hàng.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              <DialogFooter className="md:col-span-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
