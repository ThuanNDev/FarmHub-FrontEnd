'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, MinusCircle, X, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockProducts, mockCustomers, mockCategories } from '@/lib/data';

type Product = typeof mockProducts[0];
type CartItem = Product & { quantity: number };

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const categories = mockCategories.filter(c => !c.is_deleted && c.is_active);
  const products = mockProducts.filter(p => !p.is_deleted && p.is_active);
  
  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;
  
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
    <div className="grid h-screen w-full grid-cols-1 gap-4 bg-background p-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 md:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-10 w-10">
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Quay lại Dashboard</span>
                </Link>
            </Button>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Bán hàng tại quầy (POS)</h1>
        </div>
        <Tabs defaultValue="all" onValueChange={(val) => setActiveCategory(val === 'all' ? null : val)} className="flex flex-1 flex-col">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pr-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <Image
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="aspect-square w-full object-cover"
                      data-ai-hint={product.hint}
                    />
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
      <div className="col-span-1">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Giỏ hàng</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground">Giỏ hàng của bạn đang trống.</p>
            ) : (
              <div className="grid gap-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="w-24 text-right font-medium">{formatCurrency(item.price * item.quantity)}</p>
                     <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, 0)}>
                        <X className="h-4 w-4" />
                      </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-4 border-t">
             <div className="w-full">
                <Label htmlFor="customer">Khách hàng</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn một khách hàng" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockCustomers.filter(c => !c.is_deleted && c.status === 'Active').map(customer => (
                             <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
            <Separator />
            <div className="flex w-full justify-between font-semibold">
              <span>Tổng cộng</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={cart.length === 0}>
              Hoàn tất đơn hàng
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
