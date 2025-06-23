
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Truck, Wrench, Package, Star, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProducts, mockStores } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import './landing-page.css';


const store = mockStores[0];

export default function LandingPage() {
  const featuredProducts = mockProducts.slice(0, 3);
  const getImageUrl = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || 'https://placehold.co/600x400.png';
    } catch (e) {
      return 'https://placehold.co/600x400.png';
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline sm:inline-block">{store.name}</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-2">
                <nav className="flex items-center">
                    <Button asChild variant="ghost">
                        <Link href="/login">Đăng nhập</Link>
                    </Button>
                     <Button asChild>
                        <Link href="/register">Bắt đầu ngay <MoveRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </nav>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-12 md:pt-24 lg:pt-32 border-b">
          <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-5xl mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="lg:leading-tighter text-4xl font-extrabold font-headline tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none text-primary">
                  Giải pháp toàn diện cho máy móc nông nghiệp
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Từ máy cưa, máy cắt cỏ đến phụ tùng thay thế. {store.name} là đối tác đáng tin cậy của nhà nông.
                </p>
                <div className="space-x-4">
                    <Button asChild size="lg">
                        <Link href="/login">Bắt đầu quản lý</Link>
                    </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Image
                    src="https://placehold.co/600x600.png"
                    width="600"
                    height="600"
                    alt="Hero"
                    className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
                    data-ai-hint="farming equipment"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">Vì Sao Chọn Chúng Tôi</div>
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Đối Tác Tin Cậy Của Nhà Nông</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
                        Chúng tôi cung cấp sản phẩm chính hãng, dịch vụ chuyên nghiệp và giải pháp tối ưu cho mọi nhu cầu nông nghiệp của bạn.
                    </p>
                </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    <div className="grid gap-1 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                            <Package className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Sản Phẩm Đa Dạng</h3>
                        <p className="text-muted-foreground">Cung cấp đầy đủ các loại máy móc và phụ tùng từ các thương hiệu hàng đầu.</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                            <Truck className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Giao Hàng Nhanh Chóng</h3>
                        <p className="text-muted-foreground">Hệ thống giao hàng linh hoạt, đảm bảo sản phẩm đến tay bạn nhanh nhất.</p>
                    </div>
                     <div className="grid gap-1 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                            <Wrench className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Bảo hành &amp; Sửa chữa</h3>
                        <p className="text-muted-foreground">Dịch vụ hậu mãi chuyên nghiệp, bảo hành chính hãng, sửa chữa tận tâm.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Featured Products Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Sản phẩm nổi bật</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
                  Khám phá các sản phẩm máy nông nghiệp và phụ tùng chất lượng cao của chúng tôi.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                    <div className="overflow-hidden">
                        <Image
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            width={400}
                            height={300}
                            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={product.hint}
                        />
                    </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <h3 className="text-lg font-bold font-headline truncate group-hover:text-primary">{product.name}</h3>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-semibold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
                        <Button variant="outline" size="sm">Xem chi tiết</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl/tight">
                Khách hàng của chúng tôi nói gì?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
                Những đánh giá chân thực từ những người nông dân đã tin dùng sản phẩm và dịch vụ của chúng tôi.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Card>
                <CardContent className="p-6">
                    <div className="flex mb-2">
                        <Star className="text-primary fill-primary" />
                        <Star className="text-primary fill-primary" />
                        <Star className="text-primary fill-primary" />
                        <Star className="text-primary fill-primary" />
                        <Star className="text-primary fill-primary" />
                    </div>
                  <blockquote className="text-lg font-semibold leading-snug">
                    “Từ ngày dùng máy móc của {store.name}, năng suất làm việc của tôi tăng hẳn. Sản phẩm chất lượng, dịch vụ thì tận tình. Rất đáng tin cậy!”
                  </blockquote>
                </CardContent>
              </Card>
              <div className="flex items-center justify-center gap-4 pt-4">
                  <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@ba-phi" />
                      <AvatarFallback>BP</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                      <p className="font-semibold">Anh Ba Phi</p>
                      <p className="text-sm text-muted-foreground">Khách hàng tại Đắk Lắk</p>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5 border-t">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 items-center">
                    <div className="flex flex-col justify-center space-y-4 text-center">
                        <div className="space-y-2">
                             <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Sẵn sàng tối ưu hóa quản lý?</h2>
                             <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                                Bắt đầu sử dụng hệ thống quản lý bán hàng mạnh mẽ của chúng tôi ngay hôm nay.
                             </p>
                        </div>
                        <div className="w-full max-w-sm space-x-2 mx-auto">
                             <Button asChild size="lg">
                                <Link href="/register">Đăng ký miễn phí</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-muted text-muted-foreground">
        <div className="container py-12 max-w-screen-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1 space-y-4">
                     <Link href="/" className="flex items-center space-x-2">
                        <Leaf className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-foreground">{store.name}</span>
                    </Link>
                    <p className="text-sm">Giải pháp nông nghiệp toàn diện cho nhà nông Việt.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-3 text-foreground">Sản phẩm</h4>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="#" className="hover:text-primary hover:underline">Máy nông nghiệp</Link>
                        <Link href="#" className="hover:text-primary hover:underline">Máy công trình</Link>
                        <Link href="#" className="hover:text-primary hover:underline">Phụ tùng</Link>
                    </nav>
                </div>
                <div>
                    <h4 className="font-semibold mb-3 text-foreground">Công ty</h4>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="#" className="hover:text-primary hover:underline">Về chúng tôi</Link>
                        <Link href="#" className="hover:text-primary hover:underline">Liên hệ</Link>
                        <Link href="#" className="hover:text-primary hover:underline">Chính sách</Link>
                    </nav>
                </div>
            </div>
             <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center text-xs">
                <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
                <div className="flex gap-4 mt-4 sm:mt-0">
                    <Link href="#" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 hover:text-primary"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></Link>
                    <Link href="#" aria-label="Youtube"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 hover:text-primary"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 7.5 4 12 4s9.5 2 9.5 3-9.5 4-9.5 4-9.5-2-9.5-3Z"></path><path d="M2.5 17V7c0-1 4-3 9.5-3s9.5 2 9.5 3v10c0 1-4 3-9.5 3s-9.5-2-9.5-3Z"></path></svg></Link>
                    <Link href="#" aria-label="Zalo"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 hover:text-primary"><path d="M12 2C6.5 2 2 6.5 2 12c0 2.2 0.7 4.2 2 6l-1.4 4.8c-0.2 0.8 0.6 1.4 1.4 1.2L8.8 22c1.8 0.8 3.8 1.2 5.2 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zM7.5 10.5c0-0.8 0.7-1.5 1.5-1.5h1c0.8 0 1.5 0.7 1.5 1.5v3c0 0.8-0.7 1.5-1.5 1.5h-1c-0.8 0-1.5-0.7-1.5-1.5v-3zM14.5 10.5c0-0.8 0.7-1.5 1.5-1.5h1c0.8 0 1.5 0.7 1.5 1.5v3c0 0.8-0.7 1.5-1.5 1.5h-1c-0.8 0-1.5-0.7-1.5-1.5v-3z"></path></svg></Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

    
