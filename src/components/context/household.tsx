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
  refetch: () => void;
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
    console.log("fetchHouseholdに関する情報の取得を開始しました。householdId:", id);
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
        categoriesRes.json(),
        walletsRes.json(),
        expenseTypesRes.json(),
        incomesRes.json(),
        expensesRes.json(),
      ]);

      // データをセット
      if (categoriesData.success && categoriesData.categories) {
        setCategories(categoriesData.categories);
      }
      if (walletsData.success && walletsData.wallets) {
        setWallets(walletsData.wallets);
      }
      if (expenseTypesData.success && expenseTypesData.expenseTypes) {
        setExpenseTypes(expenseTypesData.expenseTypes);
      }
      if (incomesData.success && incomesData.incomes) {
        setIncomes(incomesData.incomes);
      }
      if (expensesData.success && expensesData.expenses) {
        setExpenses(expensesData.expenses);
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
    console.log("userInfoが変更されました。↓");
    console.log(JSON.stringify(userInfo));
    if(!householdId) {
      setHouseholdId(userInfo?.households?.[0]?.householdId || null);
    }
  }, [userInfo]);

  // householdIdが変更されたときに実行
  useEffect(() => {
    console.log("householdComponentが読み込まれました。householdId:", householdId);
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
  const refetch = () => {
    if (householdId) {
      fetchHouseholdData(householdId);
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

