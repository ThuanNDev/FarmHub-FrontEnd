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
  name: z.string().min(1, { message: "Product name cannot be empty." }),
  brand: z.string().min(1, { message: "Brand cannot be empty." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a non-negative integer." }),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
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
      toast({ title: "Success", description: "Product has been deleted." });
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
      toast({ title: "Success", description: "Product has been updated." });
    } else {
      const newProduct: Product = {
        ...values,
        slug: values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: "",
        categoryId: "cate-new",
        unit: "piece",
        creditPrice: values.price,
        min_stock_level: 5,
        images: "[\"https://placehold.co/600x600.png\"]",
        specs: "{}",
        warrantyInfo: "12-month warranty",
        supplierId: "supp-new",
        isActive: true,
        isDeleted: false,
        hint: 'product',
        productCode: `P${Math.floor(1000 + Math.random() * 9000)}`
      };
      setProducts([newProduct, ...products]);
      toast({ title: "Success", description: "New product has been added." });
    }
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.brand)))];

  const getProductsForTab = (tab: string) => {
    if(tab === 'All') return filteredProducts;
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
              placeholder="Search products..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
             <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
          </div>
        </div>
       <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline">Products</CardTitle>
            <CardDescription>
              Manage your products and view their stock status.
            </CardDescription>
             <TabsList>
                {categories.map(cat => (
                     <TabsTrigger key={cat} value={cat}>{cat === 'Tất cả' ? 'All' : cat}</TabsTrigger>
                ))}
            </TabsList>
          </CardHeader>
          <CardContent>
            {categories.map(cat => (
              <TabsContent key={cat} value={cat}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="hidden md:table-cell">Price</TableHead>
                      <TableHead className="hidden md:table-cell">Stock</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProductsForTab(cat === 'All' ? 'Tất cả' : cat).map((product) => (
                      <TableRow key={product.productCode}>
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
                              <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </CardContent>
       </Card>
      </Tabs>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {selectedProduct ? 'Update the details for this product.' : 'Fill in the information to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input placeholder="Kubota Tiller" {...field} />
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
                    <FormLabel className="text-right">Brand</FormLabel>
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
                    <FormLabel className="text-right">Price</FormLabel>
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
                    <FormLabel className="text-right">Stock</FormLabel>
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
                <Button type="submit" className="bg-primary hover:bg-primary/90">Save Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
               <strong> "{selectedProduct?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
