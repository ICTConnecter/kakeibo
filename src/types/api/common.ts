// API共通のレスポンス型
export type ApiResponse<T = void> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ページネーション用のクエリパラメータ
export type PaginationParams = {
    page?: number;
    limit?: number;
}

// フィルタ用の共通パラメータ
export type DateRangeFilter = {
    startDate?: string; // ISO 8601 format
    endDate?: string;
}

