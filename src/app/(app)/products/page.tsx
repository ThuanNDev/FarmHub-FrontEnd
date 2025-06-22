'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const categories = ['All', ...Array.from(new Set(mockProducts.map((p) => p.category)))];

  const getProductsForTab = (tab: string) => {
    if(tab === 'All') return filteredProducts;
    return filteredProducts.filter(p => p.category === tab);
  }

  return (
    <Tabs defaultValue="All">
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-headline">Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new item to your inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" placeholder="Compact Tractor" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Input id="category" placeholder="Tractors" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price</Label>
                  <Input id="price" type="number" placeholder="25000" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input id="stock" type="number" placeholder="10" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Save product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
       <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline">Products</CardTitle>
            <CardDescription>
              Manage your products and view their inventory status.
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {getProductsForTab(cat).map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                        <Image
                            alt={product.name}
                            className="aspect-square w-full object-cover"
                            height="300"
                            src={product.imageUrl}
                            width="300"
                            data-ai-hint={product.hint}
                        />
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground">
                                    {product.stock} in stock
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
  );
}
