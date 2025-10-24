import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '../firebase/initializeApp';

// Firebase Storageの初期化
const storage = getStorage(firebaseApp);

// レシート画像のアップロード
export const uploadReceiptImage = async (
    file: Buffer,
    fileName: string,
    contentType: string = 'image/jpeg'
): Promise<string> => {
    try {
        // ファイルパスを生成（タイムスタンプを含む）
        const filePath = `receipts/${Date.now()}-${fileName}`;
        const storageRef = ref(storage, filePath);

        // Bufferをアップロード
        const metadata = {
            contentType,
            cacheControl: 'public, max-age=31536000',
        };

        await uploadBytes(storageRef, file, metadata);

        // ダウンロードURLを取得
        const downloadURL = await getDownloadURL(storageRef);
        
        return downloadURL;
    } catch (error) {
        console.error('Failed to upload receipt image:', error);
        throw new Error('画像のアップロードに失敗しました');
    }
};

// 画像の削除
export const deleteReceiptImage = async (imageUrl: string): Promise<void> => {
    try {
        // URLからファイルパスを抽出
        const urlObj = new URL(imageUrl);
        const pathMatch = urlObj.pathname.match(/o\/(.+?)\?/);
        
        if (pathMatch && pathMatch[1]) {
            // URLエンコードされたパスをデコード
            const filePath = decodeURIComponent(pathMatch[1]);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
        }
    } catch (error) {
        console.error('Failed to delete receipt image:', error);
        // エラーは無視して続行（画像が既に削除されている可能性がある）
    }
};

// ダウンロードURLの再取得（既存の画像URL用）
export const refreshDownloadUrl = async (filePath: string): Promise<string> => {
    try {
        const storageRef = ref(storage, filePath);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Failed to refresh download URL:', error);
        throw error;
    }
};

