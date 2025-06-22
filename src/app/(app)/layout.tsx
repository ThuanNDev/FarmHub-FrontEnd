'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  Menu,
  Leaf,
  Settings,
  DollarSign,
  Tags,
  CreditCard,
  BarChart3,
  UsersRound,
  Truck,
  PackagePlus,
  LogOut,
  Landmark,
  Warehouse,
  Undo2,
  HelpCircle,
  Mail,
  Phone,
  Printer,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoreProvider, useStore } from '@/contexts/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { href: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/orders', labelKey: 'nav.orders', icon: ShoppingCart },
  { href: '/returns', labelKey: 'nav.returns', icon: Undo2 },
  { href: '/products', labelKey: 'nav.products', icon: Package },
  { href: '/customers', labelKey: 'nav.customers', icon: Users },
  { href: '/suppliers', labelKey: 'nav.suppliers', icon: Truck },
  { href: '/purchases', labelKey: 'nav.purchases', icon: PackagePlus },
  { href: '/stock-adjustments', labelKey: 'nav.stock_adjustments', icon: Warehouse },
  { href: '/categories', labelKey: 'nav.categories', icon: Tags },
  { href: '/debts', labelKey: 'nav.debts', icon: CreditCard },
  { href: '/installments', labelKey: 'nav.installments', icon: Landmark },
  { href: '/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { href: '/printing', labelKey: 'nav.printing', icon: Printer },
  { href: '/users', labelKey: 'nav.users', icon: UsersRound },
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
];

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}


function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { locale, setLocale, t } = useLanguage();

  const appCreator = mockUsers.find(u => u.is_superadmin);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    toast({
      title: t('login.success'),
      description: "Bạn đã đăng xuất thành công.",
    });
    router.push('/login');
  };

  if (pathname === '/pos') {
    return <>{children}</>;
  }
  
  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">{store.name}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} />
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col overflow-y-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu điều hướng</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Leaf className="h-6 w-6 text-primary" />
                  <span className="font-headline text-xl">{store.name}</span>
                </Link>
                {navItems.map((item) => (
                   <NavLink key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             {/* Can add a global search here if needed */}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md h-10">
                <Button variant={locale === 'vi' ? 'secondary' : 'ghost'} size="sm" className="rounded-r-none border-r h-full px-3" onClick={() => setLocale('vi')}>VI</Button>
                <Button variant={locale === 'en' ? 'secondary' : 'ghost'} size="sm" className="rounded-l-none h-full px-3" onClick={() => setLocale('en')}>EN</Button>
            </div>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 font-semibold h-10">
                <Link href="/pos">
                    <DollarSign className="h-5 w-5" />
                    <span>{t('nav.pos')}</span>
                </Link>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full ml-2">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/id/237/40/40`} alt="@admin" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span className="sr-only">Mở menu người dùng</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Hỗ trợ</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thông tin hỗ trợ</AlertDialogTitle>
                    <AlertDialogDescription>
                      Nếu bạn cần trợ giúp hoặc có thắc mắc về ứng dụng, vui lòng liên hệ với người tạo qua các thông tin dưới đây.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a href={`mailto:${appCreator?.email}`} className="text-primary hover:underline">
                        {appCreator?.email || 'Không có'}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a href={`tel:${appCreator?.phone}`} className="text-primary hover:underline">
                        {appCreator?.phone || 'Không có'}
                      </a>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction>{t('common.close')}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có muốn đăng xuất không?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này sẽ kết thúc phiên làm việc hiện tại và đưa bạn về trang đăng nhập.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                      Đăng xuất
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
      <StoreProvider>
        <LayoutContent>{children}</LayoutContent>
      </StoreProvider>
    );
}
