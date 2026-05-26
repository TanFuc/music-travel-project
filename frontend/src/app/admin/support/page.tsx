'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  MessageSquare,
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Reply,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  getAllFAQs,
  getFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAllComplaints,
  getComplaintStats,
  replyToComplaint,
  type SupportQuestion,
  type Complaint,
  type CreateQuestionDto,
  type UpdateQuestionDto,
} from '@/services/support.service';
const getComplaintStatusBadge = (status: string) => {
  switch (status) {
    case 'NEW':
      return <Badge className="bg-red-100 text-red-800">Mới</Badge>;
    case 'PROCESSING':
      return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>;
    case 'RESOLVED':
      return <Badge className="bg-green-100 text-green-800">Đã giải quyết</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [faqPage] = useState(1);
  const [complaintPage, setComplaintPage] = useState(1);
  const [complaintFilter, setComplaintFilter] = useState<'NEW' | 'PROCESSING' | 'RESOLVED' | ''>(
    ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<SupportQuestion | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const queryClient = useQueryClient();
  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ['admin', 'faqs', faqPage],
    queryFn: () => getAllFAQs({ page: faqPage, limit: 20 }),
  });
  const { data: categories } = useQuery({
    queryKey: ['admin', 'faq-categories'],
    queryFn: getFAQCategories,
  });
  const { data: complaintsData, isLoading: complaintsLoading } = useQuery({
    queryKey: ['admin', 'complaints', complaintPage, complaintFilter, searchQuery],
    queryFn: () =>
      getAllComplaints({
        page: complaintPage,
        limit: 20,
        status: complaintFilter || undefined,
        search: searchQuery || undefined,
      }),
  });
  const { data: stats } = useQuery({
    queryKey: ['admin', 'complaint-stats'],
    queryFn: getComplaintStats,
  });
  const createFaqMutation = useMutation({
    mutationFn: createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      setFaqModalOpen(false);
      toast.success('Tạo câu hỏi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });
  const updateFaqMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateQuestionDto }) => updateFAQ(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      setFaqModalOpen(false);
      setEditingFaq(null);
      toast.success('Cập nhật câu hỏi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });
  const deleteFaqMutation = useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      toast.success('Xóa câu hỏi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });
  const replyMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: {
        adminReply: string;
        status?: any;
      };
    }) => replyToComplaint(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'complaint-stats'] });
      setReplyModalOpen(false);
      setSelectedComplaint(null);
      toast.success('Phản hồi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });
  const handleFaqSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateQuestionDto = {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      category: formData.get('category') as string,
      displayOrder: Number(formData.get('displayOrder')) || 0,
      isActive: formData.get('isActive') === 'true',
    };
    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, dto });
    } else {
      createFaqMutation.mutate(dto);
    }
  };
  const handleReply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const formData = new FormData(e.currentTarget);
    replyMutation.mutate({
      id: selectedComplaint.id,
      dto: {
        adminReply: formData.get('adminReply') as string,
        status: (formData.get('status') as any) || 'RESOLVED',
      },
    });
  };
  const openEditFaq = (faq: SupportQuestion) => {
    setEditingFaq(faq);
    setFaqModalOpen(true);
  };
  const openReply = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyModalOpen(true);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hỗ trợ & Khiếu nại</h1>
        <p className="text-muted-foreground">Quản lý FAQ và xử lý khiếu nại khách hàng</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng khiếu nại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.new || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Đang xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.processing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Đã giải quyết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Khiếu nại
            {stats?.new && stats.new > 0 && <Badge className="ml-2 bg-red-500">{stats.new}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Câu hỏi thường gặp</CardTitle>
                <CardDescription>Quản lý các câu hỏi và trả lời</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingFaq(null);
                  setFaqModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Câu hỏi</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-center">Thứ tự</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : faqsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        Chưa có câu hỏi nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    faqsData?.data?.map((faq: SupportQuestion) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">{faq.question}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{faq.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{faq.displayOrder}</TableCell>
                        <TableCell>
                          {faq.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Hiển thị</Badge>
                          ) : (
                            <Badge variant="outline">Ẩn</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditFaq(faq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteFaqMutation.mutate(faq.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <CardTitle>Danh sách khiếu nại</CardTitle>
                  <CardDescription>Xử lý các phản hồi từ khách hàng</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm..."
                      className="w-[200px] pl-9"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setComplaintPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={complaintFilter}
                    onValueChange={(v) => {
                      setComplaintFilter(v as any);
                      setComplaintPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="NEW">Mới</SelectItem>
                      <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                      <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="w-[300px]">Nội dung</TableHead>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaintsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : complaintsData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Không có khiếu nại
                      </TableCell>
                    </TableRow>
                  ) : (
                    complaintsData?.data?.map((complaint: Complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(complaint.createdAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell>
                          {complaint.user?.fullName ||
                            complaint.guestName ||
                            complaint.guestEmail ||
                            'Khách'}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {complaint.content}
                        </TableCell>
                        <TableCell>{complaint.orderId ? `#${complaint.orderId}` : '-'}</TableCell>
                        <TableCell>{getComplaintStatusBadge(complaint.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openReply(complaint)}>
                            <Reply className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {complaintsData?.meta && complaintsData.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Trang {complaintPage} / {complaintsData.meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setComplaintPage((p) => Math.max(1, p - 1))}
                      disabled={complaintPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setComplaintPage((p) => Math.min(complaintsData.meta.totalPages, p + 1))
                      }
                      disabled={complaintPage === complaintsData.meta.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFaqSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="question">Câu hỏi</Label>
                <Input id="question" name="question" defaultValue={editingFaq?.question} required />
              </div>
              <div>
                <Label htmlFor="answer">Trả lời</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  rows={4}
                  defaultValue={editingFaq?.answer}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingFaq?.category}
                  placeholder="VD: Thanh toán, Vé, Đặt chỗ"
                  required
                  list="categories"
                />
                <datalist id="categories">
                  {categories?.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    defaultValue={editingFaq?.displayOrder || 0}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="isActive"
                    value={editingFaq?.isActive !== false ? 'true' : 'false'}
                  />
                  <Label htmlFor="isActiveSwitch">Hiển thị</Label>
                  <Switch
                    id="isActiveSwitch"
                    defaultChecked={editingFaq?.isActive !== false}
                    onCheckedChange={(checked) => {
                      const input = document.querySelector(
                        'input[name="isActive"]'
                      ) as HTMLInputElement;
                      if (input) input.value = checked ? 'true' : 'false';
                    }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
              >
                {createFaqMutation.isPending || updateFaqMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phản hồi khiếu nại</DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedComplaint.user?.fullName || selectedComplaint.guestName || 'Khách'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedComplaint.user?.phoneNumber ||
                        selectedComplaint.guestPhone ||
                        selectedComplaint.guestEmail}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedComplaint.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: vi,
                    })}
                  </p>
                </div>
                <p className="whitespace-pre-wrap">{selectedComplaint.content}</p>
                {selectedComplaint.orderId && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Mã đơn: #{selectedComplaint.orderId}
                  </p>
                )}
              </div>

              {selectedComplaint.adminReply && (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Phản hồi trước:</p>
                  <p className="whitespace-pre-wrap">{selectedComplaint.adminReply}</p>
                </div>
              )}

              <form onSubmit={handleReply}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminReply">Nội dung phản hồi</Label>
                    <Textarea
                      id="adminReply"
                      name="adminReply"
                      rows={4}
                      required
                      placeholder="Nhập nội dung phản hồi..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Cập nhật trạng thái</Label>
                    <Select name="status" defaultValue="RESOLVED">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                        <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={replyMutation.isPending}>
                    {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
