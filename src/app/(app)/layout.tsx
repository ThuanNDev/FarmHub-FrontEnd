
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
  Bell,
  Plus,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { StoreProvider, useStore } from '@/store/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockNotifications as initialNotifications } from '@/lib/data';
import { useLanguage } from '@/store/LanguageContext';
import { RelativeTime } from '@/components/RelativeTime';

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
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

function QuickActionsMenu() {
    const { t } = useLanguage();

    const Shortcut = ({ children }: { children: React.ReactNode }) => (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            {children}
        </kbd>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground z-50"
                    size="icon"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                align="end"
                className="w-56 mb-2"
            >
                <DropdownMenuLabel>Thao tác nhanh</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/pos">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>{t('nav.pos')}</span>
                        <Shortcut>Alt + N</Shortcut>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/customers?action=add">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Thêm khách hàng</span>
                        <Shortcut>Alt + C</Shortcut>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/purchases?action=add">
                        <PackagePlus className="mr-2 h-4 w-4" />
                        <span>Tạo đơn nhập hàng</span>
                        <Shortcut>Alt + P</Shortcut>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const { locale, setLocale, t } = useLanguage();

  const appCreator = mockUsers.find(u => u.isSuperadmin);
  
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [notifActiveTab, setNotifActiveTab] = React.useState('all');

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        // Ignore shortcuts if user is in an input field
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        if (event.altKey) {
            switch (event.key.toLowerCase()) {
                case 'n':
                    event.preventDefault();
                    router.push('/pos');
                    break;
                case 'c':
                    event.preventDefault();
                    router.push('/customers?action=add');
                    break;
                case 'p':
                    event.preventDefault();
                    router.push('/purchases?action=add');
                    break;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.notificationId === notificationId ? { ...n, isRead: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  const filteredNotifications = React.useMemo(() => {
    if (notifActiveTab === 'all') return notifications;
    return notifications.filter(n => n.type === notifActiveTab);
  }, [notifications, notifActiveTab]);


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
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
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
                  href="/dashboard"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-10 w-10">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Mở thông báo</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[400px] p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>
                      Đánh dấu tất cả đã đọc
                    </Button>
                  )}
                </div>
                <Separator className="my-2" />
                <Tabs defaultValue="all" onValueChange={setNotifActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="order">Đơn hàng</TabsTrigger>
                    <TabsTrigger value="inventory">Kho</TabsTrigger>
                    <TabsTrigger value="system">Hệ thống</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="h-80 mt-2">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <Link
                          href={notification.link || '#'}
                          key={notification.notificationId}
                          onClick={() => handleMarkAsRead(notification.notificationId)}
                          className="block"
                        >
                           <div className={cn(
                            'flex items-start gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-muted',
                            !notification.isRead && 'bg-primary/5'
                           )}>
                            {!notification.isRead && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                            <div className={cn('flex-1 space-y-1', notification.isRead && 'pl-5')}>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-muted-foreground">{notification.description}</p>
                              <p className="text-xs text-muted-foreground/80">
                                <RelativeTime date={notification.createdAt} />
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center p-8">
                        <p className="text-muted-foreground">Không có thông báo mới.</p>
                      </div>
                    )}
                  </ScrollArea>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border rounded-md h-10">
                <Button variant={locale === 'vi' ? 'secondary' : 'ghost'} size="sm" className="rounded-r-none border-r h-full px-3" onClick={() => setLocale('vi')}>VI</Button>
                <Button variant={locale === 'en' ? 'secondary' : 'ghost'} size="sm" className="rounded-l-none h-full px-3" onClick={() => setLocale('en')}>EN</Button>
            </div>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Link href="/pos">
                    <span className="text-lg">{t('nav.pos')}</span>
                </Link>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full ml-2">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png`} alt="@admin" />
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
        <QuickActionsMenu />
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
