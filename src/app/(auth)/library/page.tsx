"use client";
export const runtime = 'edge';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchGasApi, getSessionToken } from "@/lib/api";

const CircularProgress = ({ percent, colorClass, label }: { percent: number; colorClass: string; label: string }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // 数値が変化した後、少し遅らせてアニメーションを開始する
        const timer = setTimeout(() => setOffset(percent), 150);
        return () => clearTimeout(timer);
    }, [percent]);

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (offset / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center group">
            <div className="relative w-28 h-28 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" className="stroke-zinc-800" strokeWidth="6" />
                    <circle
                        cx="50" cy="50" r={radius} fill="none"
                        className={`transition-all duration-1000 ease-out ${colorClass}`}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{percent}%</span>
                </div>
            </div>
            <span className="mt-3 text-sm font-semibold text-zinc-400">{label}</span>
        </div>
    );
};

type Lesson = {
    lesson_id: string;
    title: string;
    order: number;
    video_url: string;
    thumbnail: string;
    tags: string[];
    required: boolean;
    views_30d: number;
    hasViewed: boolean;
    hasAnswered: boolean;
};

type Stats = {
    total: number;
    viewed: number;
    answered: number;
    viewRate: number;
    answerRate: number;
};

export default function LibraryPage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isTarget, setIsTarget] = useState(false);
    const [userRole, setUserRole] = useState("staff");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = getSessionToken();
            if (!token) {
                router.replace("/");
                return;
            }
            const res = await fetchGasApi("getLibrary", { token, q: "" });
            if (res.ok) {
                setLessons(res.lessons || []);
                setStats(res.stats || null);
                setIsTarget(res.isTarget || false);
                setUserRole(res.userRole || "staff");
            } else {
                setError(res.message || "データ取得に失敗しました");
            }
        } catch (err) {
            setError("通信エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        lessons.forEach(l => l.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [lessons]);

    const filteredLessons = useMemo(() => {
        return lessons.filter((l) => {
            if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (tagFilter && (!l.tags || !l.tags.includes(tagFilter))) return false;
            return true;
        });
    }, [lessons, searchQuery, tagFilter]);

    const showDashboard = isTarget || userRole === "admin";

    const renderDashboard = () => {
        if (!stats || stats.total === 0) return null;

        let msg = "マイリストをチェックしましょう。";
        if (stats.answerRate === 100) msg = "全ての課題を完了しました！素晴らしい！";
        else if (stats.viewRate === 100) msg = "全動画の視聴完了！あとは感想の提出です。";
        else if (stats.viewRate >= 50) msg = "折り返し地点です。その調子！";

        return (
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-600/5 to-transparent pointer-events-none"></div>
                <h2 className="text-lg font-bold text-zinc-100 mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-orange-600 rounded-full"></span>
                    学習の進捗状況
                </h2>
                <div className="flex flex-col md:flex-row gap-8 items-center lg:items-stretch">
                    <div className="flex gap-8 justify-center items-center">
                        <CircularProgress percent={stats.viewRate} colorClass="stroke-zinc-300" label="視聴完了" />
                        <CircularProgress percent={stats.answerRate} colorClass="stroke-orange-600" label="課題完了" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-4 w-full">
                        <div className="bg-zinc-950/50 rounded-md p-4 border border-zinc-800">
                            <span className="block text-xs font-bold text-zinc-500 mb-1 uppercase tracking-wider">Status message</span>
                            <span className="text-lg font-bold text-zinc-100">{msg}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm font-semibold">
                            <div className="bg-zinc-800 px-3 py-1.5 rounded text-zinc-300 border border-zinc-700">
                                必須: <span className="text-white ml-1">{stats.total}</span>
                            </div>
                            <div className="bg-zinc-800 px-3 py-1.5 rounded text-zinc-300 border border-zinc-700">
                                未視聴: <span className="text-orange-400 ml-1">{stats.total - stats.viewed}</span>
                            </div>
                            <div className="bg-zinc-800 px-3 py-1.5 rounded text-zinc-300 border border-zinc-700">
                                未回答: <span className="text-orange-400 ml-1">{stats.total - stats.answered}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-700 pb-20 w-full overflow-hidden line-clamp-1 pointer-events-none">
                {/* Skeleton Hero */}
                <div className="w-full h-[50vh] min-h-[400px] mb-8 lg:mb-12 rounded-xl bg-zinc-900 border border-zinc-800/50 relative overflow-hidden flex items-end">
                    <div className="absolute inset-0 z-0 bg-zinc-800/20 animate-pulse"></div>
                    <div className="relative z-10 w-full px-6 md:px-12 pb-10 space-y-4">
                        <div className="w-16 h-4 bg-zinc-800 rounded animate-pulse"></div>
                        <div className="w-3/4 h-12 md:h-16 lg:h-20 bg-zinc-800 rounded-lg animate-pulse"></div>
                        <div className="flex gap-3">
                            <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse"></div>
                            <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <div className="w-32 h-12 bg-white/10 rounded animate-pulse"></div>
                            <div className="w-36 h-12 bg-zinc-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 h-12 bg-zinc-900 border border-zinc-800 rounded animate-pulse"></div>
                    <div className="w-full md:w-48 h-12 bg-zinc-900 border border-zinc-800 rounded animate-pulse hidden md:block"></div>
                </div>

                {/* Skeleton Rows */}
                <div className="space-y-12">
                    {[1, 2].map((row) => (
                        <div key={row} className="space-y-3">
                            <div className="w-48 h-8 bg-zinc-900 rounded px-2 animate-pulse mb-4"></div>
                            <div className="flex gap-3 overflow-hidden">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="w-[280px] sm:w-[320px] shrink-0">
                                        <div className="aspect-video bg-zinc-900 rounded-md animate-pulse"></div>
                                        <div className="pt-3 space-y-2">
                                            <div className="w-1/3 h-3 bg-zinc-900 rounded animate-pulse"></div>
                                            <div className="w-5/6 h-4 bg-zinc-900 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-950/50 text-red-500 p-4 rounded-lg text-center font-medium border border-red-900/50">
                {error}
                <button onClick={fetchData} className="ml-4 underline hover:text-red-400">再試行</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Netflix-style Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] mb-8 lg:mb-12 flex items-end rounded-xl overflow-hidden shadow-2xl border border-zinc-800/50">
                <div className="absolute inset-0 z-0 bg-zinc-900">
                    {filteredLessons[0]?.thumbnail && (
                        <img src={filteredLessons[0].thumbnail} className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Featured" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
                </div>

                <div className="relative z-10 w-full px-6 md:px-12 pb-10">
                    {filteredLessons[0] ? (
                        <div className="max-w-3xl space-y-4">
                            <span className="text-[10px] font-black tracking-widest text-orange-500 uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> N E W
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                                {filteredLessons[0].title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm font-semibold text-zinc-300 drop-shadow-md">
                                {filteredLessons[0].tags?.[0] && (
                                    <span className="text-white">{filteredLessons[0].tags[0]}</span>
                                )}
                                <span>•</span>
                                <span className={filteredLessons[0].required ? "text-orange-400" : "text-zinc-400"}>
                                    {filteredLessons[0].required ? "必須コンテンツ" : "任意コンテンツ"}
                                </span>
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <button onClick={() => router.push(`/lesson/${filteredLessons[0].lesson_id}`)} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-white/80 transition-colors shadow-lg active:scale-95">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    再生
                                </button>
                                {userRole === "admin" && (
                                    <button onClick={() => router.push(`/admin/lesson/${filteredLessons[0].lesson_id}`)} className="flex items-center gap-2 bg-zinc-600/70 text-white px-6 py-3 rounded font-bold hover:bg-zinc-600 transition-colors backdrop-blur-md shadow-lg active:scale-95">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        詳細情報
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-400">現在表示できる動画がありません。</div>
                    )}
                </div>
            </div>

            {showDashboard && renderDashboard()}

            {/* Search & Filter row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 z-20 relative px-2">
                <div className="flex flex-1 w-full gap-4 items-center">
                    <div className="relative max-w-md w-full">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="タイトルで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:bg-zinc-800 focus:border-zinc-600 focus:ring-0 transition-colors shadow-inner"
                        />
                    </div>
                    <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="px-4 py-3 rounded bg-zinc-900 border border-zinc-800 text-white focus:bg-zinc-800 focus:border-zinc-600 focus:ring-0 transition-colors appearance-none cursor-pointer hidden md:block outline-none"
                    >
                        <option value="">全てのタグ</option>
                        {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={fetchData} className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded transition-colors hidden sm:block" title="再読込">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                {userRole === "admin" && (
                    <button
                        onClick={() => router.push("/admin/users")}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded text-sm font-bold border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        受講状況一覧
                    </button>
                )}
            </div>

            {/* Categories -> Horizontal scrolling rows (Netflix style) */}
            <div className="space-y-12">
                {(tagFilter ? [tagFilter] : uniqueTags.length > 0 ? uniqueTags : ['全ての動画']).map((tag, tagIndex) => {
                    const rowLessons = tagFilter ? filteredLessons : filteredLessons.filter(l => tag === '全ての動画' ? true : l.tags?.includes(tag));
                    if (rowLessons.length === 0) return null;

                    return (
                        <div key={tag} className="space-y-3 relative group/row">
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center gap-2 px-2">
                                {tag}
                                <svg className="w-5 h-5 text-zinc-600 opacity-0 group-hover/row:opacity-100 transition-opacity translate-x-[-10px] group-hover/row:translate-x-0 cursor-pointer hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </h2>
                            <div className="flex overflow-x-auto gap-3 pb-8 pt-6 px-2 snap-x snap-mandatory overflow-y-visible hide-scrollbar scroll-smooth">
                                {rowLessons.map(lesson => (
                                    <div
                                        key={lesson.lesson_id}
                                        onClick={() => router.push(`/lesson/${lesson.lesson_id}`)}
                                        className="group relative flex-none w-[280px] sm:w-[320px] rounded-md overflow-visible bg-zinc-900 cursor-pointer snap-start"
                                    >
                                        <div className="relative aspect-video bg-zinc-800 rounded-md overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] group-hover:ring-1 group-hover:ring-zinc-600 group-hover:z-30">
                                            {!lesson.required && (
                                                <span className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur text-zinc-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-zinc-700">
                                                    任意
                                                </span>
                                            )}
                                            {lesson.thumbnail ? (
                                                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm font-semibold">No Image</div>
                                            )}

                                            {/* Progress bar */}
                                            {lesson.required && (
                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800/80">
                                                    {lesson.hasAnswered ? (
                                                        <div className="h-full bg-orange-600 w-full"></div>
                                                    ) : lesson.hasViewed ? (
                                                        <div className="h-full bg-orange-600 w-1/2"></div>
                                                    ) : null}
                                                </div>
                                            )}

                                            {/* Play Icon overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                    <svg className="w-6 h-6 text-white translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Below Card */}
                                        <div className="pt-3 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-2 text-[10px] font-bold mb-1">
                                                {lesson.hasAnswered ? <span className="text-orange-500">回答済</span> : lesson.hasViewed ? <span className="text-emerald-500">視聴済</span> : <span className="text-zinc-500">未視聴</span>}
                                                <span className="text-zinc-600">•</span>
                                                <span className="text-zinc-400 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    {lesson.views_30d || 0}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-zinc-100 line-clamp-1">{lesson.title}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredLessons.length === 0 && !loading && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800 mt-6">
                    <p className="text-zinc-500 font-medium">該当する動画が見つかりませんでした</p>
                </div>
            )}
        </div>
    );
}
