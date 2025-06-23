'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Sparkles, Loader2, CheckCircle, ShoppingCart, Presentation } from 'lucide-react';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateProductLandingPage, type GenerateProductLandingPageOutput } from '@/ai/flows/generate-product-landing-page';

const showcaseSchema = z.object({
  productName: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự."),
  targetAudience: z.string().min(3, "Vui lòng mô tả đối tượng khách hàng."),
  keyFeatures: z.string().min(10, "Vui lòng nhập ít nhất một vài tính năng chính, cách nhau bởi dấu phẩy."),
  tone: z.enum(['professional', 'friendly', 'technical']),
});

type ShowcaseFormValues = z.infer<typeof showcaseSchema>;

export default function ProductShowcasePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateProductLandingPageOutput | null>(null);

  const form = useForm<ShowcaseFormValues>({
    resolver: zodResolver(showcaseSchema),
    defaultValues: {
      productName: 'Máy cưa xích STIHL MS-382',
      targetAudience: 'Thợ cưa chuyên nghiệp, chủ trang trại lớn',
      keyFeatures: 'Công suất lớn, Bền bỉ, Chống rung tốt, Dễ bảo trì',
      tone: 'professional',
    },
  });

  const onSubmit = async (values: ShowcaseFormValues) => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateProductLandingPage({
        ...values,
        keyFeatures: values.keyFeatures.split(',').map(f => f.trim()),
      });
      setGeneratedContent(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tạo trang giới thiệu. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Presentation className="h-6 w-6" />
            Trình diễn sản phẩm bằng AI
          </CardTitle>
          <CardDescription>
            Nhập thông tin sản phẩm và để AI tạo ra một trang giới thiệu hấp dẫn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="productName">Tên sản phẩm</Label>
              <Input id="productName" {...form.register('productName')} />
              {form.formState.errors.productName && <p className="text-sm text-destructive mt-1">{form.formState.errors.productName.message}</p>}
            </div>
            <div>
              <Label htmlFor="targetAudience">Đối tượng khách hàng</Label>
              <Input id="targetAudience" {...form.register('targetAudience')} />
              {form.formState.errors.targetAudience && <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAudience.message}</p>}
            </div>
            <div>
              <Label htmlFor="keyFeatures">Các tính năng chính (cách nhau bởi dấu phẩy)</Label>
              <Textarea id="keyFeatures" {...form.register('keyFeatures')} />
              {form.formState.errors.keyFeatures && <p className="text-sm text-destructive mt-1">{form.formState.errors.keyFeatures.message}</p>}
            </div>
            <div>
              <Label htmlFor="tone">Văn phong</Label>
               <Select onValueChange={(value) => form.setValue('tone', value as 'professional' | 'friendly' | 'technical')} defaultValue={form.getValues('tone')}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Chọn văn phong" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                  <SelectItem value="friendly">Thân thiện</SelectItem>
                  <SelectItem value="technical">Kỹ thuật</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Đang sáng tạo...' : 'Tạo trang giới thiệu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="sticky top-6">
        <Card className="min-h-[70vh]">
          <CardHeader>
            <CardTitle>Bản xem trước</CardTitle>
            <CardDescription>Đây là trang giới thiệu sản phẩm do AI tạo ra.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <ShowcaseSkeleton />}
            {!isLoading && !generatedContent && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
                <BrainCircuit className="h-12 w-12 mb-4" />
                <p>Nội dung sẽ được hiển thị ở đây</p>
              </div>
            )}
            {generatedContent && <ShowcasePreview content={generatedContent} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const ShowcaseSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-5 w-5/6" />
    <div className="space-y-4 pt-4">
        <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    </div>
  </div>
);

const ShowcasePreview = ({ content }: { content: GenerateProductLandingPageOutput }) => (
    <div className="space-y-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image 
                src={`https://placehold.co/600x400.png`} 
                alt={content.headline}
                layout="fill"
                objectFit="cover"
                data-ai-hint={content.imagePrompt}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-4xl font-extrabold text-white font-headline">{content.headline}</h1>
                <p className="text-xl text-white/90 mt-2">{content.subheadline}</p>
             </div>
        </div>

        <p className="text-base text-foreground/80">{content.introduction}</p>

        <Separator />

        <div>
            <h3 className="text-2xl font-bold font-headline mb-4">Tính năng nổi bật</h3>
            <div className="space-y-4">
                {content.featuresSection.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <CheckCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <Separator />

        <div className="text-center p-6 bg-muted rounded-lg">
            <Button size="lg">
                <ShoppingCart className="mr-2 h-5 w-5"/>
                {content.callToAction}
            </Button>
        </div>
    </div>
);
