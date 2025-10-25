import { AuthResponse } from './types';

const BASE_URL = '/api/auth';

// 認証（ユーザー情報取得）
export async function authenticate(token: string): Promise<AuthResponse> {
    const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer:${token}`,
        },
    });
    return response.json();
}

