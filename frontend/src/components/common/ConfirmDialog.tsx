'use client';

import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isLoading = false,
    variant = 'warning',
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantColors = {
        danger: 'text-error-600',
        warning: 'text-warning-600',
        info: 'text-brand-600',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`${variantColors[variant]}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-neutral-600 mb-6">{message}</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant === 'danger' ? 'destructive' : 'default'}
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
