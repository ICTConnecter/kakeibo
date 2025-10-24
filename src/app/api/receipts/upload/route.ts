import { NextRequest, NextResponse } from 'next/server';
import { uploadReceiptImage } from '@/utils/storage/cloudStorage';
import { ApiResponse, ReceiptUploadResponse } from '@/types/api';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'File is required',
                },
                { status: 400 }
            );
        }

        // ファイルサイズチェック（5MB制限）
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'ファイルサイズは5MB以下にしてください',
                },
                { status: 400 }
            );
        }

        // ファイルタイプチェック
        if (!file.type.startsWith('image/')) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: '画像ファイルのみアップロード可能です',
                },
                { status: 400 }
            );
        }

        // ファイルをBufferに変換
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // GCP Cloud Storageにアップロード
        const imageUrl = await uploadReceiptImage(buffer, file.name, file.type);

        return NextResponse.json<ApiResponse<ReceiptUploadResponse>>(
            {
                success: true,
                data: { imageUrl },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Receipt upload error:', error);
        
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error instanceof Error ? error.message : '画像のアップロードに失敗しました',
            },
            { status: 500 }
        );
    }
}

