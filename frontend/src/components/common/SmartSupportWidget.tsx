'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, HelpCircle, Send, ChevronDown, Loader2, Check, LifeBuoy, Sparkles } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuthStore();
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: getPublicFAQs,
    enabled: isOpen,
    staleTime: 15 * 60 * 1000,
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
  return (
    <>
      <motion.div
        className="fixed bottom-24 right-7 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Button
          size="lg"
          className="group h-14 w-14 rounded-full bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-500 p-0 text-white shadow-[0_8px_25px_-8px_rgba(5,150,105,0.5)] transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <LifeBuoy className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-400"></span>
              </span>
            </div>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-[168px] right-4 z-50 flex h-[620px] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/70 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.2)] ring-1 ring-black/5 backdrop-blur-3xl sm:right-8 sm:w-[420px]"
          >
            <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-emerald-500 px-7 pt-9 text-white">
              <div className="absolute -right-12 -top-12 h-44 w-44 animate-pulse rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />

              <div className="relative space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-brand-100" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                    Mãi Cho Hành Tinh Xanh
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">Hỗ trợ khách hàng</h3>
                <p className="text-sm font-medium text-emerald-50/70">
                  Phản hồi nhanh, tận tâm và chuyên nghiệp
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="border-b border-gray-100/50 bg-white/40 px-6">
                <TabsList className="h-16 w-full bg-transparent p-0">
                  <TabsTrigger
                    value="faq"
                    className="relative h-full flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-800"
                  >
                    Hỏi Đáp (FAQ)
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="relative h-full flex-1 rounded-none border-b-2 border-transparent bg-transparent px-1 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-800"
                  >
                    Gửi Liên Hệ
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="faq" className="m-0 h-full p-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-8 p-7">
                      {faqsLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-24">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-brand-100" />
                            <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-brand-600" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Đang khởi tạo...
                          </p>
                        </div>
                      ) : !faqs || Object.keys(faqs).length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl bg-neutral-50/50 py-16 text-center shadow-inner">
                          <HelpCircle className="h-16 w-16 text-neutral-200" />
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-neutral-700">
                              Chưa có câu hỏi nào
                            </p>
                            <p className="text-xs font-medium text-neutral-400">
                              Hãy gởi yêu cầu ở tab Liên hệ nhé!
                            </p>
                          </div>
                        </div>
                      ) : (
                        Object.entries(faqs).map(([category, questions]) => (
                          <div key={category} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="h-1 w-6 rounded-full bg-brand-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600/70">
                                {category}
                              </h4>
                            </div>
                            <div className="grid gap-3">
                              {(questions as SupportQuestion[]).map((q) => (
                                <Collapsible key={q.id}>
                                  <CollapsibleTrigger className="group flex w-full items-start justify-between rounded-2xl border border-white bg-white/60 p-4 text-left shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md">
                                    <span className="pr-4 text-sm font-bold leading-snug text-gray-800 group-hover:text-brand-700">
                                      {q.question}
                                    </span>
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 group-data-[state=open]:bg-brand-50 group-data-[state=open]:text-brand-600">
                                      <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="duration-300 animate-in slide-in-from-top-2">
                                    <div className="mt-2 rounded-2xl bg-brand-50/30 p-5 text-[13px] leading-relaxed text-gray-600 ring-1 ring-inset ring-brand-100/30">
                                      {q.answer}
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="contact" className="m-0 h-full p-0">
                  <ScrollArea className="h-full">
                    <div className="p-7">
                      {submitted ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center space-y-8 rounded-[3rem] bg-emerald-50/30 py-16 text-center shadow-inner"
                        >
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl shadow-emerald-500/20">
                            <Check className="h-10 w-10 text-emerald-600" />
                          </div>
                          <div className="space-y-3 px-6">
                            <h4 className="text-2xl font-black text-emerald-900">Tuyệt vời!</h4>
                            <p className="text-sm font-medium leading-relaxed text-emerald-700/60">
                              Yêu cầu của bạn đã được chuyển tới bộ phận hỗ trợ. Chúng tôi sẽ phản
                              hồi qua email/SĐT trong 24h tới.
                            </p>
                          </div>
                          <Button
                            className="h-14 rounded-2xl bg-emerald-600 px-8 font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
                            onClick={resetForm}
                          >
                            Gửi yêu cầu mới
                          </Button>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-5 rounded-[2rem] bg-white/50 p-6 shadow-sm ring-1 ring-gray-100">
                            {!user && (
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <Label className="pl-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Danh xưng
                                  </Label>
                                  <Input
                                    name="guestName"
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white"
                                    placeholder="Tên của bạn..."
                                    required
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="pl-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Số điện thoại
                                  </Label>
                                  <Input
                                    name="guestPhone"
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white"
                                    placeholder="09xx xxx xxx"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <Label className="pl-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Vấn đề cần hỗ trợ
                              </Label>
                              <Textarea
                                name="content"
                                rows={6}
                                className="resize-none rounded-2xl border-gray-100 bg-gray-50/50 p-4 focus:bg-white"
                                placeholder="Hãy mô tả chi tiết vấn đề bạn đang gặp phải..."
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="h-16 w-full rounded-2xl border-none bg-gradient-to-r from-brand-700 to-emerald-600 text-base font-black text-white shadow-2xl shadow-brand-600/30 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
                            disabled={submitMutation.isPending}
                          >
                            {submitMutation.isPending ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-3">
                                GỬI YÊU CẦU HỖ TRỢ
                                <Send className="h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
