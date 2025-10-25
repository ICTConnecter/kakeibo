import { UpdateExpenseRequest, GetExpenseResponse, UpdateExpenseResponse, DeleteExpenseResponse } from './type';

// 支出詳細取得
export async function getExpense(id: string): Promise<GetExpenseResponse> {
    const response = await fetch(`/api/expenses/${id}`);
    return response.json();
}

// 支出更新
export async function updateExpense(id: string, data: UpdateExpenseRequest): Promise<UpdateExpenseResponse> {
    const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// 支出削除
export async function deleteExpense(id: string): Promise<DeleteExpenseResponse> {
    const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}

