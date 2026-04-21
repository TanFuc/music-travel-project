'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  X,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  LifeBuoy,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  getPublicFAQs,
  submitComplaint,
  type SupportQuestion,
  type CreateComplaintDto,
} from '@/services/support.service';
import { useAuthStore } from '@/stores/auth.store';
export default function SmartSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuthStore();
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: getPublicFAQs,
    enabled: isOpen,
  });
  const submitMutation = useMutation({
    mutationFn: submitComplaint,
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Gửi phản hồi thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateComplaintDto = {
      content: formData.get('content') as string,
      guestName: user?.fullName || (formData.get('guestName') as string),
      guestEmail: user?.email || (formData.get('guestEmail') as string),
      guestPhone: formData.get('guestPhone') as string,
    };
    submitMutation.mutate(dto);
  };
  const resetForm = () => {
    setSubmitted(false);
  };
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  return (
    <>
      <motion.div
        className="fixed bottom-24 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="lg"
          className="h-14 gap-2 rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 px-4 text-white shadow-lg hover:from-brand-700 hover:to-emerald-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <>
              <X className="h-5 w-5" />
              <span className="text-sm font-semibold">Đóng</span>
            </>
          ) : (
            <>
              <LifeBuoy className="h-5 w-5 drop-shadow" />
              <span className="text-sm font-semibold">Hỗ trợ</span>
            </>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 z-50 max-h-[520px] w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-brand-100 bg-white/95 shadow-2xl backdrop-blur sm:right-6 sm:w-[400px]"
          >
            <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500 p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Hỗ trợ khách hàng</h3>
                  <p className="text-sm text-white/90">
                    Phản hồi nhanh, rõ ràng và luôn đồng hành cùng bạn
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-[420px] flex-col"
            >
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-none border-b bg-white px-2 py-1">
                <TabsTrigger
                  value="faq"
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700"
                >
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700"
                >
                  <Send className="h-4 w-4" />
                  Liên hệ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="m-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[360px]">
                  <div className="space-y-2 p-4">
                    {faqsLoading ? (
                      <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-brand-50 bg-brand-50/30">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 shadow-inner">
                          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                        </div>
                        <p className="mt-4 animate-pulse text-sm font-medium text-brand-600">
                          Đang tải câu hỏi thường gặp...
                        </p>
                      </div>
                    ) : !faqs || Object.keys(faqs).length === 0 ? (
                      <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                        <HelpCircle className="mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-base font-semibold text-gray-700">Chưa có câu hỏi nào</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Hãy qua tab Liên hệ để gửi thắc mắc của bạn trực tiếp cho chúng tôi nhé!
                        </p>
                      </div>
                    ) : (
                      Object.entries(faqs).map(([category, questions]) => (
                        <Collapsible
                          key={category}
                          open={expandedCategory === category}
                          onOpenChange={() => toggleCategory(category)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-brand-50 to-emerald-50 px-4 py-3 font-medium text-gray-800 transition-colors hover:from-brand-100 hover:to-emerald-100">
                            {category}
                            {expandedCategory === category ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-2">
                            {(questions as SupportQuestion[]).map((q) => (
                              <Collapsible key={q.id}>
                                <CollapsibleTrigger className="flex w-full items-start gap-2 rounded-lg border border-brand-100 px-4 py-3 text-left text-sm transition-colors hover:bg-brand-50/70">
                                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                                  <span>{q.question}</span>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="-mt-1 rounded-b-lg border-x border-b border-brand-100 bg-brand-50/40 px-4 py-3 text-sm text-muted-foreground">
                                  {q.answer}
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="contact" className="m-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[360px]">
                  <div className="p-4">
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="mb-2 text-lg font-semibold">Gửi thành công!</h4>
                        <p className="mb-4 text-sm text-muted-foreground">
                          Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.
                        </p>
                        <Button variant="outline" onClick={resetForm}>
                          Gửi phản hồi khác
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/60 p-3 text-xs text-gray-700">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                          <p>
                            Thông tin của bạn được bảo mật. Đội ngũ hỗ trợ sẽ phản hồi trong thời
                            gian sớm nhất.
                          </p>
                        </div>
                        {!user && (
                          <>
                            <div>
                              <Label htmlFor="guestName">Họ tên</Label>
                              <Input
                                id="guestName"
                                name="guestName"
                                placeholder="Nhập họ tên của bạn"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="guestEmail">Email</Label>
                              <Input
                                id="guestEmail"
                                name="guestEmail"
                                type="email"
                                placeholder="email@example.com"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="guestPhone">Số điện thoại</Label>
                              <Input id="guestPhone" name="guestPhone" placeholder="0912345678" />
                            </div>
                          </>
                        )}
                        {user && (
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-sm text-muted-foreground">Gửi với tài khoản:</p>
                            <p className="font-medium">{user.fullName}</p>
                          </div>
                        )}
                        <div>
                          <Label htmlFor="content">Nội dung</Label>
                          <Textarea
                            id="content"
                            name="content"
                            rows={4}
                            placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-brand-600 to-emerald-500 text-white hover:from-brand-700 hover:to-emerald-600"
                          disabled={submitMutation.isPending}
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Gửi phản hồi
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
