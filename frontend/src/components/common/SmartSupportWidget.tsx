'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MessageCircle,
  X,
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

  // Query FAQs
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['public', 'faqs'],
    queryFn: getPublicFAQs,
    enabled: isOpen,
  });

  // Submit complaint mutation
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
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-brand-600 hover:bg-brand-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </motion.div>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] bg-white rounded-2xl shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-600 text-white p-4">
              <h3 className="font-semibold text-lg">Hỗ trợ khách hàng</h3>
              <p className="text-sm text-brand-100">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[400px]">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="faq" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Liên hệ
                </TabsTrigger>
              </TabsList>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-[340px]">
                  <div className="p-4 space-y-2">
                    {faqsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                      </div>
                    ) : !faqs || Object.keys(faqs).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Chưa có câu hỏi thường gặp
                      </p>
                    ) : (
                      Object.entries(faqs).map(([category, questions]) => (
                        <Collapsible
                          key={category}
                          open={expandedCategory === category}
                          onOpenChange={() => toggleCategory(category)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 font-medium hover:bg-muted transition-colors">
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
                                <CollapsibleTrigger className="flex w-full items-start gap-2 rounded-lg border px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors">
                                  <HelpCircle className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                                  <span>{q.question}</span>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-4 py-3 text-sm text-muted-foreground bg-muted/30 rounded-b-lg -mt-1 border-x border-b">
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

              {/* Contact Tab */}
              <TabsContent value="contact" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-[340px]">
                  <div className="p-4">
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-lg mb-2">Gửi thành công!</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.
                        </p>
                        <Button variant="outline" onClick={resetForm}>
                          Gửi phản hồi khác
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
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
                              <Input
                                id="guestPhone"
                                name="guestPhone"
                                placeholder="0912345678"
                              />
                            </div>
                          </>
                        )}
                        {user && (
                          <div className="bg-muted/50 p-3 rounded-lg">
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
                          className="w-full"
                          disabled={submitMutation.isPending}
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
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
