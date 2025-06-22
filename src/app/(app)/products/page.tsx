
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  File,
  PlusCircle,
  Search,
  MoreHorizontal,
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
import { Label } from '@/components/ui/label';
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
import { mockProducts, mockCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type Product = (typeof mockProducts)[0];

const productSchema = z.object({
  name: z.string().min(1, { message: 'Tên sản phẩm không được để trống.' }),
  description: z.string().optional(),
  category_id: z.string().min(1, { message: 'Vui lòng chọn thể loại.' }),
  brand: z.string().min(1, { message: 'Thương hiệu không được để trống.' }),
  unit: z.string().min(1, { message: 'Đơn vị không được để trống.' }),
  price: z.coerce.number().positive({ message: 'Giá phải là một số dương.' }),
  credit_price: z.coerce.number().positive({ message: 'Giá trả góp phải là số dương.' }).optional(),
  stock: z.coerce.number().int().min(0, { message: 'Tồn kho phải là số nguyên không âm.' }),
  min_stock_level: z.coerce.number().int().min(0, { message: 'Ngưỡng tồn kho phải là số nguyên không âm.' }),
  warranty_info: z.string().optional(),
  is_active: z.boolean().default(true),
  images: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(7);

  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      brand: '',
      unit: 'chiếc',
      price: 0,
      credit_price: 0,
      stock: 0,
      min_stock_level: 5,
      warranty_info: 'Bảo hành 12 tháng',
      is_active: true,
      images: '',
    },
  });

  useEffect(() => {
    if (isAddEditDialogOpen) {
      if (selectedProduct) {
        let imageString = '';
        try {
            imageString = JSON.parse(selectedProduct.images).join(', ');
        } catch (e) {
            console.error("Failed to parse product images", e);
        }
        form.reset({
          name: selectedProduct.name,
          description: selectedProduct.description,
          category_id: selectedProduct.category_id,
          brand: selectedProduct.brand,
          unit: selectedProduct.unit,
          price: selectedProduct.price,
          credit_price: selectedProduct.credit_price,
          stock: selectedProduct.stock,
          min_stock_level: selectedProduct.min_stock_level,
          warranty_info: selectedProduct.warranty_info,
          is_active: selectedProduct.is_active,
          images: imageString,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          category_id: '',
          brand: '',
          unit: 'chiếc',
          price: 0,
          credit_price: 0,
          stock: 0,
          min_stock_level: 5,
          warranty_info: 'Bảo hành 12 tháng',
          is_active: true,
          images: '',
        });
      }
    }
  }, [isAddEditDialogOpen, selectedProduct, form]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

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
      setProducts(products.filter((p) => p.product_code !== selectedProduct.product_code));
      toast({ title: 'Thành công', description: 'Sản phẩm đã được xóa.' });
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const onSubmit = (values: ProductFormValues) => {
    const imagesAsJsonString = values.images
        ? JSON.stringify(values.images.split(',').map(url => url.trim()).filter(url => url))
        : '[]';

    if (selectedProduct) {
      const updatedProducts = products.map((p) =>
        p.product_code === selectedProduct.product_code 
          ? { 
              ...p, 
              ...values,
              images: imagesAsJsonString,
              slug: values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
              credit_price: values.credit_price || values.price,
              description: values.description || '',
              warranty_info: values.warranty_info || 'Không có',
            } 
          : p
      );
      setProducts(updatedProducts);
      toast({ title: 'Thành công', description: 'Sản phẩm đã được cập nhật.' });
    } else {
      const newProduct: Product = {
        ...values,
        product_code: `P${Math.floor(1000 + Math.random() * 9000)}`,
        slug: values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        credit_price: values.credit_price || values.price,
        images: imagesAsJsonString.length > 2 ? imagesAsJsonString : '["https://placehold.co/600x600.png"]',
        specs: '{}',
        supplier_id: 'supp-new',
        is_deleted: false,
        hint: 'product',
        description: values.description || '',
        warranty_info: values.warranty_info || 'Không có',
      };
      setProducts([newProduct, ...products]);
      toast({ title: 'Thành công', description: 'Sản phẩm mới đã được thêm.' });
    }
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = ['Tất cả', ...Array.from(new Set(products.map((p) => p.brand)))];

  const getProductsForTab = (tab: string) => {
    if (tab === 'Tất cả') return filteredProducts;
    return filteredProducts.filter((p) => p.brand === tab);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/300x300.png';
    } catch (e) {
      return 'https://placehold.co/300x300.png';
    }
  };

  const productsForCurrentTab = getProductsForTab(activeTab);
  const totalPages = Math.ceil(productsForCurrentTab.length / productsPerPage);

  const firstItem = productsForCurrentTab.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0;
  const lastItem = Math.min(currentPage * productsPerPage, productsForCurrentTab.length);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Thêm sản phẩm
              </span>
            </Button>
          </div>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline">Sản phẩm</CardTitle>
            <CardDescription>
              Quản lý sản phẩm và xem tình trạng tồn kho của chúng.
            </CardDescription>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent>
            {categories.map((cat) => {
              const productsForThisTab = getProductsForTab(cat);
              const paginatedProducts = productsForThisTab.slice(
                (currentPage - 1) * productsPerPage,
                currentPage * productsPerPage
              );
              return (
                <TabsContent key={cat} value={cat}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Ảnh</span>
                        </TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Thương hiệu</TableHead>
                        <TableHead className="hidden md:table-cell">Giá</TableHead>
                        <TableHead className="hidden md:table-cell">Tồn kho</TableHead>
                        <TableHead>
                          <span className="sr-only">Hành động</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.product_code}>
                          <TableCell className="hidden sm:table-cell">
                            <Link href={`/products/${product.slug}`}>
                              <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={getImageUrl(product.images)}
                                width="64"
                                data-ai-hint={product.hint}
                              />
                            </Link>
                          </TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/products/${product.slug}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatCurrency(product.price)}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(product)}>Sửa</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
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
              );
            })}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Hiển thị <strong>{firstItem}-{lastItem}</strong> trên <strong>{productsForCurrentTab.length}</strong> sản phẩm
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages}
              >
                Sau
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Tabs>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Cập nhật thông tin chi tiết cho sản phẩm này.' : 'Điền thông tin để thêm một sản phẩm mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
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
               </div>
               <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {mockCategories.map((category) => (
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="15000000" {...field} />
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
                        <FormLabel>Giá trả góp (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="16000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
              <DialogFooter>
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
