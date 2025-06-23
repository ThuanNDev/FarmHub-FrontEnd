import './landing-page.css';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Truck, Wrench, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProducts, mockStores } from '@/lib/data';

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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="ml-2 font-headline text-xl font-semibold">{store.name}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Giải pháp toàn diện cho máy móc nông nghiệp
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Từ máy cưa, máy cắt cỏ đến phụ tùng thay thế. {store.name} là đối tác đáng tin cậy của nhà nông.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Bắt đầu quản lý</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint="farming equipment"
              />
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Sản phẩm nổi bật</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Khám phá các sản phẩm máy nông nghiệp và phụ tùng chất lượng cao của chúng tôi.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
              {featuredProducts.map((product) => (
                <div key={product.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <Image
                    src={getImageUrl(product.images)}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="aspect-[4/3] w-full object-cover"
                    data-ai-hint={product.hint}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold font-headline">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <p className="mt-2 text-lg font-semibold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Vì Sao Chọn Chúng Tôi</div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Đối Tác Tin Cậy Của Nhà Nông</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Chúng tôi cung cấp sản phẩm chính hãng, dịch vụ chuyên nghiệp và giải pháp tối ưu cho mọi nhu cầu nông nghiệp của bạn.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                      <Package className="h-8 w-8 text-primary mt-1" />
                      <div>
                          <h3 className="text-lg font-bold">Sản Phẩm Đa Dạng</h3>
                          <p className="text-muted-foreground">Cung cấp đầy đủ các loại máy móc và phụ tùng từ các thương hiệu hàng đầu.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <Truck className="h-8 w-8 text-primary mt-1" />
                      <div>
                          <h3 className="text-lg font-bold">Giao Hàng Nhanh Chóng</h3>
                          <p className="text-muted-foreground">Hệ thống giao hàng linh hoạt, đảm bảo sản phẩm đến tay bạn nhanh nhất.</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <Wrench className="h-8 w-8 text-primary mt-1" />
                      <div>
                          <h3 className="text-lg font-bold">Bảo hành & Sửa chữa</h3>
                          <p className="text-muted-foreground">Dịch vụ hậu mãi chuyên nghiệp, bảo hành chính hãng, sửa chữa tận tâm.</p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Điều khoản dịch vụ
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Chính sách bảo mật
          </Link>
        </nav>
      </footer>
    </div>
  );
}
