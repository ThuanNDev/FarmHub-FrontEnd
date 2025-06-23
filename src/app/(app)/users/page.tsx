
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PlusCircle,
  MoreHorizontal,
  Mail, 
  Phone, 
  Shield,
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
import { useLanguage } from '@/store/LanguageContext';
import { userSchema, changePasswordSchema } from '@/lib/form-schemas';

type User = typeof mockUsers[0];
type UserFormValues = z.infer<typeof userSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const currentUser = mockUsers[0];

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      role: 'Staff',
      isActive: true,
      password: '',
      confirmPassword: ''
    },
  });

  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  useEffect(() => {
    if (isAddEditDialogOpen) {
      if (selectedUser) {
        form.reset({
          fullName: selectedUser.fullName,
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          isActive: selectedUser.isActive,
          password: '',
          confirmPassword: '',
        });
        form.getFieldState('password').isDirty = false;
      } else {
        form.reset({
            fullName: '',
            username: '',
            email: '',
            phone: '',
            role: 'Staff',
            isActive: true,
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
      setUsers(users.filter(u => u.userId !== selectedUser.userId));
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
        u.userId === selectedUser.userId ? { 
            ...u, 
            ...values, 
            passwordHash: values.password ? `hashed_${values.password}` : u.passwordHash,
            updatedAt: now 
        } : u
      );
      setUsers(updatedUsers);
      toast({ title: "Thành công", description: "Người dùng đã được cập nhật." });
    } else {
      const newUser: User = {
        userId: `user-${Math.floor(1000 + Math.random() * 9000)}`,
        username: values.username,
        passwordHash: `hashed_${values.password}`,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || '',
        role: values.role,
        associatedStoreIds: ['store-001'],
        isActive: true,
        isSuperadmin: values.role === 'Admin',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordResetToken: null,
        tokenExpiryAt: null,
      };
      setUsers([newUser, ...users]);
      toast({ title: "Thành công", description: "Người dùng mới đã được thêm." });
    }
    setAddEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleChangePassword = (values: ChangePasswordFormValues) => {
    // In a real app, you'd verify the current password on the backend.
    const userInDb = mockUsers.find(u => u.userId === currentUser.userId);
    if (userInDb) {
        userInDb.passwordHash = `hashed_${values.newPassword}`;
        userInDb.updatedAt = new Date().toISOString();
        toast({ title: "Thành công", description: "Mật khẩu đã được thay đổi." });
        setChangePasswordOpen(false);
        changePasswordForm.reset();
    } else {
        toast({ variant: 'destructive', title: "Lỗi", description: "Không tìm thấy người dùng." });
    }
  }

  // --- Role-based View ---
  if (currentUser.role !== 'Admin') {
    const user = mockUsers.find(u => u.userId === currentUser.userId);

    if (!user) {
      return (
        <Card>
          <CardHeader><CardTitle>Lỗi</CardTitle></CardHeader>
          <CardContent><p>Không tìm thấy thông tin người dùng.</p></CardContent>
        </Card>
      );
    }

    return (
      <>
        <Card>
            <CardHeader>
            <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border">
                <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="pt-2">
                <CardTitle className="font-headline text-2xl">{user.fullName}</CardTitle>
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
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {t(user.isActive ? 'status.active' : 'status.inactive')}
                        </Badge>
                    </div>
                </div>
                </div>
            </div>
            </CardContent>
            <CardFooter>
            <Button onClick={() => setChangePasswordOpen(true)}>Đổi mật khẩu</Button>
            </CardFooter>
        </Card>
        
        <Dialog open={isChangePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
                    </DialogDescription>
                </DialogHeader>
                <Form {...changePasswordForm}>
                    <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                        <FormField
                            control={changePasswordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu hiện tại</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={changePasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={changePasswordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Xác nhận</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </>
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm nhân viên..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-10 gap-1 bg-accent hover:bg-accent/90" onClick={handleAddNew}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Thêm nhân viên
                  </span>
              </Button>
            </div>
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
              {filteredUsers.map((user) => (
                <TableRow key={user.userId} onClick={() => router.push(`/users/${user.userId}`)} className="cursor-pointer">
                  <TableCell>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </TableCell>
                  <TableCell>
                    <div>{user.email}</div>
                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {t(user.isActive ? 'status.active' : 'status.inactive')}
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
            Hiển thị <strong>{filteredUsers.length}</strong> trên <strong>{users.length}</strong> người dùng
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
                  name="fullName"
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
                  name="isActive"
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
               <strong> "{selectedUser?.fullName}"</strong>.
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
