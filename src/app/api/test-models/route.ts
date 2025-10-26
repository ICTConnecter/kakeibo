import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GOOGLE_AI_API_KEY is not set' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 利用可能なモデル一覧を取得
        // GoogleGenerativeAI には 'models' プロパティがないため、直接 fetch する
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        const models = data.models || [];
        
        return NextResponse.json({
            success: true,
            models: models.map((model: any) => ({
                name: model.name,
                displayName: model.displayName,
                description: model.description,
                supportedGenerationMethods: model.supportedGenerationMethods,
            })),
        });
    } catch (error) {
        console.error('Failed to list models:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list models',
            },
            { status: 500 }
        );
    }
}

