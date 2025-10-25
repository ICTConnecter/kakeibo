import { UpdateIncomeRequest, GetIncomeResponse, UpdateIncomeResponse, DeleteIncomeResponse } from './type';

// 収入詳細取得
export async function getIncome(id: string): Promise<GetIncomeResponse> {
    const response = await fetch(`/api/incomes/${id}`);
    return response.json();
}

// 収入更新
export async function updateIncome(id: string, data: UpdateIncomeRequest): Promise<UpdateIncomeResponse> {
    const response = await fetch(`/api/incomes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// 収入削除
export async function deleteIncome(id: string): Promise<DeleteIncomeResponse> {
    const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}

