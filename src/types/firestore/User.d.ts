export type User = {
    // 必須項目
    lineId: string;
    createAt: number;
    updateAt: number;
    // 目的に合わせて項目を追加
    like: string[];
}
