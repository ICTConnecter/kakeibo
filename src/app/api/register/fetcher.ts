import { RegisterResponse } from './types';

const BASE_URL = '/api/register';

// ユーザー登録
export async function registerUser(token: string): Promise<RegisterResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer:${token}`,
        },
    });
    return response.json();
}

