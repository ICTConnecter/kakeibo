import { ApiResponse, ReceiptAnalysisResult } from '@/types/api';

// リクエスト型
export type AnalyzeReceiptRequest = {
    images: string[]; // Base64エンコードされた画像データ
};

// レスポンス型（既存のものを再エクスポート）
export type AnalyzeReceiptResponse = ApiResponse<ReceiptAnalysisResult>;

