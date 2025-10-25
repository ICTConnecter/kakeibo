import { NextRequest } from 'next/server';

/**
 * リクエストヘッダーからトークンを取得する
 * @param request - NextRequest
 * @returns トークン文字列
 * @throws トークンが見つからない場合はエラーをthrow
 */
export function getTokenFromRequest(request: NextRequest): string {
    const token = request.headers.get('Authorization')?.split(':')[1];
    
    if (!token) {
        throw new Error('Tokenが設定されていません。');
    }
    
    return token;
}

