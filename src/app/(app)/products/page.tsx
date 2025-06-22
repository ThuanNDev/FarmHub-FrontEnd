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
  MoreVertical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { mockProducts } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type Product = typeof mockProducts[0];

const productSchema = z.object({
  productCode: z.string(), 
  name: z.string().min(1, { message: "Tên sản phẩm không được để trống." }),
  brand: z.string().min(1, { message: "Thương hiệu không được để trống." }),
  price: z.coerce.number().positive({ message: "Giá phải là một số dương." }),
  stock: z.coerce.number().int().min(0, { message: "Số lượng tồn kho phải là số nguyên không âm." }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productCode: '',
      name: '',
      brand: '',
      price: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (isAddEditDialogOpen) {
        if (selectedProduct) {
        form.reset({
            productCode: selectedProduct.productCode,
            name: selectedProduct.name,
            brand: selectedProduct.brand,
            price: selectedProduct.price,
            stock: selectedProduct.stock,
        });
        } else {
        form.reset({
            productCode: '',
            name: '',
            brand: '',
            price: 0,
            stock: 0,
        });
        }
    }
  }, [isAddEditDialogOpen, selectedProduct, form]);

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
      setProducts(products.filter(p => p.productCode !== selectedProduct.productCode));
      toast({ title: "Thành công", description: "Sản phẩm đã được xóa." });
    }
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const onSubmit = (values: ProductFormValues) => {
    if (selectedProduct) {
      const updatedProducts = products.map(p => 
        p.productCode === selectedProduct.productCode ? { ...p, ...values } : p
      );
      setProducts(updatedProducts);
      toast({ title: "Thành công", description: "Sản phẩm đã được cập nhật." });
    } else {
      const newProduct: Product = {
        ...values,
        slug: values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: "",
        categoryId: "cate-new",
        unit: "chiếc",
        creditPrice: values.price,
        min_stock_level: 5,
        images: "[\"https://placehold.co/600x600.png\"]",
        specs: "{}",
        warrantyInfo: "Bảo hành 12 tháng",
        supplierId: "supp-new",
        isActive: true,
        isDeleted: false,
        hint: 'product',
        productCode: `P${Math.floor(1000 + Math.random() * 9000)}`
      };
      setProducts([newProduct, ...products]);
      toast({ title: "Thành công", description: "Sản phẩm mới đã được thêm." });
    }
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = ['Tất cả', ...Array.from(new Set(products.map((p) => p.brand)))];

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
                      <Card key={product.productCode} className="overflow-hidden h-full flex flex-col relative group">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive hover:!text-destructive-foreground hover:!bg-destructive">
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href={`/products/${product.slug}`} className="block">
                           <Image
                              alt={product.name}
                              className="aspect-square w-full object-cover"
                              height="300"
                              src={getImageUrl(product.images)}
                              width="300"
                              data-ai-hint={product.hint}
                          />
                        </Link>
                        <CardContent className="p-4 flex flex-col flex-grow">
                          <div className="flex-grow">
                            <Link href={`/products/${product.slug}`} className="block">
                                <h3 className="font-semibold text-lg hover:underline">{product.name}</h3>
                            </Link>
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
                    ))}
                    </div>
                </TabsContent>
            ))}
            
          </CardContent>
       </Card>
      </Tabs>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Cập nhật thông tin chi tiết cho sản phẩm.' : 'Điền thông tin để thêm một sản phẩm vào kho.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Tên</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input placeholder="Máy xới đất Kubota" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Thương hiệu</FormLabel>
                     <div className="col-span-3">
                      <FormControl>
                        <Input placeholder="Kubota" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Giá</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" placeholder="15000000" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Tồn kho</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu sản phẩm</Button>
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
              Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn sản phẩm
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
