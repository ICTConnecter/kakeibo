import { ApiResponse, ReceiptUploadResponse } from '@/types/api';

// レスポンス型（既存のものを再エクスポート）
export type { ReceiptUploadResponse } from '@/types/api';
export type UploadReceiptResponse = ApiResponse<ReceiptUploadResponse>;

