import { AnalyzeReceiptRequest, AnalyzeReceiptResponse } from './type';

const BASE_URL = '/api/receipts/analyze';

// 画像圧縮・リサイズの設定
const IMAGE_CONFIG = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    maxSizeBytes: 1 * 1024 * 1024, // 1MB per image
};

// Base64画像をリサイズ・圧縮する
async function compressImage(base64Image: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;

            // アスペクト比を維持しながらリサイズ
            if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
                const ratio = Math.min(
                    IMAGE_CONFIG.maxWidth / width,
                    IMAGE_CONFIG.maxHeight / height
                );
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // 品質を調整しながら圧縮
            let quality = IMAGE_CONFIG.quality;
            let result = canvas.toDataURL('image/jpeg', quality);

            // サイズが大きすぎる場合は品質を下げて再圧縮
            while (result.length > IMAGE_CONFIG.maxSizeBytes * 1.37 && quality > 0.3) {
                quality -= 0.1;
                result = canvas.toDataURL('image/jpeg', quality);
            }

            resolve(result);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = base64Image;
    });
}

// 複数画像を圧縮する
async function compressImages(images: string[]): Promise<string[]> {
    return Promise.all(images.map(compressImage));
}

// レシート解析の結果（圧縮画像を含む）
export type AnalyzeReceiptResultWithImages = {
    response: AnalyzeReceiptResponse;
    compressedImages: string[];
};

// レシート解析
export async function analyzeReceipt(data: AnalyzeReceiptRequest): Promise<AnalyzeReceiptResultWithImages> {
    // 画像を圧縮・リサイズ
    const compressedImages = await compressImages(data.images);

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: compressedImages }),
    });
    const jsonResponse = await response.json();

    return {
        response: jsonResponse,
        compressedImages,
    };
}

