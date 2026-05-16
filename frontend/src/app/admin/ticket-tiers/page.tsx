'use client';
import { Link } from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Music2, Plane } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
export default function AdminTicketTiersPage() {
  usePageTitle();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-0">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Flow Deprecated
        </p>
        <h1 className="mt-3 text-2xl font-black text-amber-950 sm:text-3xl">
          Đã ngưng quản lý Hạng vé toàn cục
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-900 sm:text-base">
          Hệ thống hiện tại dùng loại vé riêng theo từng show và từng tour/combo. Bạn hãy quản lý
          loại vé trực tiếp trong form tạo/sửa của từng sản phẩm.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/admin/shows" className="block">
            <Button
              variant="outline"
              className="h-11 w-full justify-start gap-2 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              <Music2 className="h-4 w-4" />
              Quản lý loại vé theo Show
            </Button>
          </Link>
          <Link href="/admin/tours" className="block">
            <Button
              variant="outline"
              className="h-11 w-full justify-start gap-2 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              <Plane className="h-4 w-4" />
              Quản lý loại vé theo Tour/Combo
            </Button>
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-amber-700">
          <ArrowRightLeft className="h-4 w-4" />
          Các endpoint admin ticket-tier cũ không còn dùng trong flow mới.
        </div>
      </div>
    </div>
  );
}
