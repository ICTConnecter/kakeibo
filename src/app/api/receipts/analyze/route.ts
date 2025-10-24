import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceipt, checkReceiptQuality } from '@/utils/ai/gemini';
import { ApiResponse, ReceiptAnalysisResult } from '@/types/api';

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Image data is required',
                },
                { status: 400 }
            );
        }

        // Base64形式の画像データから不要なプレフィックスを削除
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        // 画像品質チェック（オプション）
        const isQualityGood = await checkReceiptQuality(base64Data);
        
        if (!isQualityGood) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'レシート画像が不鮮明です。再度撮影してください。',
                },
                { status: 400 }
            );
        }

        // レシート解析
        const result = await analyzeReceipt(base64Data);

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

