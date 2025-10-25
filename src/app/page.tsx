"use client"
import { use } from "react";
import { UserAuthComponent } from "@/components/context/user";
import { LiffContext } from "@/components/context/liff";
import Image from "next/image";


export default function Home() {
  const { decodeResult } = use(LiffContext)
  // const { userInfo } = use(UserAuthContext)
  return (
    <>
      <UserAuthComponent>
        <div className="flex flex-col space-x-4 mx-auto">
          {decodeResult?.picture && (
            <Image
              src={decodeResult.picture}
              alt="プロフィール画像"
              width={144}
              height={144}
              className="rounded-full object-cover"
            />
          )}
          <div className="w-full mt-4 max-w-80">
            <h3 className="text-xl font-bold">{decodeResult?.name}</h3>
          </div>
        </div>
      </UserAuthComponent>
    </>
  );
}
