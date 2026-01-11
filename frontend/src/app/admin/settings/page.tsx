'use client';

import { Settings as SettingsIcon, Database, Shield, Bell, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
                <p className="text-neutral-600 mt-1">Quản lý cấu hình và thiết lập hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            Cài đặt chung
                        </CardTitle>
                        <CardDescription>Cấu hình cơ bản của hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Tên hệ thống</span>
                                <Button variant="outline" size="sm">Chỉnh sửa</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Múi giờ</span>
                                <Button variant="outline" size="sm">Chỉnh sửa</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Ngôn ngữ mặc định</span>
                                <Button variant="outline" size="sm">Chỉnh sửa</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Bảo mật
                        </CardTitle>
                        <CardDescription>Cài đặt bảo mật và quyền truy cập</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Xác thực 2 yếu tố</span>
                                <Button variant="outline" size="sm">Bật</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Thời gian session</span>
                                <Button variant="outline" size="sm">Chỉnh sửa</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">IP whitelist</span>
                                <Button variant="outline" size="sm">Quản lý</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Thông báo
                        </CardTitle>
                        <CardDescription>Cấu hình thông báo và email</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Email thông báo</span>
                                <Button variant="outline" size="sm">Cấu hình</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">SMS gateway</span>
                                <Button variant="outline" size="sm">Cấu hình</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Push notifications</span>
                                <Button variant="outline" size="sm">Cấu hình</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Giao diện
                        </CardTitle>
                        <CardDescription>Tùy chỉnh giao diện hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Logo</span>
                                <Button variant="outline" size="sm">Thay đổi</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Màu chủ đạo</span>
                                <Button variant="outline" size="sm">Chọn màu</Button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm">Favicon</span>
                                <Button variant="outline" size="sm">Tải lên</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Settings */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Cơ sở dữ liệu
                        </CardTitle>
                        <CardDescription>Quản lý backup và maintenance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="justify-start">
                                <Database className="h-4 w-4 mr-2" />
                                Backup ngay
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Database className="h-4 w-4 mr-2" />
                                Lịch sử backup
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <Database className="h-4 w-4 mr-2" />
                                Tối ưu hóa DB
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
