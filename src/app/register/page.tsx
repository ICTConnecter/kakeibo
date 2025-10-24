"use client"
import { use, useState } from "react"
import { PostReqType } from "../api/register/types"
import { DisplayLiffInfo } from "@/components/displayLiffInfo"
import { LiffContext } from "@/components/context/liff"

const Register = () => {
    const liffInfo = use(LiffContext)
    const [todo, setTodo] = useState<string[]>([""])
    return <>
        <div className="flex flex-col items-center h-screen mt-10 mx-10">
            <h1 className="text-2xl font-bold mb-5">登録ページ</h1>
            <div className="w-full mb-5">
                <p className="font-bold">Liff取得情報</p>
                <DisplayLiffInfo />
            </div>
            <div className="w-full mb-5">
                <p className="font-bold">好きなものを登録してください</p>
                <div className="flex flex-col items-center">
                    {
                        todo.map((v, i) =>
                            <div key={v + i}>
                                <input type="text" defaultValue={v} className="border-2 border-gray-300 rounded-md p-2 mb-1" onChange={(e) => {
                                    setTodo(prev => {
                                        prev[i] = e.target.value
                                        return prev
                                    })
                                }} />
                                <button className="outline-gray-300 border-2 border-gray-300 p-2 rounded-md" onClick={() => {
                                    setTodo(prev => prev.filter((value, index) => i !== index))
                                }}>✖</button>
                            </div>
                        )
                    }
                    <button className="bg-blue-500 text-white p-2 px-4 rounded-md" onClick={() => {
                        setTodo(prev => [...prev, ""])
                    }}>追加</button>
                </div>
            </div>
            <button className="bg-green-600 text-white p-2 px-4 rounded-md mt-5" onClick={() => {
                const reqBody: PostReqType = {
                    like: todo.filter(v => v !== "")
                }
                fetch("/api/register", {
                    method: "POST",
                    headers: {
                        'Authorization': 'Bearer: ' + liffInfo.idToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reqBody)
                }).then(res => {
                    if (res.status === 200) {
                        console.log("登録成功")
                        window.location.href = "/"
                    } else {
                        console.log("登録失敗")
                    }
                })
            }}>登録</button>
        </div>
    </>
}

export default Register