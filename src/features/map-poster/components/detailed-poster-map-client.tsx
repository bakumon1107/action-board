"use client";

import { Archive, ArrowLeft, Copy, HelpCircle, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { statusConfig } from "../config/status-config";
import {
  JP_TO_EN_PREFECTURE,
  type PosterPrefectureKey,
} from "../constants/poster-prefectures";
import {
  getArchivedPosterBoardsMinimal,
  getPosterBoardDetail,
  getPosterBoardsMinimal,
  getPosterBoardsMinimalByDistrict,
} from "../loaders/poster-boards-loaders";
import type {
  BoardStats,
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
} from "../types/poster-types";
import {
  calculateProgressRate,
  getCompletedCount,
} from "../utils/poster-progress";

// Dynamic import to avoid SSR issues
const PosterMap = dynamic(() => import("./poster-map-with-cluster"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

import {
  getPosterBoardStatsAction,
  getPosterBoardStatsByDistrictAction,
  updateBoardStatusAction,
} from "../actions/poster-boards";

interface DetailedPosterMapClientProps {
  userId?: string;
  prefecture: string;
  prefectureName: string;
  center: [number, number];
  initialStats?: BoardStats;
  boardTotal?: PosterBoardTotal | null;
  userEditedBoardIds?: string[];
  defaultZoom?: number;
  isDistrict?: boolean;
  isArchive?: boolean;
  archiveElectionTerm?: string;
  archiveTermName?: string;
}

export default function DetailedPosterMapClient({
  userId,
  prefecture,
  prefectureName,
  center,
  initialStats,
  boardTotal,
  userEditedBoardIds,
  defaultZoom,
  isDistrict = false,
  isArchive = false,
  archiveElectionTerm,
  archiveTermName,
}: DetailedPosterMapClientProps) {
  const [boards, setBoards] = useState<PosterBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<PosterBoard | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<BoardStatus>("not_yet");
  const [updateNote, setUpdateNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [_filters, setFilters] = useState({
    selectedStatuses: [
      "not_yet",
      "not_yet_dangerous",
      "reserved",
      "done",
      "error_wrong_place",
      "error_damaged",
      "error_wrong_poster",
      "other",
    ] as BoardStatus[],
    showOnlyMine: false,
  });
  const [userEditedBoardIdsSet, setUserEditedBoardIdsSet] = useState<
    Set<string>
  >(() => {
    return new Set(userEditedBoardIds || []);
  });
  const router = useRouter();
  // クリップボードにコピー
  const copyToClipboard = async (text: string, label = "内容") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`);
    } catch (_error) {
      toast.error("コピーに失敗しました");
    }
  };

  const loadBoards = useCallback(async () => {
    try {
      // 最小限のデータのみ取得
      let data: Pick<
        PosterBoard,
        | "id"
        | "lat"
        | "long"
        | "status"
        | "name"
        | "address"
        | "city"
        | "number"
      >[];
      if (isArchive && archiveElectionTerm) {
        // アーカイブモードの場合
        data = await getArchivedPosterBoardsMinimal(
          archiveElectionTerm,
          prefecture,
        );
      } else if (isDistrict) {
        data = await getPosterBoardsMinimalByDistrict(prefecture);
      } else {
        data = await getPosterBoardsMinimal(prefecture);
      }
      setBoards(data as PosterBoard[]);

      // アーカイブモードでは統計情報は初期値のみ使用（再取得しない）
      if (!isArchive) {
        // 統計情報も更新
        const newStats = isDistrict
          ? await getPosterBoardStatsByDistrictAction(prefecture)
          : await getPosterBoardStatsAction(
              prefecture as Parameters<typeof getPosterBoardStatsAction>[0],
            );
        setStats(newStats);
      }
    } catch (_error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [prefecture, isArchive, archiveElectionTerm, isDistrict]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ルート遷移時にコンポーネントが再マウントされるため、初回マウント時の単発実行で十分
  useEffect(() => {
    // 初回ロード時に全データをロード
    loadBoards();
  }, []);

  const handleBoardSelect = async (board: PosterBoard) => {
    // アーカイブモードの場合はクリックを無視
    if (isArchive) {
      toast.info("アーカイブデータは読み取り専用です");
      return;
    }

    // 詳細データを取得
    const fullBoardData = await getPosterBoardDetail(board.id);
    if (!fullBoardData) {
      toast.error("掲示板の詳細情報の取得に失敗しました");
      return;
    }

    setSelectedBoard(fullBoardData);
    if (userId) {
      setSelectedBoard(fullBoardData);
      setUpdateStatus(fullBoardData.status);
      setUpdateNote("");
      setIsUpdateDialogOpen(true);
    } else {
      setSelectedBoard(null);
      setIsLoginDialogOpen(true);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBoard) return;

    setIsUpdating(true);
    try {
      await updateBoardStatusAction(selectedBoard.id, updateStatus, updateNote);
      toast.success("ステータスを更新しました");
      setIsUpdateDialogOpen(false);
      setSelectedBoard(null);
      await loadBoards();
    } catch (_error) {
      toast.error("ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  // 統計情報を使用（初期値はサーバーから提供されたもの）
  const statusCounts = stats?.statusCounts || {
    not_yet: 0,
    not_yet_dangerous: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
  };
  const registeredCount = stats?.totalCount || 0;
  const actualTotalCount = boardTotal?.total_count || 0;
  const totalCount = actualTotalCount > 0 ? actualTotalCount : registeredCount;
  const completedCount = getCompletedCount(statusCounts);
  const completionRate = calculateProgressRate(completedCount, registeredCount);

  // アーカイブモードの場合のバックリンク先
  const backLink =
    isArchive && archiveElectionTerm
      ? `/map/poster/archive/${archiveElectionTerm}`
      : "/map/poster";

  return (
    <div className="container mx-auto max-w-7xl space-y-3 p-3">
      {/* Archive Notice */}
      {isArchive && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Archive className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              アーカイブデータ{archiveTermName && ` - ${archiveTermName}`}
            </p>
            <p className="text-xs text-amber-700">
              このデータは読み取り専用です。ステータスの更新はできません。
            </p>
          </div>
        </div>
      )}

      {/* Header - コンパクト化 */}
      <div className="flex items-center gap-3">
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-bold">
            {prefectureName}のポスター掲示板
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            読み取り専用
          </p>
          {!isArchive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowHelpDialog(true)}
              title="使い方を見る"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Map - 最優先表示 */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMap
          boards={boards}
          onBoardClick={handleBoardSelect}
          center={center}
          prefectureKey={
            isDistrict
              ? undefined
              : (JP_TO_EN_PREFECTURE[prefectureName] as PosterPrefectureKey)
          }
          onFilterChange={setFilters}
          userEditedBoardIds={userEditedBoardIdsSet}
          defaultZoom={defaultZoom}
        />
      </div>

      {/* 統計情報とステータス - 統合版 */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要統計 */}
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline gap-1">
              {actualTotalCount > 0 && (
                <span className="text-2xl font-bold">{registeredCount}</span>
              )}
              <span className="text-xs text-muted-foreground">総数</span>
              <span className="text-xs text-muted-foreground">
                (公表: {totalCount})
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">
                {completedCount}
              </span>
              <span className="text-xs text-muted-foreground">完了</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">
                {completionRate}%
              </span>
              <span className="text-xs text-muted-foreground">達成率</span>
            </div>
          </div>

          {/* 区切り線 */}
          <div className="hidden sm:block h-6 w-px bg-border" />

          {/* ステータス別内訳 */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {(
              [
                "not_yet",
                "not_yet_dangerous",
                "reserved",
                "done",
                "error_wrong_poster",
                "other",
              ] as BoardStatus[]
            ).map((status) => {
              const config = statusConfig[status];
              const count = statusCounts[status] || 0;
              return (
                <div key={status} className="flex items-center gap-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.color}`}
                  />
                  <span className="text-xs whitespace-nowrap">
                    {config.shortLabel || config.label}
                    <span className="ml-0.5 font-semibold">{count}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        open={selectedBoard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBoard(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>掲示板の詳細</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name ||
                selectedBoard?.address ||
                selectedBoard?.number}
            </DialogDescription>
          </DialogHeader>
          {selectedBoard && (
            <div className="space-y-2 text-sm">
              <p>
                {selectedBoard.prefecture} {selectedBoard.city}{" "}
                {selectedBoard.address}
              </p>
              {selectedBoard.number && <p>番号: {selectedBoard.number}</p>}
              {selectedBoard.status && (
                <p>
                  状態:{" "}
                  {statusConfig[selectedBoard.status as BoardStatus]?.label ||
                    selectedBoard.status}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBoard(null)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ログインが必要です</DialogTitle>
            <DialogDescription>
              掲示板の状況を更新するにはログインしてください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLoginDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const returnUrl = `${window.location.pathname}${window.location.search}`;
                router.push(
                  `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`,
                );
              }}
            >
              ログイン
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUpdateDialogOpen}
        onOpenChange={(open) => {
          setIsUpdateDialogOpen(open);
          if (!open) setSelectedBoard(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポスターの状況を報告</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name ||
                selectedBoard?.address ||
                selectedBoard?.number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poster-status">状態</Label>
              <Select
                value={updateStatus}
                onValueChange={(value) => setUpdateStatus(value as BoardStatus)}
              >
                <SelectTrigger id="poster-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="poster-note">メモ（任意）</Label>
              <Textarea
                id="poster-note"
                value={updateNote}
                onChange={(event) => setUpdateNote(event.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              disabled={isUpdating}
            >
              キャンセル
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>使い方</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">地図の操作</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>地図をドラッグして移動できます</li>
                <li>ピンチ操作またはボタンでズームできます</li>
                <li>現在地ボタンで自分の位置を表示できます</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">掲示板の詳細を見る</h4>
              <p className="text-sm text-muted-foreground">
                地図上のマーカーをタップすると、掲示板の位置・番号・住所を確認できます。
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">マーカーの色の意味</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <div key={status} className="flex items-start gap-2">
                    <div
                      className={`h-3 w-3 rounded-full shrink-0 mt-0.5 ${config.color}`}
                    />
                    <span className="text-xs">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
