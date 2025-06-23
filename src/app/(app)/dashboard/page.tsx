
'use client';
import {
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  ShoppingCart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { mockOrders, mockCustomers, mockProducts, mockOrderItems, mockChartData } from '@/lib/data';
import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/store/LanguageContext';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t } = useLanguage();
  const [newOrdersThisMonth, setNewOrdersThisMonth] = useState(0);

  useEffect(() => {
    const today = new Date();
    const newOrdersCount = mockOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear() && order.status !== 'Cancelled';
    }).length;
    setNewOrdersThisMonth(newOrdersCount);
  }, []);


  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  const {
    totalRevenue,
    totalDebt,
    totalCustomers,
    recentOrders,
    bestSellingProducts
  } = useMemo(() => {
    const totalRevenue = mockOrders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.totalAmount : sum, 0);
    const totalDebt = mockCustomers.reduce((sum, customer) => sum + (customer.totalDebt || 0), 0);
    const totalCustomers = mockCustomers.filter(c => !c.isDeleted).length;
    
    const recentOrders = [...mockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const productSales: { [key: string]: { quantity: number, product: any } } = {};

    mockOrderItems.forEach(item => {
        const order = mockOrders.find(o => o.orderId === item.orderId);
        if (order && order.status !== 'Cancelled') {
            if (!productSales[item.productId]) {
                const product = mockProducts.find(p => p.productId === item.productId);
                if (product) {
                    productSales[item.productId] = { product, quantity: 0 };
                }
            }
            if (productSales[item.productId]) {
                productSales[item.productId].quantity += item.quantity;
            }
        }
    });

    const bestSellingProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
        
    return { totalRevenue, totalDebt, totalCustomers, recentOrders, bestSellingProducts };
  }, []);

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find(c => c.customerId === customerId)?.name || 'Khách lẻ';
  };
  
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://picsum.photos/40/40';
    } catch (e) {
      return 'https://picsum.photos/40/40';
    }
  };


  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      {/* 4 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages.dashboard.total_revenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{t('pages.dashboard.revenue_comparison')}</p>
          </CardContent>
        </Card>
        {/* Total Debt */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages.dashboard.total_debt')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
            <p className="text-xs text-muted-foreground">{t('pages.dashboard.debt_description')}</p>
          </CardContent>
        </Card>
        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages.dashboard.customers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">{t('pages.dashboard.customers_description')}</p>
          </CardContent>
        </Card>
        {/* New Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages.dashboard.new_orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newOrdersThisMonth}</div>
            <p className="text-xs text-muted-foreground">{t('pages.dashboard.new_orders_description')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Revenue Chart */}
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle className="font-headline">{t('pages.dashboard.revenue_overview')}</CardTitle>
                <CardDescription>{t('pages.dashboard.revenue_overview_description')}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={{ revenue: { label: "Doanh thu", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
                    <BarChart data={mockChartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                            tickFormatter={(value) => `${(value as number) / 1000000}tr`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value) => formatCurrency(value as number)}
                                indicator="dot"
                            />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle className="font-headline">{t('pages.dashboard.recent_orders')}</CardTitle>
                <CardDescription>
                    {t('pages.dashboard.recent_orders_description', { count: mockOrders.filter(o => o.status === 'Pending').length })}
                </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1" variant="secondary">
                <Link href="/orders">
                    {t('pages.dashboard.view_all')}
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages.dashboard.recent_orders_customer')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('pages.dashboard.recent_orders_date')}</TableHead>
                  <TableHead>{t('pages.dashboard.recent_orders_status')}</TableHead>
                  <TableHead className="text-right">{t('pages.dashboard.recent_orders_total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>
                      <div className="font-medium">{getCustomerName(order.customerId)}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                        <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('pages.dashboard.best_selling_products')}</CardTitle>
            <CardDescription>{t('pages.dashboard.best_selling_products_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellingProducts.length > 0 ? bestSellingProducts.map(({product, quantity}) => (
                <div key={product.productId} className="flex items-center">
                    <Avatar className="h-9 w-9 border">
                        <AvatarImage src={getImageUrl(product.images)} alt={product.name} data-ai-hint={product.hint} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                    <div className="ml-auto font-medium">{t('pages.dashboard.sold_plus', { count: quantity })}</div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('pages.dashboard.no_sales_data')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
