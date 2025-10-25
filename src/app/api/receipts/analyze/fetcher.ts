import { AnalyzeReceiptRequest, AnalyzeReceiptResponse } from './type';

const BASE_URL = '/api/receipts/analyze';

// レシート解析
export async function analyzeReceipt(data: AnalyzeReceiptRequest): Promise<AnalyzeReceiptResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

