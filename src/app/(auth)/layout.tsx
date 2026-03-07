"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchGasApi, getSessionToken, removeSessionToken } from "@/lib/api";

type UserResponse = {
    ok: boolean;
    name?: string;
    role?: string;
    message?: string;
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getSessionToken();
        if (!token) {
            router.replace("/");
            return;
        }

        const checkAuth = async () => {
            try {
                const res = await fetchGasApi("me", { token });
                if (res.ok) {
                    setUser(res);
                } else {
                    removeSessionToken();
                    router.replace("/");
                }
            } catch (err) {
                removeSessionToken();
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = () => {
        if (confirm("ログアウトしますか？")) {
            removeSessionToken();
            router.replace("/");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white relative selection:bg-orange-500 selection:text-white">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-zinc-950">
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-black"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/5 blur-[120px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-zinc-800/20 blur-[100px] opacity-30"></div>
            </div>

            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50 transition-all">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/library')}>
                            <span className="font-black text-2xl text-orange-600 tracking-tighter transition-transform duration-300 group-hover:drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]">E-LEARNING</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center text-sm px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900/50">
                                <span className="font-semibold text-zinc-300">{user?.name}</span>
                                <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${user?.role === 'admin' ? 'bg-red-900/40 text-red-500 border border-red-900/50' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {user?.role === 'admin' ? 'Admin' : 'Staff'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-bold text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded hover:bg-zinc-900"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto py-8 animate-in fade-in duration-700 relative z-10 w-full">
                {children}
            </main>
        </div>
    );
}
