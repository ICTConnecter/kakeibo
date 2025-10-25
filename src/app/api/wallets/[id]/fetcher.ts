import { UpdateWalletRequest, UpdateWalletResponse, DeleteWalletResponse } from './type';

// ウォレット更新
export async function updateWallet(id: string, data: UpdateWalletRequest): Promise<UpdateWalletResponse> {
    const response = await fetch(`/api/wallets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// ウォレット削除
export async function deleteWallet(id: string): Promise<DeleteWalletResponse> {
    const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}

