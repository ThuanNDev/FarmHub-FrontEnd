'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, X, Search, ArrowLeft, UserPlus } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart;
      }
      if (product.stock > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      }
      return prevCart;
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else if (newQuantity <= product.stock) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  }

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    const finalTotal = subtotal - discount;
    return finalTotal > 0 ? finalTotal : 0;
  }, [subtotal, discount]);


  const categories = mockCategories.filter(c => !c.is_deleted && c.is_active);
  const products = mockProducts.filter(p => !p.is_deleted && p.is_active);
  
  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter(p => p.category_id === activeCategory);
    }
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [products, activeCategory, searchTerm]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
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
    <div className="grid h-screen w-full grid-cols-10 gap-4 bg-muted/40 p-4">
      {/* Product Selection Area */}
      <div className="col-span-6 flex flex-col gap-4">
        <header className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-sm">
            <Button asChild variant="outline" size="icon" className="h-10 w-10">
                <Link href="/">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Quay lại Dashboard</span>
                </Link>
            </Button>
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm sản phẩm bằng tên hoặc mã vạch..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 rounded-lg bg-background p-4 shadow-sm">
           <Tabs defaultValue="all" onValueChange={(val) => setActiveCategory(val === 'all' ? null : val)}>
                <TabsList>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                    ))}
                </TabsList>
                <ScrollArea className="mt-4 h-[calc(100vh-200px)]">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pr-4">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
                        onClick={() => addToCart(product)}
                      >
                        <div className="relative">
                            <Image
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="aspect-square w-full object-cover"
                            data-ai-hint={product.hint}
                            />
                             <div className="absolute top-1 right-1 bg-background/80 text-foreground text-xs font-bold px-2 py-1 rounded-full">
                                Tồn kho: {product.stock}
                            </div>
                        </div>
                        <CardContent className="p-2 text-center">
                          <p className="text-sm font-semibold truncate group-hover:text-primary">{product.name}</p>
                          <p className="text-sm text-muted-foreground font-bold">{formatCurrency(product.price)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
            </Tabs>
        </main>
      </div>

      {/* Cart Area */}
      <div className="col-span-4">
        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="p-4 border-b">
             <div className="flex items-center gap-2">
                <Select defaultValue="guest">
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn một khách hàng" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="guest">Khách lẻ</SelectItem>
                        {mockCustomers.filter(c => !c.is_deleted && c.status === 'Active').map(customer => (
                             <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                    <UserPlus className="h-4 w-4" />
                </Button>
             </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
             <ScrollArea className="h-[calc(100vh-320px)]">
                 {cart.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-muted-foreground">Chọn sản phẩm để thêm vào giỏ hàng.</p>
                    </div>
                ) : (
                <div className="grid gap-4 p-4">
                    {cart.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-5">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="col-span-4 flex items-center justify-center gap-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="h-6 w-10 text-center p-0 border-0 shadow-none focus-visible:ring-0"
                         />
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                        </div>
                        <p className="col-span-2 text-right font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        <Button size="icon" variant="ghost" className="col-span-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => updateQuantity(item.id, 0)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
                )}
             </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-4 border-t bg-muted/40">
            <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="discount">Giảm giá</Label>
                    <Input 
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="h-8 w-32 text-right"
                        placeholder="0"
                    />
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Khách phải trả</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={cart.length === 0}>
              Thanh toán
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
