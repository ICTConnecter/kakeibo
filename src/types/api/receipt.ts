import { ExpenseItem } from '../firestore';

// レシート解析APIのレスポンス
export type ReceiptAnalysisResult = {
    storeName: string;
    date: string; // ISO 8601 format
    totalAmount: number;
    tax: number;
    items: ExpenseItem[];
}

// レシート画像アップロードのレスポンス
export type ReceiptUploadResponse = {
    imageUrl: string; // GCP Cloud Storage URL
}

