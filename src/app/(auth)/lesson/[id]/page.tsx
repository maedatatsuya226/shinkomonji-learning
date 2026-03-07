"use client";
export const runtime = 'edge';

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGasApi, getSessionToken } from "@/lib/api";

type LessonData = {
    lesson_id: string;
    title: string;
    video_url: string;
    question: string;
};

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [answer, setAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            try {
                // 並行して視聴ログと動画取得を行う
                fetchGasApi("recordView", { token, lessonId }).catch(e => console.error(e));

                const res = await fetchGasApi("getLesson", { token, lessonId });
                if (res.ok) {
                    setLesson(res.lesson);
                } else {
                    setError(res.message || "レッスン情報の取得に失敗しました");
                }
            } catch (err) {
                setError("通信エラーが発生しました");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;

        if (!confirm("送信しますか？（送信後の修正はできません）")) return;

        setSubmitting(true);
        setSubmitMsg("");

        const token = getSessionToken();
        try {
            const res = await fetchGasApi("submitFeedback", { token, lessonId, answer });
            if (res.ok) {
                setAnswer("");
                setSubmitMsg("✅ 送信しました！お疲れ様でした。");
                setTimeout(() => router.push("/library"), 2000);
            } else {
                alert("送信失敗: " + (res.message || "不明なエラー"));
            }
        } catch (err) {
            alert("通信エラーが発生しました");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="bg-red-950/50 text-red-500 p-8 rounded-lg text-center font-medium border border-red-900/50 max-w-xl mx-auto mt-20">
                {error || "データが見つかりません"}
                <div className="mt-6">
                    <button onClick={() => router.push("/library")} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/80 transition-colors">
                        ライブラリに戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-700 pb-20 max-w-[1600px] mx-auto">

            {/* Nav area */}
            <div className="flex items-center justify-between mb-8 px-2">
                <button
                    onClick={() => router.push("/library")}
                    className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-semibold"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    一覧に戻る
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
                {/* Main Video Area */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800/50 relative w-full aspect-video ring-1 ring-white/10">
                        {lesson.video_url ? (
                            <iframe
                                src={lesson.video_url}
                                title={lesson.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500 font-semibold">動画URLが未設定です</div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg">{lesson.title}</h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">ID: {lesson.lesson_id} •
                            <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="ml-2 bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors">別タブで開く</a>
                        </p>
                    </div>
                </div>

                {/* Feedback Panel */}
                <div className="xl:w-[450px] flex-shrink-0">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-full flex flex-col overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="p-6 border-b border-zinc-800/50">
                            <h2 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>
                                課題・感想
                            </h2>
                        </div>

                        <div className="p-6 flex-1 flex flex-col gap-6 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">質問内容</label>
                                <div className="bg-zinc-950/50 rounded-lg p-5 text-sm leading-relaxed font-medium text-zinc-300 border border-zinc-800/50 shadow-inner">
                                    {lesson.question || "この動画を見て学んだことや、抱いた感想を入力してください。"}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                                <div className="flex-1 min-h-[200px] flex flex-col">
                                    <label htmlFor="answer" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        あなたの回答
                                    </label>
                                    <textarea
                                        id="answer"
                                        required
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full flex-1 p-5 rounded-lg border border-zinc-700 bg-zinc-800/80 text-white placeholder-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none shadow-inner"
                                        placeholder="回答を入力..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting || !answer.trim()}
                                        className="w-full py-4 px-6 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-500 hover:shadow-orange-600/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>送信中...</span>
                                            </>
                                        ) : "回答を送信"}
                                    </button>

                                    {submitMsg && (
                                        <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-900/50 rounded text-center font-bold text-emerald-500 text-sm animate-in fade-in">
                                            {submitMsg}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
