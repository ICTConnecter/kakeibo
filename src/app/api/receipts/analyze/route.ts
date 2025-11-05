import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceipt, analyzeMultipleReceiptImages } from '@/utils/ai/gemini';
import { ApiResponse, ReceiptAnalysisResult } from '@/types/api';

export async function POST(request: NextRequest) {
    try {
        const { images } = await request.json();

        // 画像データが必要
        if (!images || images.length === 0) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Image data is required',
                },
                { status: 400 }
            );
        }

        // Base64データから不要なプレフィックスを削除
        const base64DataArray = images.map((img: string) =>
            img.replace(/^data:image\/\w+;base64,/, '')
        );

        // 複数画像を解析（1枚でも複数でも同じ処理）
        const result = images.length === 1
            ? await analyzeReceipt(base64DataArray[0])
            : await analyzeMultipleReceiptImages(base64DataArray);

        return NextResponse.json<ApiResponse<ReceiptAnalysisResult>>(
            {
                success: true,
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Receipt analysis error:', error);

        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error instanceof Error ? error.message : 'レシートの解析に失敗しました',
            },
            { status: 500 }
        );
    }
}

