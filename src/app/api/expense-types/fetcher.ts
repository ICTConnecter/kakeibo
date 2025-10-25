import { GetExpenseTypesQuery, CreateExpenseTypeRequest, GetExpenseTypesResponse, CreateExpenseTypeResponse } from './type';

const BASE_URL = '/api/expense-types';

// 経費タイプ一覧取得
export async function getExpenseTypes(query: GetExpenseTypesQuery): Promise<GetExpenseTypesResponse> {
    const params = new URLSearchParams({ householdId: query.householdId });
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    return response.json();
}

// 経費タイプ登録
export async function createExpenseType(data: CreateExpenseTypeRequest): Promise<CreateExpenseTypeResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

