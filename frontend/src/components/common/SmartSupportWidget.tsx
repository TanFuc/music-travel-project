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
        className="fixed bottom-24 right-6 z-[60]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Button
          size="lg"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0 text-white shadow-[0_10px_40px_-10px_rgba(5,150,105,0.8)] transition-all duration-500 hover:scale-110 hover:shadow-[0_20px_50px_-10px_rgba(5,150,105,1)] active:scale-95"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          {isOpen ? (
            <X className="h-7 w-7 rotate-90 scale-110 transition-transform duration-300 group-hover:rotate-180" />
          ) : (
            <div className="relative flex items-center justify-center">
              <LifeBuoy className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-12" />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-sm"></span>
              </span>
            </div>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed bottom-[110px] right-4 z-50 flex h-[650px] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/80 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-3xl sm:right-8 sm:w-[440px]"
          >
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-emerald-600 px-8 pt-10 text-white shadow-md">
              <div className="absolute -right-16 -top-16 h-56 w-56 animate-[spin_15s_linear_infinite] rounded-full bg-gradient-to-br from-white/20 to-transparent blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />
              <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-white/60 shadow-[0_0_15px_rgba(255,255,255,1)]" />
              <div className="absolute right-20 top-12 h-1.5 w-1.5 rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5 text-brand-100" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-100/90">
                      Mãi Cho Hành Tinh Xanh
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-display text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  Hỗ trợ khách hàng
                </h3>
                <p className="text-sm font-medium text-emerald-100/80">
                  Phản hồi nhanh chóng, tận tâm và chuyên nghiệp
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="border-b border-gray-200/50 bg-white/60 px-2 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] backdrop-blur-xl">
                <TabsList className="h-16 w-full gap-2 bg-transparent p-2">
                  <TabsTrigger
                    value="faq"
                    className="relative h-full flex-1 rounded-2xl border-transparent bg-transparent px-2 text-xs font-bold uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-100/50 hover:text-gray-700 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md"
                  >
                    Hỏi Đáp (FAQ)
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="relative h-full flex-1 rounded-2xl border-transparent bg-transparent px-2 text-xs font-bold uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-100/50 hover:text-gray-700 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md"
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
                            <div className="flex items-center gap-3 pl-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" />
                              </span>
                              <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-700/80">
                                {category}
                              </h4>
                            </div>
                            <div className="grid gap-3">
                              {(questions as SupportQuestion[]).map((q) => (
                                <Collapsible key={q.id}>
                                  <CollapsibleTrigger className="group flex w-full items-start justify-between rounded-2xl border border-white/60 bg-gradient-to-br from-white to-gray-50/80 p-5 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-brand-100 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5">
                                    <span className="pr-4 text-sm font-bold leading-relaxed text-gray-800 transition-colors group-hover:text-brand-700">
                                      {q.question}
                                    </span>
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors duration-300 group-hover:bg-brand-100 group-data-[state=open]:bg-brand-600 group-data-[state=open]:text-white">
                                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                                    <div className="mt-3 rounded-2xl bg-brand-50/50 p-6 text-[14px] leading-loose text-gray-700 shadow-inner ring-1 ring-inset ring-brand-100/50">
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
                          <div className="space-y-5 rounded-[2rem] border border-white/50 bg-white/60 p-7 shadow-sm backdrop-blur-lg">
                            {!user && (
                              <div className="space-y-5">
                                <div className="space-y-2">
                                  <Label className="pl-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Danh xưng
                                  </Label>
                                  <Input
                                    name="guestName"
                                    className="h-14 rounded-2xl border-gray-200/60 bg-white/80 px-4 text-base shadow-inner transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                    placeholder="Tên của bạn..."
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="pl-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Số điện thoại
                                  </Label>
                                  <Input
                                    name="guestPhone"
                                    className="h-14 rounded-2xl border-gray-200/60 bg-white/80 px-4 text-base shadow-inner transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                    placeholder="09xx xxx xxx"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="pl-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Vấn đề cần hỗ trợ
                              </Label>
                              <Textarea
                                name="content"
                                rows={5}
                                className="resize-none rounded-2xl border-gray-200/60 bg-white/80 p-5 text-base leading-relaxed shadow-inner transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                placeholder="Hãy mô tả chi tiết vấn đề bạn đang gặp phải..."
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="group relative h-16 w-full overflow-hidden rounded-2xl border-none bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-500 text-base font-black text-white shadow-xl shadow-brand-600/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-600/40 active:scale-95"
                            disabled={submitMutation.isPending}
                          >
                            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            {submitMutation.isPending ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <span className="relative z-10 flex items-center gap-3">
                                GỬI YÊU CẦU HỖ TRỢ
                                <Send className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
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
