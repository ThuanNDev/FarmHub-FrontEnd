
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlusCircle,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { mockCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type Category = typeof mockCategories[0];

const categorySchema = z.object({
  name: z.string().min(1, { message: "Tên thể loại không được để trống." }),
  description: z.string().optional(),
  ParentCategoryId: z.string().optional(), // Will treat special value as null in submission
  image: z.string().url({ message: "Vui lòng nhập URL hình ảnh hợp lệ." }).or(z.literal('')).optional(),
  order: z.coerce.number().int().optional(),
  is_active: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories.filter(c => !c.is_deleted));
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      ParentCategoryId: '',
      image: '',
      order: 0,
      is_active: true,
    },
  });

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

  useEffect(() => {
    if (isAddEditDialogOpen) {
        if (selectedCategory) {
            form.reset({
                name: selectedCategory.name,
                description: selectedCategory.description,
                ParentCategoryId: selectedCategory.ParentCategoryId || '',
                image: selectedCategory.image,
                order: selectedCategory.order,
                is_active: selectedCategory.is_active,
            });
        } else {
            form.reset({
                name: '',
                description: '',
                ParentCategoryId: '',
                image: '',
                order: categories.length + 1,
                is_active: true,
            });
        }
    }
  }, [isAddEditDialogOpen, selectedCategory, form, categories]);

  const handleAddNew = () => {
    setSelectedCategory(null);
    setAddEditDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setAddEditDialogOpen(true);
  };
  
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      setCategories(categories.map(c => c.CategoryId === selectedCategory.CategoryId ? { ...c, is_deleted: true } : c).filter(c => !c.is_deleted));
      toast({ title: "Thành công", description: "Thể loại đã được xóa." });
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const onSubmit = (values: CategoryFormValues) => {
    const slug = slugify(values.name);
    if (selectedCategory) {
      const updatedCategories = categories.map(c => 
        c.CategoryId === selectedCategory.CategoryId ? { 
            ...c, 
            ...values,
            slug,
            ParentCategoryId: values.ParentCategoryId || null,
            image: values.image || 'https://picsum.photos/100/100',
            order: values.order ?? c.order,
            description: values.description || '',
            updated_at: new Date().toISOString(),
        } : c
      );
      setCategories(updatedCategories);
      toast({ title: "Thành công", description: "Thể loại đã được cập nhật." });
    } else {
      const newCategory: Category = {
        CategoryId: `cate-${Math.floor(1000 + Math.random() * 9000)}`,
        name: values.name,
        slug,
        description: values.description || '',
        ParentCategoryId: values.ParentCategoryId || null,
        image: values.image || 'https://picsum.photos/100/100',
        order: values.order ?? categories.length + 1,
        is_active: values.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      };
      setCategories([newCategory, ...categories]);
      toast({ title: "Thành công", description: "Thể loại mới đã được thêm." });
    }
    setAddEditDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const getParentCategoryName = (parentId: string | null): string => {
    if (!parentId) return '—';
    const parent = categories.find(c => c.CategoryId === parentId);
    return parent ? parent.name : 'Không tìm thấy';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Thể loại</CardTitle>
                <CardDescription>
                Quản lý các thể loại sản phẩm của bạn.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm thể loại..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Thêm thể loại
                    </span>
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[64px] sm:table-cell">
                    Ảnh
                </TableHead>
                <TableHead>Tên</TableHead>
                <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                <TableHead className="hidden lg:table-cell">Danh mục cha</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.CategoryId} onClick={() => router.push(`/categories/${category.slug}`)} className="cursor-pointer">
                  <TableCell className="hidden sm:table-cell">
                    <Image
                        alt={category.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={category.image || 'https://picsum.photos/64/64'}
                        width="64"
                        data-ai-hint="category icon"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={category.description}>
                    {category.description || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{getParentCategoryName(category.ParentCategoryId)}</TableCell>
                  <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {t(category.is_active ? 'status.active' : 'status.inactive')}
                      </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(category)}>Sửa</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(category)} className="text-destructive">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <div className="text-xs text-muted-foreground">
              Hiển thị <strong>{filteredCategories.length}</strong> trên <strong>{categories.length}</strong> thể loại
            </div>
        </CardFooter>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCategory ? 'Sửa thể loại' : 'Thêm thể loại mới'}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? 'Cập nhật thông tin cho thể loại này.' : 'Điền thông tin để thêm một thể loại mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thể loại</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Máy làm đất" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ParentCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục cha</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '_ROOT_' ? '' : value)}
                      value={field.value || '_ROOT_'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Không có (danh mục gốc)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_ROOT_">Không có (danh mục gốc)</SelectItem>
                        {categories
                          .filter(c => c.CategoryId !== selectedCategory?.CategoryId)
                          .map(category => (
                            <SelectItem key={category.CategoryId} value={category.CategoryId}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả ngắn về thể loại..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Hình ảnh</FormLabel>
                    <FormControl>
                      <Input placeholder="https://picsum.photos/100/100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                    <div className="space-y-0.5">
                        <FormLabel>Trạng thái</FormLabel>
                        <p className="text-sm text-muted-foreground">Hiển thị thể loại này trong hệ thống.</p>
                      </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn thể loại
               <strong> "{selectedCategory?.name}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
