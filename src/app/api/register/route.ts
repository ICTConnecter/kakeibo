import { NextResponse } from 'next/server';
import { PostReqType } from './types';
import { db } from '@/utils/firebase/initializeApp';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { User } from '@/types/firestore/User';

export async function POST(request: Request) {

  // tokenの検証
  const header = request.headers
  const idToken = header.get("Authorization")?.split(":")[1]
  if (!idToken) {
    return NextResponse.json({ error: "Authorization header is required" }, { status: 401 })
  }
  const decodeResult = await decodeIdToken(idToken)

  // ReqBodyの取得
  const reqBody: PostReqType = await request.json()

  // 登録済みのデータかどうかの確認
  const duplicateCheckSnap = await getDoc(doc(db, "users", decodeResult.sub))
  if (duplicateCheckSnap.exists()) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 })
  }

  // 登録用データの成形
  const date = new Date().getTime()
  const user: User = {
    lineId: decodeResult.sub,
    createAt: date,
    updateAt: date,
    like: reqBody.like
  }

  // データの追加 
  try {
    const docSnap = await addDoc(collection(db, "users"), user)
    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}