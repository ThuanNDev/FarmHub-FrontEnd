'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlusCircle,
  MoreHorizontal,
} from 'lucide-react';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { mockCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type Category = typeof mockCategories[0];

const categorySchema = z.object({
  name: z.string().min(1, { message: "Tên thể loại không được để trống." }),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isAddEditDialogOpen) {
        if (selectedCategory) {
            form.reset({
                name: selectedCategory.name,
                description: selectedCategory.description,
            });
        } else {
            form.reset({
                name: '',
                description: '',
            });
        }
    }
  }, [isAddEditDialogOpen, selectedCategory, form]);

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
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      toast({ title: "Thành công", description: "Thể loại đã được xóa." });
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const onSubmit = (values: CategoryFormValues) => {
    if (selectedCategory) {
      const updatedCategories = categories.map(c => 
        c.id === selectedCategory.id ? { ...c, ...values } : c
      );
      setCategories(updatedCategories);
      toast({ title: "Thành công", description: "Thể loại đã được cập nhật." });
    } else {
      const newCategory: Category = {
        ...values,
        id: `cate-${Math.floor(1000 + Math.random() * 9000)}`,
        description: values.description || ''
      };
      setCategories([newCategory, ...categories]);
      toast({ title: "Thành công", description: "Thể loại mới đã được thêm." });
    }
    setAddEditDialogOpen(false);
    setSelectedCategory(null);
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
            <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Thêm thể loại
                </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{category.description}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>Sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category)} className="text-destructive">Xóa</DropdownMenuItem>
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
            Hiển thị <strong>{categories.length}</strong> thể loại
            </div>
        </CardFooter>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedCategory ? 'Sửa thể loại' : 'Thêm thể loại mới'}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? 'Cập nhật thông tin cho thể loại này.' : 'Điền thông tin để thêm một thể loại mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Tên</FormLabel>
                    <div className="col-span-3">
                      <FormControl>
                        <Input placeholder="Ví dụ: Máy làm đất" {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Mô tả</FormLabel>
                     <div className="col-span-3">
                      <FormControl>
                        <Textarea placeholder="Mô tả ngắn về thể loại..." {...field} />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
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
