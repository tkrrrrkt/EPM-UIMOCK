'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Plus, Search, CheckCircle2 } from 'lucide-react';
import { HttpBffClient } from '../api/http-bff-client';
import { CreateEventDialog } from './dialogs/create-event-dialog';
import type { KpiMasterEventDto } from '@epm-sdd/contracts/bff/kpi-master';

const bffClient = new HttpBffClient();

export function KpiEventListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<KpiMasterEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [fiscalYear, setFiscalYear] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await bffClient.getEvents({
        page: 1,
        pageSize: 50,
        keyword: keyword || undefined,
        fiscalYear,
        status: statusFilter as any,
      });
      setEvents(result.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [keyword, fiscalYear, statusFilter]);

  const handleConfirmEvent = async (eventId: string) => {
    try {
      await bffClient.confirmEvent(eventId);
      loadEvents(); // Reload events
    } catch (error) {
      console.error('Failed to confirm event:', error);
      alert('イベントの確定に失敗しました');
    }
  };

  const handleEventCreated = () => {
    setCreateDialogOpen(false);
    loadEvents();
  };

  const handleRowClick = (eventId: string) => {
    router.push(`/kpi/kpi-master/${eventId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">KPI管理マスタ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              年度単位でKPI管理項目を登録・運用します
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規イベント作成
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-none border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="イベントコード、イベント名で検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={fiscalYear?.toString() || 'all'}
            onValueChange={(value) =>
              setFiscalYear(value === 'all' ? undefined : Number(value))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="年度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての年度</SelectItem>
              <SelectItem value="2026">2026年度</SelectItem>
              <SelectItem value="2025">2025年度</SelectItem>
              <SelectItem value="2024">2024年度</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setStatusFilter(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="DRAFT">下書き</SelectItem>
              <SelectItem value="CONFIRMED">確定済み</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-2">
              該当するKPI管理イベントがありません
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規イベント作成
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-32">年度</TableHead>
                  <TableHead className="w-40">イベントコード</TableHead>
                  <TableHead>イベント名</TableHead>
                  <TableHead className="w-32">ステータス</TableHead>
                  <TableHead className="w-44">更新日時</TableHead>
                  <TableHead className="w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(event.id)}
                  >
                    <TableCell className="font-medium">{event.fiscalYear}年度</TableCell>
                    <TableCell className="font-mono text-sm">
                      {event.eventCode}
                    </TableCell>
                    <TableCell>{event.eventName}</TableCell>
                    <TableCell>
                      {event.status === 'DRAFT' ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          下書き
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          確定済み
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(event.updatedAt).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-center">
                      {event.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `イベント「${event.eventName}」を確定しますか？\n確定後はKPI項目の削除ができなくなります。`,
                              )
                            ) {
                              handleConfirmEvent(event.id);
                            }
                          }}
                          className="text-success hover:text-success hover:bg-success/10"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          確定
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
