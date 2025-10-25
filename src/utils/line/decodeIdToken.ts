// import { z } from "zod";

/** 【Function】decodeIDTokenーーLIFF関連のidをdecodeするFunction。
 * * 関連事項
 * * * 【Context】liffContextーーLIFF関連のContext。
 * * * 【Component】LiffーーLIFF関連のComponent。
 * * * 【ZodObject】decodeIdTokenResultーーLIFF関連のデコード後のZodObject。
 * * * 【Type】DecodeIdTokenResultーーLIFF関連のデコード後のType。
 * * * 【ZodObject】liffContextTypeーーLIFF関連のliffContextのZodObject。
 * * * 【Type】LiffContextTypeーーLIFF関連のliffContextのType。
 */
export const decodeIdToken = async (
  idToken: string
): Promise<DecodeIdTokenResult> => {
  // テスト用のIDトークンが設定されている場合はテスト用のデータを返す
  if (process.env.NEXT_PUBLIC_MODE && process.env.NEXT_PUBLIC_MODE === idToken) {
    return {
      iss: process.env.NEXT_PUBLIC_LINE_ISS || "",
      sub: process.env.NEXT_PUBLIC_LINE_SUB || "",
      aud: process.env.NEXT_PUBLIC_LINE_AUD || "",
      exp: Number(process.env.NEXT_PUBLIC_LINE_EXP) || 0,
      iat: Number(process.env.NEXT_PUBLIC_LINE_IAT) || 0,
      name: process.env.NEXT_PUBLIC_LINE_NAME + "(TEST MODE)" || "",
    };
  }
  
  const url = "https://api.line.me/oauth2/v2.1/verify";
  const params = new URLSearchParams();
  params.append('id_token', idToken);
  params.append('client_id', process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!);
  
  const result = await fetch(url, {
    method: `POST`,
    body: params.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((r) => r.json());

  if (result.error) {
    throw new Error();
  }

  return result;
};

// const decodeIdTokenResult = z.object({
//   iss: z.string(),
//   sub: z.string(),
//   aud: z.string(),
//   exp: z.number(),
//   iat: z.number(),
//   auth_time: z.number().optional(),
//   nonce: z.string().optional(),
//   amr: z.array(z.string()).optional(),
//   name: z.string().optional(),
//   picture: z.string().optional(),
//   email: z.string().optional(),
// });
// type DecodeIdTokenResult = z.infer<typeof decodeIdTokenResult>;
export type DecodeIdTokenResult = {
  iss: string,
  sub: string,
  aud: string,
  exp: number,
  iat: number,
  auth_time?: number | undefined,
  nonce?: string | undefined,
  amr?: string[] | undefined,
  name?: string | undefined,
  picture?: string | undefined,
  email?: string | undefined,
}