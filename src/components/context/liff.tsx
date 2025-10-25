"use client"
// import { z } from "zod";
import { ReactNode, createContext, useEffect, useState } from "react";
import liff, { Liff } from "@line/liff";
import { decodeIdToken, DecodeIdTokenResult } from "../../utils/line/decodeIdToken"

type Props = {
  children: ReactNode | null;
};

/** 【Context】liffContextーーLIFF関連のContext。
 * * 関連事項
 * * * 【Component】LiffーーLIFF関連のComponent。
 * * * 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * * 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 * * * 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 */
export const LiffContext = createContext<LiffContextType>(
  {} as LiffContextType
);

/** 【Component】LiffComponentーーLIFF関連のComponent。
 * * 関連事項
 * * * 【Context】liffContextーーLIFF関連のContext。
 * * * 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * * 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 * * * 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 */
export const LiffComponent = ({ children }: Props) => {
  // State定義
  const [idToken, setIdToken] = useState<string | null>(null);
  const [decodeResult, setDecodeResult] = useState<DecodeIdTokenResult | null>(null);
  const [liffObject, setLiffObject] = useState<Liff | null>(null)
  const [liffError, setLiffError] = useState<boolean>(false)

  // IdTokenとLine情報の取得
  useEffect(() => {
    // テストモードの場合
    if (process.env.NEXT_PUBLIC_TEST_ID_TOKEN) {
      const setTestData = async () => {
        if (!process.env.NEXT_PUBLIC_TEST_ID_TOKEN) return;
        setIdToken(process.env.NEXT_PUBLIC_TEST_ID_TOKEN);
        setDecodeResult(await decodeIdToken(process.env.NEXT_PUBLIC_TEST_ID_TOKEN));
        console.log("テストモードのデータを設定しました");
        console.log("idToken", idToken);
        console.log("decodeResult", decodeResult);
      }
      setTestData();
      return;
    }
    if (
      !process.env.NEXT_PUBLIC_LIFF_ID
    ) {
      throw new Error("unable to get LIFF_ID ");
    }
    liff
      .init({
        liffId: process.env.NEXT_PUBLIC_LIFF_ID!
      })
      .then(async () => {
        setLiffObject(liff)
        if (liff.isLoggedIn()) {
          const idToken = liff.getIDToken();
          if (idToken) {
            setIdToken(idToken);
            setDecodeResult(await decodeIdToken(idToken));
          }
        }
      })
      .catch((error: Error) => {
        setLiffError(true)
      });
  }, []);

  // テスト環境作成用
  useEffect(() => {
    console.log("idToken", idToken);
    console.log("decodeResult", decodeResult);
  }, [idToken, decodeResult]);

  return (
    <>
      <LiffContext.Provider
        value={{
          idToken,
          decodeResult,
          liffObject
        }}
      >
        {liffError ? "LINE専用アプリです。LINEで開き直してください。" : children}
      </LiffContext.Provider>
    </>
  );
};

// Type関連
/** 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * 関連事項
 * * * 【Context】liffContextーーLIFF関連のContext。
 * * * 【Component】LiffーーLIFF関連のComponent。
 * * * 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 * * * 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 */
// export type DecodeIdTokenResult = {
//   iss: string,
//   sub: string,
//   aud: string,
//   exp: number,
//   iat: number,
//   auth_time ?: number | undefined,
//   nonce ?: string | undefined,
//   amr ?: string[] | undefined,
//   name ?: string | undefined,
//   picture ?: string | undefined,
//   email ?: string | undefined,
// }

/** 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 * * 関連事項
 * * * 【Context】liffContextーーLIFF関連のContext。
 * * * 【Component】LiffーーLIFF関連のComponent。
 * * * 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * * 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 */
// export const liffContextType = z.object({
//   idToken: z.string().nullable(),
//   decodeResult: decodeIdTokenResult.nullable(),
//   liffObject: z.record(z.any()).transform((v) => v as Liff).optional(),
// });
/** 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 * * 関連事項
 * * * 【Context】liffContextーーLIFF関連のContext。
 * * * 【Component】LiffーーLIFF関連のComponent。
 * * * 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * * 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 */
// export type LiffContextType = z.infer<typeof liffContextType>;
export type LiffContextType = {
  idToken: string | null,
  decodeResult: DecodeIdTokenResult | null,
  liffObject: Liff | null,
}
