"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchGasApi, setSessionToken, getSessionToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // 既にトークンがあればライブラリへ遷移
    const token = getSessionToken();
    if (token) {
      router.replace("/library");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError("職員IDを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetchGasApi("login", { staffId: staffId.trim() });
      if (res.ok && res.token) {
        setSessionToken(res.token);
        setShowIntro(true); // イントロアニメーション開始
        setTimeout(() => {
          router.push("/library");
        }, 2600); // 2.6秒後に画面遷移
      } else {
        setError(res.message || "ログインに失敗しました");
        setLoading(false);
      }
    } catch (err) {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <style>{`
          @keyframes netflixPop {
            0% { transform: scale(0.5); opacity: 0; }
            15% { transform: scale(1); opacity: 1; filter: blur(0px); }
            70% { transform: scale(1.1); opacity: 1; filter: blur(0px); }
            100% { transform: scale(4); opacity: 0; filter: blur(10px); }
          }
          .netflix-animate {
            animation: netflixPop 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="netflix-animate text-orange-600 font-black text-6xl sm:text-7xl md:text-8xl tracking-tighter drop-shadow-[0_0_40px_rgba(234,88,12,0.8)]">
          E-LEARNING
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6 py-12 relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Dark Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-[400px] bg-black/60 p-10 sm:p-12 rounded shadow-2xl border border-zinc-800/50 relative z-10 backdrop-blur-md">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">ログイン</h1>
          <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">新小文字病院 E-Learning</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group relative">
            <input
              id="staffId"
              name="staffId"
              type="text"
              autoComplete="username"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="peer block w-full rounded border border-zinc-700 bg-zinc-800/80 px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-orange-500 focus:bg-zinc-800 focus:outline-none focus:ring-0 sm:text-base transition-colors"
              placeholder="職員ID"
            />
            <label htmlFor="staffId" className="absolute left-4 top-2 text-xs font-semibold text-zinc-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-zinc-400 cursor-text">
              職員ID
            </label>
          </div>

          {error && (
            <div className="rounded bg-orange-500/10 p-4 border-l-4 border-orange-500 animate-in fade-in duration-300">
              <h3 className="text-sm font-medium text-orange-400">{error}</h3>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded bg-orange-600 px-4 py-3.5 text-base font-bold text-white hover:bg-orange-500 transition-colors duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>認証中...</span>
                </>
              ) : (
                <span>ログイン</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-8 w-full text-center pointer-events-none z-10">
        <p className="text-xs font-medium text-zinc-600 tracking-wider">© Shinkomonji Hospital</p>
      </div>
    </div>
  );
}

