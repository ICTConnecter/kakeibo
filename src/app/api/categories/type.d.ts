import { Category, CategoryType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type GetCategoriesQuery = {
    householdId: string;
    type?: CategoryType;
};

export type CreateCategoryRequest = {
    householdId: string;
    type: CategoryType;
    name: string;
    icon: string;
    color: string;
};

// レスポンス型
export type GetCategoriesResponse = ApiResponse<Category[]>;
export type CreateCategoryResponse = ApiResponse<Category>;

