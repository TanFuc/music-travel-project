'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthMin } from '@/hooks/useAuthMin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { post } from '@/lib/api';
import { Users, CheckCircle, TrendingUp, HandCoins } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function CollaboratorRegisterPage() {
    const router = useRouter();
    const { user, isAuthenticated, login } = useAuthStore(); // Assuming login updates user state? define a refresh method if needed
    const [loading, setLoading] = useState(false);

    // If already collaborator, redirect
    if (isAuthenticated && user?.isCollaborator) {
        router.replace('/collaborator/dashboard');
        return null;
    }

    const handleRegister = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đăng ký');
            router.push('/login?redirect=/collaborator/register');
            return;
        }

        setLoading(true);
        try {
            const response = await post('/collaborator/register', {});
            // Assuming response contains updated user info, or we need to refresh profile
            // For now, simpler to toast success and redirect or reload
            toast.success('Đăng ký thành công! Chào mừng bạn gia nhập đội ngũ CTV.');

            // Ideally update local user state here
            // update user object in store
            useAuthStore.setState({ user: { ...user!, isCollaborator: true, referralCode: response.referralCode || user?.referralCode } });

            router.push('/collaborator/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                    Chương trình Cộng Tác Viên
                </h1>
                <p className="text-xl text-neutral-600">
                    Kiếm thêm thu nhập không giới hạn cùng Music Travel
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="border-blue-100 bg-blue-50/50">
                    <CardHeader>
                        <HandCoins className="h-10 w-10 text-blue-600 mb-2" />
                        <CardTitle>Hoa hồng hấp dẫn</CardTitle>
                        <CardDescription>
                            Nhận ngay hoa hồng lên đến 100,000đ cho mỗi vé bán được.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-indigo-100 bg-indigo-50/50">
                    <CardHeader>
                        <TrendingUp className="h-10 w-10 text-indigo-600 mb-2" />
                        <CardTitle>Thu nhập thụ động</CardTitle>
                        <CardDescription>
                            Không giới hạn số lượng vé, thu nhập tăng trưởng theo nỗ lực của bạn.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="border-purple-100 bg-purple-50/50">
                    <CardHeader>
                        <Users className="h-10 w-10 text-purple-600 mb-2" />
                        <CardTitle>Mạng lưới rộng mở</CardTitle>
                        <CardDescription>
                            Kết nối cộng đồng yêu nhạc và du lịch trên toàn quốc.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-2 border-blue-600/20 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <CardHeader className="text-center pt-10">
                    <CardTitle className="text-2xl">Đăng ký ngay hôm nay</CardTitle>
                    <CardDescription className="text-base">
                        Chỉ với một cú click, bạn sẽ trở thành đối tác chính thức của chúng tôi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-10">
                    <Button
                        size="lg"
                        className="w-full md:w-auto px-12 h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Đăng ký làm Cộng Tác Viên
                            </span>
                        )}
                    </Button>
                </CardContent>
                <CardFooter className="bg-neutral-50 border-t justify-center py-6">
                    <p className="text-sm text-neutral-500">
                        Bằng việc đăng ký, bạn đồng ý với <a href="#" className="underline text-blue-600">Điều khoản & Chính sách</a> của chương trình đối tác.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
