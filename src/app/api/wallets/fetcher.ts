import { GetWalletsQuery, CreateWalletRequest, GetWalletsResponse, CreateWalletResponse } from './type';

const BASE_URL = '/api/wallets';

// ウォレット一覧取得
export async function getWallets(query: GetWalletsQuery): Promise<GetWalletsResponse> {
    const params = new URLSearchParams({ householdId: query.householdId });
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    return response.json();
}

// ウォレット登録
export async function createWallet(data: CreateWalletRequest): Promise<CreateWalletResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

