'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  File,
  PlusCircle,
  Search,
  MoreHorizontal,
  Sparkles,
  Loader2,
  Trash2,
  Camera,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockProducts, mockCategories, mockSuppliers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn, slugify } from '@/lib/utils';
import { productSchema } from '@/lib/form-schemas';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateProductSpecs } from '@/ai/flows/generate-product-specs';

type Product = (typeof mockProducts)[0];
type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts.filter(p => !p.isDeleted));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(7);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      productCode: '',
      description: '',
      categoryId: '',
      supplierId: '',
      brand: '',
      unit: 'chiếc',
      importPrice: 0,
      price: 0,
      wholesalePrice: 0,
      creditPrice: 0,
      stock: 0,
      minStockLevel: 5,
      warrantyInfo: 'Bảo hành 12 tháng',
      isActive: true,
      images: '[]',
      specs: '{}',
      url: ''
    },
  });

  useEffect(() => {
    if (isAddEditDialogOpen) {
      if (selectedProduct) {
        form.reset({
          name: selectedProduct.name,
          productCode: selectedProduct.productCode,
          description: selectedProduct.description,
          categoryId: selectedProduct.categoryId,
          supplierId: selectedProduct.supplierId,
          brand: selectedProduct.brand,
          unit: selectedProduct.unit,
          importPrice: selectedProduct.importPrice,
          price: selectedProduct.price,
          wholesalePrice: selectedProduct.wholesalePrice || undefined,
          creditPrice: selectedProduct.creditPrice || undefined,
          stock: selectedProduct.stock,
          minStockLevel: selectedProduct.minStockLevel,
          warrantyInfo: selectedProduct.warrantyInfo,
          isActive: selectedProduct.isActive,
          images: selectedProduct.images, // Now passing the JSON string
          specs: selectedProduct.specs,
          url: selectedProduct.url || ''
        });
      } else {
        form.reset({
          name: '',
          productCode: '',
          description: '',
          categoryId: '',
          supplierId: '',
          brand: '',
          unit: 'chiếc',
          importPrice: 0,
          price: 0,
          wholesalePrice: undefined,
          creditPrice: undefined,
          stock: 0,
          minStockLevel: 5,
          warrantyInfo: 'Bảo hành 12 tháng',
          isActive: true,
          images: '[]',
          specs: '{}',
          url: ''
        });
      }
    }
  }, [isAddEditDialogOpen, selectedProduct, form]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  const handleAddNew = () => {
    setSelectedProduct(null);
    setAddEditDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setAddEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.map(p => p.productId === selectedProduct.productId ? { ...p, isDeleted: true } : p).filter(p => !p.isDeleted));
      toast({ title: 'Thành công', description: 'Sản phẩm đã được xóa.' });
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const onSubmit = (values: ProductFormValues) => {
    const now = new Date().toISOString();

    if (selectedProduct) {
      const updatedProducts = products.map((p) =>
        p.productId === selectedProduct.productId 
          ? { 
              ...p, 
              ...values,
              slug: slugify(values.name),
              wholesalePrice: values.wholesalePrice || values.price,
              creditPrice: values.creditPrice || values.price,
              description: values.description || '',
              warrantyInfo: values.warrantyInfo || 'Không có',
              updatedAt: now,
              specs: values.specs || '{}',
              url: values.url || null,
              images: values.images || '[]'
            } 
          : p
      );
      setProducts(updatedProducts);
      toast({ title: 'Thành công', description: 'Sản phẩm đã được cập nhật.' });
    } else {
      const newProduct: Product = {
        productId: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
        ...values,
        slug: slugify(values.name),
        wholesalePrice: values.wholesalePrice || values.price,
        creditPrice: values.creditPrice || values.price,
        images: values.images && values.images.length > 2 ? values.images : '["https://placehold.co/600x400.png"]',
        specs: values.specs || '{}',
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        hint: 'product',
        description: values.description || '',
        warrantyInfo: values.warrantyInfo || 'Không có',
        url: values.url || null,
      };
      setProducts([newProduct, ...products]);
      toast({ title: 'Thành công', description: 'Sản phẩm mới đã được thêm.' });
    }
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const filteredProducts = useMemo(() => {
    let results = [...products];

    if (activeCategory !== 'all') {
        results = results.filter(p => p.categoryId === activeCategory);
    }
    
    if (searchTerm) {
        results = results.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return results;
  }, [products, searchTerm, activeCategory]);

  const categoriesForTabs = useMemo(() => ([
    { categoryId: 'all', name: 'Tất cả' },
    ...mockCategories.filter(c => c.isActive && !c.isDeleted),
  ]), []);


  const formatCurrency = (amount: number) => {
    if (!amount) return '0 ₫';
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
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const firstItem = filteredProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0;
  const lastItem = Math.min(currentPage * productsPerPage, filteredProducts.length);
  
  const activeCategories = mockCategories.filter(c => c.isActive && !c.isDeleted);
  const activeSuppliers = mockSuppliers.filter(s => !s.isDeleted);

  return (
    <>
      <Card>
          <CardHeader>
            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                <div>
                    <CardTitle className="font-headline">Sản phẩm</CardTitle>
                    <CardDescription>
                    Quản lý sản phẩm và xem tình trạng tồn kho của chúng.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAddNew}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Thêm sản phẩm
                        </span>
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-4">
                <TabsList>
                {categoriesForTabs.map((category) => (
                    <TabsTrigger key={category.categoryId} value={category.categoryId}>
                    {category.name}
                    </TabsTrigger>
                ))}
                </TabsList>
                <TabsContent value={activeCategory} className="mt-4">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[64px] sm:table-cell">
                        <span className="sr-only">Ảnh</span>
                        </TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead className="hidden md:table-cell">Thương hiệu</TableHead>
                        <TableHead className="text-right">Giá bán lẻ</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Giá sỉ</TableHead>
                        <TableHead className="hidden md:table-cell text-center">Tồn kho</TableHead>
                        <TableHead>
                        <span className="sr-only">Hành động</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paginatedProducts.map((product) => (
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
                        <TableCell className="font-medium">
                            <div>{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.productCode}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{product.brand}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-right">{formatCurrency(product.wholesalePrice)}</TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                            {product.stock <= 0 ? (
                                <Badge variant="destructive">Hết hàng</Badge>
                            ) : product.stock <= product.minStockLevel ? (
                                <Badge variant="outline">{product.stock}</Badge>
                            ) : (
                                product.stock
                            )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleEdit(product)}>Sửa</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDelete(product)} className="text-destructive">
                                Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Hiển thị <strong>{firstItem}-{lastItem}</strong> trên <strong>{filteredProducts.length}</strong> sản phẩm
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
              >
                Sau
              </Button>
            </div>
          </CardFooter>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Cập nhật thông tin chi tiết cho sản phẩm này.' : 'Điền thông tin để thêm một sản phẩm mới.'}
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
                    render={({ field }) => <ProductDescriptionForm form={form} field={field} />}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>URL trang sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/product-page" {...field} />
                      </FormControl>
                       <FormDescription>
                        Dùng để AI lấy thông tin cho thông số kỹ thuật.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specs"
                  render={({ field }) => <ProductSpecsForm form={form} field={field} />}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => <ProductImageForm field={field} />}
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
                  Lưu sản phẩm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
              <strong> "{selectedProduct?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper sub-components for the form to keep it clean

function ProductDescriptionForm({ form, field }: { form: any, field: any }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerateDescription = async () => {
        const { name, brand, specs } = form.getValues();
        if (!name || !brand) {
        toast({
            variant: 'destructive',
            title: 'Thiếu thông tin',
            description: 'Vui lòng nhập Tên sản phẩm và Thương hiệu.',
        });
        return;
        }
        setIsGenerating(true);
        try {
        const result = await generateProductDescription({ name, brand, specs });
        form.setValue('description', result.description, { shouldValidate: true });
        } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không thể tạo mô tả. Vui lòng thử lại.',
        });
        } finally {
        setIsGenerating(false);
        }
    };

    return (
        <FormItem className="md:col-span-3">
            <div className="flex items-center justify-between">
            <FormLabel>Mô tả</FormLabel>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
            >
                {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Sparkles className="mr-2 h-4 w-4" />
                )}
                Tạo bằng AI
            </Button>
            </div>
            <FormControl>
            <Textarea
                placeholder="Mô tả chi tiết về sản phẩm..."
                {...field}
                rows={5}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}

function ProductSpecsForm({ form, field }: { form: any, field: any }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerateSpecs = async () => {
        const { name, brand, url } = form.getValues();
        if (!name || !brand || !url) {
        toast({
            variant: 'destructive',
            title: 'Thiếu thông tin',
            description: 'Vui lòng nhập Tên, Thương hiệu và URL sản phẩm.',
        });
        return;
        }
        setIsGenerating(true);
        try {
        const result = await generateProductSpecs({ name, brand, url });
        form.setValue('specs', result.specs, { shouldValidate: true });
        } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Lỗi',
            description: 'Không thể tạo thông số. Vui lòng kiểm tra lại URL và thử lại.',
        });
        } finally {
        setIsGenerating(false);
        }
    };
    
    return (
        <FormItem className="md:col-span-3">
            <div className="flex items-center justify-between">
                <FormLabel>Thông số kỹ thuật</FormLabel>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateSpecs}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Lấy từ URL
                </Button>
            </div>
            <FormControl>
                <Textarea placeholder='{"Công suất": "1.2 kW", "Trọng lượng": "4.1 kg"}' {...field} rows={4} />
            </FormControl>
            <FormDescription>
                Nhập dưới dạng JSON. Mỗi cặp key-value sẽ được hiển thị trên một dòng.
            </FormDescription>
            <FormMessage />
        </FormItem>
    );
}

function ProductImageForm({ field }: { field: any }) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(field.value || '[]');
            if (Array.isArray(parsed)) {
                setImageUrls(parsed);
            }
        } catch (e) {
            setImageUrls([]);
        }
    }, [field.value]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newUrls = [...imageUrls, reader.result as string];
                field.onChange(JSON.stringify(newUrls));
            };
            reader.readAsDataURL(file);
        }
        // Reset file input to allow selecting the same file again
        if(event.target) {
            event.target.value = '';
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
        field.onChange(JSON.stringify(newUrls));
    };

    return (
        <FormItem className="md:col-span-3">
          <FormLabel>Hình ảnh sản phẩm</FormLabel>
          <div className="p-3 border rounded-md min-h-[120px]">
            {imageUrls.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                        <Image src={url} alt={`Product image ${index + 1}`} layout="fill" className="object-cover rounded-md border" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-muted-foreground p-4">Chưa có hình ảnh nào.</div>
            )}
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Tải ảnh lên
            </Button>
          </div>
          <FormDescription>
            Tải lên hình ảnh từ máy tính. Dữ liệu ảnh sẽ được lưu trực tiếp.
          </FormDescription>
          <FormMessage />
        </FormItem>
    )
}
