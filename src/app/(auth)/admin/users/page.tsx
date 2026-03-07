"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

type UserProgress = {
    staffId: string;
    name: string;
    dept: string;
    joinYear: number;
    progress: string;
    rate: number;
    progressAnswer: string;
    rateAnswer: number;
    unwatched: string[];
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            try {
                const res = await fetchGasApi("getAdminUsers", { token });
                if (res.ok) {
                    setUsers(res.list || []);
                } else {
                    setError(res.message || "データ取得に失敗しました");
                }
            } catch (err) {
                setError("通信エラーが発生しました");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-950/50 text-red-500 p-6 rounded-lg text-center font-medium border border-red-900/50 max-w-xl mx-auto">
                {error}
                <div className="mt-6">
                    <button onClick={() => router.push("/library")} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/80 transition-colors">ライブラリに戻る</button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <span className="bg-red-900/40 text-red-500 border border-red-900/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">ADMIN</span>
                        新人進捗一覧
                    </h1>
                    <p className="text-zinc-500 font-semibold text-sm mt-2">対象者: <span className="text-white font-bold">{users.length}</span> 名</p>
                </div>
                <button
                    onClick={() => router.push("/library")}
                    className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-semibold"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    ライブラリに戻る
                </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-600/5 to-transparent pointer-events-none"></div>
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950/50">
                                <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest w-[20%]">氏名</th>
                                <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest w-[25%]">視聴状況</th>
                                <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest w-[25%]">回答状況</th>
                                <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">残タスク（未視聴）</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-zinc-500 font-medium">
                                        対象の新人データがありません
                                    </td>
                                </tr>
                            ) : (
                                users.map((u, i) => (
                                    <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-5 align-top">
                                            <div className="font-bold text-white text-lg">{u.name}</div>
                                            <div className="text-xs text-zinc-400 mt-1 font-semibold">
                                                {u.dept} ({u.joinYear})
                                            </div>
                                            <div className="text-[10px] text-zinc-600 font-mono mt-1">{u.staffId}</div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="text-xs font-bold text-zinc-400 mb-2 flex justify-between">
                                                <span>見た動画: <strong className="text-white text-sm">{u.progress}</strong></span>
                                                <span className={u.rate >= 100 ? "text-emerald-500" : "text-zinc-500"}>{u.rate}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${u.rate >= 100 ? "bg-emerald-500" :
                                                        u.rate >= 50 ? "bg-orange-500" : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${u.rate}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            <div className="text-xs font-bold text-zinc-400 mb-2 flex justify-between">
                                                <span>出した感想: <strong className="text-white text-sm">{u.progressAnswer}</strong></span>
                                                <span className={u.rateAnswer >= 100 ? "text-emerald-500" : "text-zinc-500"}>{u.rateAnswer}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${u.rateAnswer >= 100 ? "bg-emerald-500" :
                                                        u.rateAnswer >= 50 ? "bg-orange-500" : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${u.rateAnswer}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 align-top">
                                            {u.unwatched.length === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/50 text-[11px] font-bold text-emerald-500 border border-emerald-900/50 tracking-wide uppercase">
                                                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                                    全視聴完了
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {u.unwatched.map((title, idx) => (
                                                        <span key={idx} className="px-2.5 py-1.5 bg-zinc-800 text-zinc-300 border border-zinc-700/50 rounded text-xs font-semibold max-w-[200px] truncate" title={title}>
                                                            {title}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
