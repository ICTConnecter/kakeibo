import { GetIncomesQuery, CreateIncomeRequest, GetIncomesResponse, CreateIncomeResponse } from './type';

const BASE_URL = '/api/incomes';

// 収入一覧取得
export async function getIncomes(query: GetIncomesQuery): Promise<GetIncomesResponse> {
    const params = new URLSearchParams({ householdId: query.householdId });
    
    if (query.categoryId) params.append('categoryId', query.categoryId);
    if (query.walletId) params.append('walletId', query.walletId);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    return response.json();
}

// 収入登録
export async function createIncome(data: CreateIncomeRequest): Promise<CreateIncomeResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

