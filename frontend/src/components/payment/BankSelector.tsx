'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { paymentService, BankInfo } from '@/services/payment.service';
import { useToast } from '@/hooks/useToast';

interface BankSelectorProps {
  selectedBank?: string;
  onBankSelect: (bankCode: string, bankInfo: BankInfo) => void;
  className?: string;
}

export default function BankSelector({
  selectedBank,
  onBankSelect,
  className = ''
}: BankSelectorProps) {
  const [banks, setBanks] = useState<Record<string, BankInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const banksData = await paymentService.getSupportedBanks();
      setBanks(banksData);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách ngân hàng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = Object.entries(banks).filter(([code, bank]) =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBankInfo = selectedBank ? banks[selectedBank] : null;

  const handleBankSelect = (bankCode: string, bankInfo: BankInfo) => {
    onBankSelect(bankCode, bankInfo);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedBankInfo ? (
            <>
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">
                  {selectedBankInfo?.shortName?.substring(0, 2)}
                </span>
              </div>
              <span>{selectedBankInfo.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Chọn ngân hàng</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm ngân hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredBanks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Không tìm thấy ngân hàng
                </div>
              ) : (
                filteredBanks.map(([code, bank]) => (
                  <button
                    key={code}
                    onClick={() => handleBankSelect(code, bank)}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {bank.shortName?.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{bank.name}</div>
                        <div className="text-sm text-gray-500">{code}</div>
                      </div>
                    </div>
                    {selectedBank === code && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}