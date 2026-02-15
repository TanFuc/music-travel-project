'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Filter,
  Eye,
  User,
  Calendar,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from '@/components/ui/skeleton';

import {
  getAuditLogs,
  getActionTypes,
  getEntityTypes,
  getModules,
  computeDiff,
  type AuditLog,
} from '@/services/audit.service';

const getActionBadge = (action: string) => {
  switch (action) {
    case 'CREATE':
      return <Badge className="bg-green-100 text-green-800">Tạo mới</Badge>;
    case 'UPDATE':
      return <Badge className="bg-blue-100 text-blue-800">Cập nhật</Badge>;
    case 'DELETE':
      return <Badge className="bg-red-100 text-red-800">Xóa</Badge>;
    case 'LOGIN':
      return <Badge className="bg-purple-100 text-purple-800">Đăng nhập</Badge>;
    case 'LOGOUT':
      return <Badge className="bg-gray-100 text-gray-800">Đăng xuất</Badge>;
    case 'EXPORT':
      return <Badge className="bg-orange-100 text-orange-800">Xuất dữ liệu</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

const JsonDiff = ({ oldValue, newValue }: { oldValue: any; newValue: any }) => {
  const diff = computeDiff(oldValue, newValue);

  if (diff.length === 0) {
    return <p className="text-muted-foreground">Không có thay đổi</p>;
  }

  return (
    <div className="space-y-3">
      {diff.map(({ key, old: oldVal, new: newVal }) => (
        <div key={key} className="border rounded-lg p-3">
          <p className="font-medium text-sm mb-2">{key}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Trước</p>
              <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-32 text-red-800">
                {oldVal === undefined ? '(không có)' : JSON.stringify(oldVal, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sau</p>
              <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32 text-green-800">
                {newVal === undefined ? '(không có)' : JSON.stringify(newVal, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    module: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Queries
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: 20,
        action: filters.action || undefined,
        entity: filters.entity || undefined,
        module: filters.module || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
  });

  const { data: actionTypes } = useQuery({
    queryKey: ['audit-logs', 'actions'],
    queryFn: getActionTypes,
  });

  const { data: entityTypes } = useQuery({
    queryKey: ['audit-logs', 'entities'],
    queryFn: getEntityTypes,
  });

  const { data: modules } = useQuery({
    queryKey: ['audit-logs', 'modules'],
    queryFn: getModules,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entity: '',
      module: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setPage(1);
  };

  const viewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nhật ký hoạt động</h1>
        <p className="text-muted-foreground">Theo dõi tất cả thay đổi trong hệ thống</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Hành động</Label>
              <Select
                value={filters.action}
                onValueChange={(v) => handleFilterChange('action', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {actionTypes?.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Đối tượng</Label>
              <Select
                value={filters.entity}
                onValueChange={(v) => handleFilterChange('entity', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {entityTypes?.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Module</Label>
              <Select
                value={filters.module}
                onValueChange={(v) => handleFilterChange('module', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {modules?.map((mod) => (
                    <SelectItem key={mod} value={mod}>
                      {mod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhật ký</CardTitle>
          <CardDescription>
            Tổng cộng {logsData?.meta?.total || 0} bản ghi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>IP</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                logsData?.data?.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{log.user.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Hệ thống</span>
                      )}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{log.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.entityId || '-'}</TableCell>
                    <TableCell>
                      {log.module ? (
                        <Badge variant="outline">{log.module}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => viewDetail(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {logsData?.meta && logsData.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {logsData.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(logsData.meta.totalPages, p + 1))}
                  disabled={page === logsData.meta.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết nhật ký</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Người thực hiện</Label>
                  <p className="font-medium">
                    {selectedLog.user?.fullName || 'Hệ thống'}
                    {selectedLog.user && (
                      <span className="text-muted-foreground ml-2">
                        ({selectedLog.user.phoneNumber})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hành động</Label>
                  <p>{getActionBadge(selectedLog.action)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Đối tượng</Label>
                  <p className="font-medium">
                    {selectedLog.entity} {selectedLog.entityId && `#${selectedLog.entityId}`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Module</Label>
                  <p className="font-medium">{selectedLog.module || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Địa chỉ IP</Label>
                  <p className="font-mono">{selectedLog.ipAddress || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-xs truncate" title={selectedLog.userAgent || ''}>
                    {selectedLog.userAgent || '-'}
                  </p>
                </div>
              </div>

              {/* Changes */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Thay đổi dữ liệu</Label>
                <JsonDiff oldValue={selectedLog.oldValue} newValue={selectedLog.newValue} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
