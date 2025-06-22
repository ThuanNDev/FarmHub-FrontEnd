'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, MinusCircle, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockProducts, mockCustomers } from '@/lib/data';

type CartItem = typeof mockProducts[0] & { quantity: number };

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const addToCart = (product: typeof mockProducts[0]) => {
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

  const categories = ['all', ...Array.from(new Set(mockProducts.map((p) => p.category)))];
  const filteredProducts = activeCategory === 'all' ? mockProducts : mockProducts.filter(p => p.category === activeCategory);

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 md:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Point of Sale</h1>
        </div>
        <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="h-[calc(100vh-220px)] mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pr-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="aspect-square w-full object-cover"
                    data-ai-hint={product.hint}
                  />
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>
      <div className="col-span-1">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground">Your cart is empty.</p>
            ) : (
              <div className="grid gap-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
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
                    <p className="w-16 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
                <Label htmlFor="customer">Customer</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockCustomers.map(customer => (
                             <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
            <Separator />
            <div className="flex w-full justify-between font-semibold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={cart.length === 0}>
              Complete Order
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
