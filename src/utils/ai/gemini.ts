import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReceiptAnalysisResult } from '@/types/api';

// Gemini AIクライアントの初期化
let genAI: GoogleGenerativeAI | null = null;

export const getGeminiClient = (): GoogleGenerativeAI => {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
        }

        genAI = new GoogleGenerativeAI(apiKey);
    }

    return genAI;
};

// レシート画像を解析
export const analyzeReceipt = async (
    imageBase64: string
): Promise<ReceiptAnalysisResult> => {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
あなたはレシート画像を解析するAIアシスタントです。
以下のレシート画像から情報を抽出し、JSON形式で返してください。

抽出する情報：
- storeName: 店舗名
- date: 購入日時（ISO 8601形式、例: "2025-10-24T15:30:00+09:00"）
- totalAmount: 合計金額（数値）
- tax: 消費税額（数値）
- items: 商品明細の配列
  - name: 商品名
  - price: 単価（数値）
  - quantity: 数量（数値）

注意事項：
- 数値はすべて整数で返してください
- 日時が不明な場合は現在時刻を使用してください
- 商品明細が読み取れない場合は空配列を返してください
- レスポンスは必ずJSON形式のみで、余分な説明は含めないでください

レスポンス形式：
{
  "storeName": "店舗名",
  "date": "2025-10-24T15:30:00+09:00",
  "totalAmount": 3580,
  "tax": 258,
  "items": [
    {
      "name": "商品名",
      "price": 198,
      "quantity": 1
    }
  ]
}
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // JSONを抽出（```json ``` のマークダウンブロックを削除）
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
        
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from AI response');
        }

        const jsonText = jsonMatch[1] || jsonMatch[0];
        const analysisResult: ReceiptAnalysisResult = JSON.parse(jsonText);

        // データ検証
        if (!analysisResult.storeName || !analysisResult.date || typeof analysisResult.totalAmount !== 'number') {
            throw new Error('Invalid receipt analysis result');
        }

        return analysisResult;
    } catch (error) {
        console.error('Failed to analyze receipt:', error);
        throw new Error('レシートの解析に失敗しました。画像が不鮮明な可能性があります。');
    }
};

// レシート画像の品質チェック
export const checkReceiptQuality = async (imageBase64: string): Promise<boolean> => {
    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
この画像はレシートですか？また、レシートとして読み取り可能な品質ですか？
以下の基準で判断してください：
- レシートらしい形式（店名、金額、商品リストなど）
- 文字が読み取れる程度に鮮明
- 極端に暗すぎたり明るすぎたりしない

判断結果を以下のJSON形式で返してください：
{
  "isReceipt": true/false,
  "isReadable": true/false,
  "reason": "判断理由"
}
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
        
        if (!jsonMatch) {
            return false;
        }

        const jsonText = jsonMatch[1] || jsonMatch[0];
        const qualityCheck = JSON.parse(jsonText);

        return qualityCheck.isReceipt && qualityCheck.isReadable;
    } catch (error) {
        console.error('Failed to check receipt quality:', error);
        return false;
    }
};

