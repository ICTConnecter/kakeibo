import { NextResponse, NextRequest } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase/initializeApp';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { GetResType } from './types';
import { User } from '@/types/firestore/User';

export async function GET(req: NextRequest) {

  try {
    // reqのBearerからtokenを受け取る
    // const token = req.headers.get("Authorization")
    const token = req.headers.get("Authorization")?.split(":")[1]
    if (!token) {
      return NextResponse.json({ error: "Tokenが設定されていません。" }, { status: 400 })
    }
    // Tokenのdecode
    const tokeDecodeResult = await decodeIdToken(token)

    const q = query(
      collection(db, "users"),
      where("lineId", "==", tokeDecodeResult.sub)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // 登録情報が無かった場合
      return NextResponse.json({ error: "登録情報が見当たりませんでした。" }, { status: 401 })
    } else {
      const doc = querySnapshot.docs[0]
      const rec: Omit<User, 'lineId'> & Partial<Pick<User, 'lineId'>> = doc.data() as User
      delete rec.lineId
      const data: GetResType = rec

      // return res.status(200).end(JSON.stringify(resBody));
      return NextResponse.json(data, { status: 200 })
    }

  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}



