'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuthComponent } from '@/components/context/user';

export default function ReceiptCameraPage() {
    const router = useRouter();
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
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
            setCapturedImages(prev => [...prev, imageData]);
        };
        reader.readAsDataURL(file);

        // input要素をリセット（同じファイルを再選択できるようにする）
        e.target.value = '';
    };

    const handleAnalyze = async () => {
        if (capturedImages.length === 0) return;

        setAnalyzing(true);
        try {
            // レシート解析APIを呼び出し（複数画像対応）
            const response = await fetch('/api/receipts/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: capturedImages }),
            });

            const result = await response.json();

            if (result.success) {
                // 画像データはsessionStorageに保存（URLが長くなりすぎるのを防ぐ）
                sessionStorage.setItem('receiptImagesData', JSON.stringify(capturedImages));

                // 確認画面に遷移（解析結果のみURLで渡す）
                const params = new URLSearchParams({
                    data: JSON.stringify(result.data),
                });
                router.push(`/receipt/confirm?${params.toString()}`);
            } else {
                alert(result.error || 'レシートの解析に失敗しました');
                setCapturedImages([]);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('エラーが発生しました');
            setCapturedImages([]);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleClear = () => {
        setCapturedImages([]);
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
                <div className="flex-1 overflow-y-auto p-4">
                    {capturedImages.length > 0 ? (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="text-white text-center mb-4">
                                <p className="text-lg font-bold">撮影済み: {capturedImages.length}枚</p>
                                <p className="text-sm text-gray-400">長いレシートは分割して撮影できます</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {capturedImages.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`レシート ${index + 1}`}
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                                        >
                                            ×
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                            {index + 1}枚目
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto h-full flex items-center justify-center">
                            <div className="w-full aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                                <div className="text-center text-gray-400">
                                    <p className="text-lg mb-2">レシートを撮影してください</p>
                                    <p className="text-sm">長いレシートは分割して撮影できます</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* コントロールボタン */}
                <div className="p-4 bg-gray-800">
                    {capturedImages.length > 0 ? (
                        <div className="max-w-4xl mx-auto space-y-3">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCapture}
                                    disabled={analyzing}
                                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    📷 追加撮影
                                </button>
                                <button
                                    onClick={handleClear}
                                    disabled={analyzing}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    クリア
                                </button>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
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

