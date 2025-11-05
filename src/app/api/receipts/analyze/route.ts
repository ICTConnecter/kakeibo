import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceipt, analyzeMultipleReceiptImages } from '@/utils/ai/gemini';
import { ApiResponse, ReceiptAnalysisResult } from '@/types/api';

export async function POST(request: NextRequest) {
    try {
        const { image, images } = await request.json();

        // 単一画像または複数画像のいずれかが必要
        if (!image && (!images || images.length === 0)) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Image data is required',
                },
                { status: 400 }
            );
        }

        let result: ReceiptAnalysisResult;

        if (images && images.length > 0) {
            // 複数画像の場合
            const base64DataArray = images.map((img: string) =>
                img.replace(/^data:image\/\w+;base64,/, '')
            );

            // 複数画像を解析（1つのレシートとして扱う）
            result = await analyzeMultipleReceiptImages(base64DataArray);
        } else {
            // 単一画像の場合（後方互換性）
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            result = await analyzeReceipt(base64Data);
        }

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

