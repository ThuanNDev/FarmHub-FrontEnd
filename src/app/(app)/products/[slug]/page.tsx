
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

type Product = (typeof mockProducts)[0];

const productSchema = z.object({
  name: z.string().min(1, { message: 'Tên sản phẩm không được để trống.' }),
  product_code: z.string().min(1, { message: 'Mã sản phẩm không được để trống.' }),
  description: z.string().optional(),
  category_id: z.string().min(1, { message: 'Vui lòng chọn thể loại.' }),
  supplier_id: z.string().min(1, { message: 'Vui lòng chọn nhà cung cấp.' }),
  brand: z.string().min(1, { message: 'Thương hiệu không được để trống.' }),
  unit: z.string().min(1, { message: 'Đơn vị không được để trống.' }),
  import_price: z.coerce.number().positive({ message: 'Giá nhập phải là một số dương.' }),
  price: z.coerce.number().positive({ message: 'Giá lẻ phải là một số dương.' }),
  wholesale_price: z.coerce.number().positive({ message: 'Giá sỉ phải là số dương.' }).optional(),
  credit_price: z.coerce.number().positive({ message: 'Giá bán nợ phải là số dương.' }).optional(),
  stock: z.coerce.number().int().min(0, { message: 'Tồn kho phải là số nguyên không âm.' }),
  min_stock_level: z.coerce.number().int().min(0, { message: 'Ngưỡng tồn kho phải là số nguyên không âm.' }),
  warranty_info: z.string().optional(),
  is_active: z.boolean().default(true),
  images: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;


export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();
  
  const initialProduct = mockProducts.find((p) => p.slug === params.slug && !p.is_deleted);
  
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
          product_code: product.product_code,
          description: product.description,
          category_id: product.category_id,
          supplier_id: product.supplier_id,
          brand: product.brand,
          unit: product.unit,
          import_price: product.import_price,
          price: product.price,
          wholesale_price: product.wholesale_price || undefined,
          credit_price: product.credit_price || undefined,
          stock: product.stock,
          min_stock_level: product.min_stock_level,
          warranty_info: product.warranty_info,
          is_active: product.is_active,
          images: imageString,
        });
    }
  }, [isEditDialogOpen, product, form]);

  if (!product) {
    notFound();
  }

  const images = JSON.parse(product.images) as string[];
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

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const productIndex = mockProducts.findIndex(p => p.id === product.id);
    if (productIndex > -1) {
      mockProducts[productIndex].is_deleted = true;
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
        wholesale_price: values.wholesale_price || values.price,
        credit_price: values.credit_price || values.price,
        description: values.description || '',
        warranty_info: values.warranty_info || 'Không có',
        updated_at: now,
    };

    const productIndex = mockProducts.findIndex(p => p.id === product.id);
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
  
  const activeCategories = mockCategories.filter(c => c.is_active && !c.is_deleted);
  const activeSuppliers = mockSuppliers.filter(s => !s.is_deleted);

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
                                <div>{isClient ? formatDate(product.created_at) : <>&nbsp;</>}</div>
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
                  name="product_code"
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
                    name="category_id"
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
                              <SelectItem key={category.id} value={category.id}>
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
                    name="supplier_id"
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
                              <SelectItem key={supplier.id} value={supplier.id}>
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
                            name="import_price"
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
                            name="wholesale_price"
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
                            name="credit_price"
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
                    name="min_stock_level"
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
                  name="warranty_info"
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
                  name="is_active"
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
