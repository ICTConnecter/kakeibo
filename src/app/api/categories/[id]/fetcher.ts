import { UpdateCategoryRequest, UpdateCategoryResponse, DeleteCategoryResponse } from './type';

// カテゴリ更新
export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

// カテゴリ削除
export async function deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
    });
    return response.json();
}

