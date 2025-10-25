import { UploadReceiptResponse } from './type';

const BASE_URL = '/api/receipts/upload';

// レシート画像アップロード
export async function uploadReceipt(file: File): Promise<UploadReceiptResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(BASE_URL, {
        method: 'POST',
        body: formData,
    });
    return response.json();
}

