import { Category } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type UpdateCategoryRequest = Partial<Omit<Category, 'categoryId' | 'householdId' | 'isDefault' | 'createdAt'>>;

// レスポンス型
export type UpdateCategoryResponse = ApiResponse<Category>;
export type DeleteCategoryResponse = ApiResponse;

