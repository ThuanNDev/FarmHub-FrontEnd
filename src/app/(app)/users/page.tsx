
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlusCircle,
  MoreHorizontal,
  Mail, 
  Phone, 
  Shield
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
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type User = typeof mockUsers[0];

const passwordSchema = z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." });

const userSchema = z.object({
  full_name: z.string().min(1, { message: "Họ tên không được để trống." }),
  username: z.string().min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  phone: z.string().optional(),
  role: z.enum(['Admin', 'Staff']),
  is_active: z.boolean().default(true),
  password: passwordSchema.optional(),
  confirmPassword: passwordSchema.optional(),
}).refine(data => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Mật khẩu không khớp.",
    path: ["confirmPassword"],
});


type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // For demonstration: Mock the currently logged-in user.
  // In a real app, this would come from an authentication context.
  const currentUser = mockUsers[0]; // 'Admin' user

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      phone: '',
      role: 'Staff',
      is_active: true,
      password: '',
      confirmPassword: ''
    },
  });

  useEffect(() => {
    if (isAddEditDialogOpen) {
      if (selectedUser) {
        form.reset({
          full_name: selectedUser.full_name,
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          is_active: selectedUser.is_active,
          password: '',
          confirmPassword: '',
        });
        form.getFieldState('password').isDirty = false;
      } else {
        form.reset({
            full_name: '',
            username: '',
            email: '',
            phone: '',
            role: 'Staff',
            is_active: true,
            password: '',
            confirmPassword: '',
        });
      }
    }
  }, [isAddEditDialogOpen, selectedUser, form]);

  const handleAddNew = () => {
    setSelectedUser(null);
    setAddEditDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setAddEditDialogOpen(true);
  };
  
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast({ title: "Thành công", description: "Người dùng đã được xóa." });
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const onSubmit = (values: UserFormValues) => {
    if (!selectedUser && !values.password) {
        form.setError("password", { type: "manual", message: "Mật khẩu là bắt buộc khi tạo người dùng mới." });
        return;
    }
    const now = new Date().toISOString();
    if (selectedUser) {
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { 
            ...u, 
            ...values, 
            password_hash: values.password ? `hashed_${values.password}` : u.password_hash,
            updated_at: now 
        } : u
      );
      setUsers(updatedUsers);
      toast({ title: "Thành công", description: "Người dùng đã được cập nhật." });
    } else {
      const newUser: User = {
        id: `user-${Math.floor(1000 + Math.random() * 9000)}`,
        username: values.username,
        password_hash: `hashed_${values.password}`,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || '',
        role: values.role,
        associated_store_ids: ['store-001'],
        is_active: values.is_active,
        is_superadmin: values.role === 'Admin',
        last_login_at: null,
        created_at: now,
        updated_at: now,
        password_reset_token: null,
        token_expiry_at: null,
      };
      setUsers([newUser, ...users]);
      toast({ title: "Thành công", description: "Người dùng mới đã được thêm." });
    }
    setAddEditDialogOpen(false);
    setSelectedUser(null);
  };

  // --- Role-based View ---
  if (currentUser.role !== 'Admin') {
    const user = mockUsers.find(u => u.id === currentUser.id);

    if (!user) {
      return (
        <Card>
          <CardHeader><CardTitle>Lỗi</CardTitle></CardHeader>
          <CardContent><p>Không tìm thấy thông tin người dùng.</p></CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.full_name} />
              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="pt-2">
              <CardTitle className="font-headline text-2xl">{user.full_name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Thông tin liên hệ</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Thông tin tài khoản</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Vai trò: {user.role}</span>
                </div>
                 <div className="flex items-center gap-3">
                   <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Đổi mật khẩu</Button>
        </CardFooter>
      </Card>
    );
  }

  // --- Admin View ---
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Nhân viên</CardTitle>
                <CardDescription>
                Quản lý nhân viên và quyền hạn của họ.
                </CardDescription>
            </div>
            <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Thêm nhân viên
                </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>
                  <span className="sr-only">Hành động</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} onClick={() => router.push(`/users/${user.id}`)} className="cursor-pointer">
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </TableCell>
                  <TableCell>
                    <div>{user.email}</div>
                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
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
                        <DropdownMenuItem onSelect={() => handleEdit(user)}>Sửa</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(user)} className="text-destructive">Xóa</DropdownMenuItem>
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
            Hiển thị <strong>{users.length}</strong> người dùng
            </div>
        </CardFooter>
      </Card>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{selectedUser ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho người dùng.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl><Input placeholder="nguyenvana" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="a@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl><Input placeholder="0901234567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormDescription>{selectedUser ? "Để trống nếu không muốn thay đổi." : ""}</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Admin">Quản trị viên (Admin)</SelectItem>
                              <SelectItem value="Staff">Nhân viên (Staff)</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                       <div className="space-y-0.5">
                        <FormLabel>Trạng thái</FormLabel>
                        <FormDescription>
                          Cho phép người dùng này đăng nhập vào hệ thống.
                        </FormDescription>
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
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn người dùng
               <strong> "{selectedUser?.full_name}"</strong>.
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
