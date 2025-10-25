import { UpdateExpenseTypeRequest, UpdateExpenseTypeResponse, DeleteExpenseTypeResponse } from './type';

// 経費タイプ更新
export async function updateExpenseType(id: string, data: UpdateExpenseTypeRequest): Promise<UpdateExpenseTypeResponse> {
    const response = await fetch(`/api/expense-types/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// 経費タイプ削除
export async function deleteExpenseType(id: string): Promise<DeleteExpenseTypeResponse> {
    const response = await fetch(`/api/expense-types/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}

