import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from '../firebase/admin';

// レシート画像のアップロード
export const uploadReceiptImage = async (
    file: Buffer,
    fileName: string,
    contentType: string = 'image/jpeg'
): Promise<string> => {
    try {
        // Firebase Admin Storageの初期化
        const adminApp = getAdminApp();
        const bucket = getStorage(adminApp).bucket();

        // ファイルパスを生成（タイムスタンプを含む）
        const filePath = `receipts/${Date.now()}-${fileName}`;
        const fileRef = bucket.file(filePath);

        // Bufferをアップロード
        await fileRef.save(file, {
            metadata: {
                contentType,
                cacheControl: 'public, max-age=31536000',
            },
        });

        // ダウンロードURLを取得
        await fileRef.makePublic();
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        return downloadURL;
    } catch (error) {
        console.error('Failed to upload receipt image:', error);
        throw new Error('画像のアップロードに失敗しました');
    }
};

// 画像の削除
export const deleteReceiptImage = async (imageUrl: string): Promise<void> => {
    try {
        const adminApp = getAdminApp();
        const bucket = getStorage(adminApp).bucket();

        // URLからファイルパスを抽出
        const urlObj = new URL(imageUrl);
        const pathMatch = urlObj.pathname.match(/\/([^\/]+\/[^\/\?]+)/);
        
        if (pathMatch && pathMatch[1]) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const fileRef = bucket.file(filePath);
            await fileRef.delete();
        }
    } catch (error) {
        console.error('Failed to delete receipt image:', error);
        // エラーは無視して続行（画像が既に削除されている可能性がある）
    }
};

// ダウンロードURLの再取得（既存の画像URL用）
export const refreshDownloadUrl = async (filePath: string): Promise<string> => {
    try {
        const adminApp = getAdminApp();
        const bucket = getStorage(adminApp).bucket();
        const fileRef = bucket.file(filePath);
        
        await fileRef.makePublic();
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        return downloadURL;
    } catch (error) {
        console.error('Failed to refresh download URL:', error);
        throw error;
    }
};

