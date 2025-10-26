"use client"
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Household } from "@/types/firestore/Household";
import { Category } from "@/types/firestore/Category";
import { Wallet } from "@/types/firestore/Wallet";
import { ExpenseType } from "@/types/firestore/ExpenseType";
import { Income } from "@/types/firestore/Income";
import { Expense } from "@/types/firestore/Expense";
import { UserAuthContext, UserContextType } from "./user";
import { GetCategoriesResponse } from "@/app/api/categories/type";
import { GetExpenseTypesResponse } from "@/app/api/expense-types/type";
import { GetWalletsResponse } from "@/app/api/wallets/type";

type Props = {
  children: ReactNode | null;
};

/**
 * 【Type】HouseholdContextType―Household関連のcontextのType。
 */
export type HouseholdContextType = {
  householdId: string | null;
  household: Household | null;
  categories: Category[];
  wallets: Wallet[];
  expenseTypes: ExpenseType[];
  incomes: Income[];
  expenses: Expense[];
  setHouseholdId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 【Context】HouseholdContext―Household関連のContext。
 */
export const HouseholdContext =
  createContext<HouseholdContextType>({} as HouseholdContextType);

/**
 * 【Component】HouseholdComponent―Household関連のComponent。
 */
export const HouseholdComponent = ({ children }: Props) => {
  const { userInfo, idToken } = useContext<UserContextType>(UserAuthContext);
  
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // householdIdが変更されたときにデータを取得
  const fetchHouseholdData = useCallback(async (id: string) => {
    if (!idToken && process.env.NEXT_PUBLIC_MODE!== "test") return;

    setLoading(true);
    setError(null);

    try {
      // 並列でデータを取得
      const [
        categoriesRes,
        walletsRes,
        expenseTypesRes,
        incomesRes,
        expensesRes,
      ] = await Promise.all([
        fetch(`/api/categories?householdId=${id}`, {
          headers: {
            'Authorization': `Bearer:${idToken || process.env.NEXT_PUBLIC_MODE}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/wallets?householdId=${id}`, {
          headers: {
            'Authorization': `Bearer:${idToken || process.env.NEXT_PUBLIC_MODE}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/expense-types?householdId=${id}`, {
          headers: {
            'Authorization': `Bearer:${idToken || process.env.NEXT_PUBLIC_MODE}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/incomes?householdId=${id}`, {
          headers: {
            'Authorization': `Bearer:${idToken || process.env.NEXT_PUBLIC_MODE}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/expenses?householdId=${id}`, {
          headers: {
            'Authorization': `Bearer:${idToken || process.env.NEXT_PUBLIC_MODE}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // レスポンスをJSONに変換
      const [
        categoriesData,
        walletsData,
        expenseTypesData,
        incomesData,
        expensesData,
      ] = await Promise.all([
        categoriesRes.json() as Promise<GetCategoriesResponse>,
        walletsRes.json() as Promise<GetWalletsResponse>,
        expenseTypesRes.json() as Promise<GetExpenseTypesResponse>,
        incomesRes.json(),
        expensesRes.json(),
      ]);

      console.log("incomesData", incomesData);
      console.log("expensesData", expensesData);
      console.log("expensesData.data", expensesData.data);

      // データをセット
      if (categoriesData.success && categoriesData.data) {
        setCategories(categoriesData.data);
      }
      if (walletsData.success && walletsData.data) {
        setWallets(walletsData.data);
      }
      if (expenseTypesData.success && expenseTypesData.data) {
        setExpenseTypes(expenseTypesData.data);
      }
      if (incomesData.success && incomesData.data.incomes) {
        console.log("incomesDataが変更されました。↓");
        console.log(JSON.stringify(incomesData.data.incomes));
        setIncomes(incomesData.data.incomes);
      }
      if (expensesData.success && expensesData.data.expenses) {
        console.log("expensesDataが変更されました。↓");
        console.log(JSON.stringify(expensesData.data.expenses));
        setExpenses(expensesData.data.expenses);
      }

      // household情報を仮設定（実際のAPIから取得する場合は調整してください）
      setHousehold({
        householdId: id,
        name: "家計簿", // 実際のAPIから取得する必要があります
        ownerId: userInfo?.userId || "",
        members: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

    } catch (err) {
      console.error('Household data fetch error:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [idToken, userInfo]);

  useEffect(() => {
    if(!householdId) {
      setHouseholdId(userInfo?.households?.[0]?.householdId || null);
    }
  }, [userInfo]);

  // householdIdが変更されたときに実行
  useEffect(() => {
    if ((householdId && idToken) || (householdId && process.env.NEXT_PUBLIC_MODE === "test")) {
      fetchHouseholdData(householdId);
    } else {
      // householdIdがnullの場合はデータをクリア
      setHousehold(null);
      setCategories([]);
      setWallets([]);
      setExpenseTypes([]);
      setIncomes([]);
      setExpenses([]);
    }
  }, [householdId, idToken, fetchHouseholdData]);

  // 再取得用の関数
  const refetch = async () => {
    if (householdId) {
      await fetchHouseholdData(householdId);
    }
  };

  return (
    <HouseholdContext.Provider
      value={{
        householdId,
        household,
        categories,
        wallets,
        expenseTypes,
        incomes,
        expenses,
        setHouseholdId,
        loading,
        error,
        refetch,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

