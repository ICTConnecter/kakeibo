import { GetCategoriesQuery, CreateCategoryRequest, GetCategoriesResponse, CreateCategoryResponse } from './type';

const BASE_URL = '/api/categories';

// カテゴリ一覧取得
export async function getCategories(query: GetCategoriesQuery): Promise<GetCategoriesResponse> {
    const params = new URLSearchParams({ householdId: query.householdId });
    if (query.type) {
        params.append('type', query.type);
    }
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    return response.json();
}

// カテゴリ登録
export async function createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

