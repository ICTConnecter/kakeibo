'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuthComponent } from '@/components/context/user';

export default function ReceiptCameraPage() {
    const router = useRouter();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 画像プレビュー
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setCapturedImage(imageData);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!capturedImage) return;

        setAnalyzing(true);
        try {
            // レシート解析APIを呼び出し
            const response = await fetch('/api/receipts/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: capturedImage }),
            });

            const result = await response.json();

            if (result.success) {
                // 画像をアップロード
                const formData = new FormData();
                const blob = await (await fetch(capturedImage)).blob();
                formData.append('file', blob, 'receipt.jpg');

                const uploadResponse = await fetch('/api/receipts/upload', {
                    method: 'POST',
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                // 確認画面に遷移（解析結果と画像URLを渡す）
                const params = new URLSearchParams({
                    data: JSON.stringify({
                        ...result.data,
                        receiptImageUrl: uploadResult.data.imageUrl,
                    }),
                });
                router.push(`/receipt/confirm?${params.toString()}`);
            } else {
                alert(result.error || 'レシートの解析に失敗しました');
                setCapturedImage(null);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('エラーが発生しました');
            setCapturedImage(null);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-900 flex flex-col">
                {/* ヘッダー */}
                <header className="bg-gray-800 p-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <button
                            onClick={() => router.back()}
                            className="text-white hover:text-gray-300"
                        >
                            ← 戻る
                        </button>
                        <h1 className="text-xl font-bold text-white">レシート撮影</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                {/* カメラエリア */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {capturedImage ? (
                        <div className="max-w-md w-full">
                            <img
                                src={capturedImage}
                                alt="撮影したレシート"
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    ) : (
                        <div className="max-w-md w-full aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                            <div className="text-center text-gray-400">
                                <p className="text-lg mb-2">レシートを撮影してください</p>
                                <p className="text-sm">文字が鮮明に写るようにしてください</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* コントロールボタン */}
                <div className="p-4 bg-gray-800">
                    {capturedImage ? (
                        <div className="flex gap-4 max-w-md mx-auto">
                            <button
                                onClick={handleRetake}
                                disabled={analyzing}
                                className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                撮り直す
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {analyzing ? '解析中...' : '解析する'}
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handleCapture}
                                className="w-full py-4 bg-white text-gray-900 rounded-full text-lg font-bold shadow-lg hover:bg-gray-100"
                            >
                                📷 撮影する
                            </button>
                        </div>
                    )}
                </div>

                {/* 隠しファイル入力 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </UserAuthComponent>
    );
}

