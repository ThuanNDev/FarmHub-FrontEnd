
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/store/LanguageContext';
import { useStore } from '@/store/StoreContext';
import { categorySchema } from '@/lib/form-schemas';
import type { Category } from '@/types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/services/api';

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { store } = useStore();

  const fetchCategories = useCallback(async () => {
    if (!store) return;
    setIsLoading(true);
    try {
      const data = await getCategories(store.storeId);
      setCategories(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: 'Không thể tải danh sách thể loại.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [store, toast, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentCategoryId: '',
      image: '',
      order: 0,
      isActive: true,
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
                parentCategoryId: selectedCategory.parentCategoryId || '',
                image: selectedCategory.image,
                order: selectedCategory.order,
                isActive: selectedCategory.isActive,
            });
        } else {
            form.reset({
                name: '',
                description: '',
                parentCategoryId: '',
                image: '',
                order: categories.length + 1,
                isActive: true,
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

  const confirmDelete = async () => {
    if (selectedCategory && store) {
        try {
            await deleteCategory(store.storeId, selectedCategory.categoryId);
            toast({ title: t('common.success'), description: t('pages.categories.success_delete') });
            fetchCategories();
        } catch (error) {
            toast({ variant: 'destructive', title: t('common.error'), description: (error as Error).message });
        }
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    if (!store) return;
    try {
        if (selectedCategory) {
          await updateCategory(store.storeId, selectedCategory.categoryId, values);
          toast({ title: t('common.success'), description: t('pages.categories.success_update') });
        } else {
          await addCategory(store.storeId, values);
          toast({ title: t('common.success'), description: t('pages.categories.success_add') });
        }
        fetchCategories();
        setAddEditDialogOpen(false);
        setSelectedCategory(null);
    } catch (error) {
        toast({ variant: 'destructive', title: t('common.error'), description: (error as Error).message });
    }
  };
  
  const getParentCategoryName = (parentId: string | null): string => {
    if (!parentId) return '—';
    const parent = categories.find(c => c.categoryId === parentId);
    return parent ? parent.name : t('pages.categories.parent_not_found');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">{t('pages.categories.title')}</CardTitle>
                <CardDescription>
                {t('pages.categories.description')}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t('pages.categories.search_placeholder')}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="sm" className="h-10 gap-1" onClick={handleAddNew}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {t('pages.categories.add_button')}
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
                    {t('pages.categories.table_image')}
                </TableHead>
                <TableHead>{t('pages.categories.table_name')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('pages.categories.table_description')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('pages.categories.table_parent')}</TableHead>
                <TableHead>{t('pages.categories.table_status')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.categoryId} onClick={() => router.push(`/categories/${category.slug}`)} className="cursor-pointer">
                  <TableCell className="hidden sm:table-cell">
                    <Image
                        alt={category.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={category.image || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="category icon"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={category.description}>
                    {category.description || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{getParentCategoryName(category.parentCategoryId)}</TableCell>
                  <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {t(category.isActive ? 'status.active' : 'status.inactive')}
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
                        <DropdownMenuItem onSelect={() => handleEdit(category)}>{t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(category)} className="text-destructive">{t('common.delete')}</DropdownMenuItem>
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
              {t('pages.categories.showing_results', { count: filteredCategories.length, total: categories.length })}
            </div>
        </CardFooter>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCategory ? t('pages.categories.edit_dialog_title') : t('pages.categories.add_dialog_title')}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? t('pages.categories.edit_dialog_description') : t('pages.categories.add_dialog_description')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.categories.form_name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pages.categories.form_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pages.categories.form_parent')}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === '_ROOT_' ? '' : value)}
                      value={field.value || '_ROOT_'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('pages.categories.form_parent_placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_ROOT_">{t('pages.categories.form_parent_root')}</SelectItem>
                        {categories
                          .filter(c => c.categoryId !== selectedCategory?.categoryId)
                          .map(category => (
                            <SelectItem key={category.categoryId} value={category.categoryId}>
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
                    <FormLabel>{t('pages.categories.form_description')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('pages.categories.form_description_placeholder')} {...field} />
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
                    <FormLabel>{t('pages.categories.form_image_url')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pages.categories.form_image_url_placeholder')} {...field} />
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
                    <FormLabel>{t('pages.categories.form_order')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('pages.categories.form_order_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-4">
                    <div className="space-y-0.5">
                        <FormLabel>{t('pages.categories.form_status')}</FormLabel>
                        <p className="text-sm text-muted-foreground">{t('pages.categories.form_status_description')}</p>
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
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.categories.delete_dialog_title')}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t('pages.categories.delete_dialog_description', { name: `<strong>"${selectedCategory?.name}"</strong>` })}}/>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
