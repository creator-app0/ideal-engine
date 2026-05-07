import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseclient';
import Login from './Login';
import Paywall from './Paywall';

const App = () => {
  const [session, setSession] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [isVIP, setIsVIP] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [aiIdea, setAiIdea] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Controls the "App View" auth screen
  const [showAuthForm, setShowAuthForm] = useState(false); 

  // DETECT PLATFORM: Checks if we are inside the Android APK
  const isAndroidApp = window.location.href.includes('localhost') || window.Capacitor?.isNativePlatform();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const savedVIP = localStorage.getItem('creator_vip_status');
    const savedCount = localStorage.getItem('creator_usage_count');
    if (savedVIP === 'true') setIsVIP(true);
    if (savedCount) setUsageCount(parseInt(savedCount, 10));
  }, []);

  const handleUnlockSuccess = () => {
    setIsVIP(true);
    localStorage.setItem('creator_vip_status', 'true');
    setShowPaywall(false);
  };

  const generateViralIdea = async () => {
    if (!isVIP && usageCount >= 5) {
      setShowPaywall(true);
      return;
    }

    if (!aiIdea) return alert("Type your topic first!");

    setLoading(true);
    setResult("⏳ Coach is thinking...");
    
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are CreatorCoach. Give short, viral video hooks with bullet points." },
            { role: "user", content: aiIdea }
          ]
        })
      });

      const data = await response.json();
      setResult(data.choices[0].message.content);

      if (!isVIP) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('creator_usage_count', newCount.toString());
      }
    } catch (error) {
      setResult("❌ AI error. Check your connection.");
    }
    setLoading(false);
  };

  // ==========================================
  // CASE 1: USER IS NOT LOGGED IN
  // ==========================================
  if (!session) {
    
    // VIEW A: THE ANDROID APP (Direct Auth)
    if (isAndroidApp) {
      return (
        <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-4">C</div>
            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">CreatorCoach</h1>
            <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-2">Your AI Viral Growth Partner</p>
          </div>

          {!showAuthForm ? (
            <div className="w-full max-w-sm space-y-4">
              <button onClick={() => setShowAuthForm(true)} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg active:scale-95">Sign Up</button>
              <button onClick={() => setShowAuthForm(true)} className="w-full bg-gray-100 text-gray-900 font-black py-5 rounded-2xl text-xl active:scale-95">Login</button>
            </div>
          ) : (
            <div className="w-full max-w-sm">
               <Login />
               <button onClick={() => setShowAuthForm(false)} className="w-full mt-4 text-gray-400 font-bold text-sm underline">Go Back</button>
            </div>
          )}
        </div>
      );
    }

    // VIEW B: THE WEBSITE (Original Landing Page - No Nav Login)
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
        <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
            <span className="font-black text-2xl tracking-tighter italic">CreatorCoach</span>
          </div>
          {/* LOGIN BUTTON REMOVED AS REQUESTED */}
        </nav>

        <section className="px-6 pt-10 pb-24 max-w-6xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Free Beta Access</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Stop Staring at a <span className="text-blue-600 italic">Blank Screen.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first AI Coach built specifically for creators. Get viral reel ideas, high-retention hooks, and daily motivation.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <a href="/creator-coach.apk" download className="group relative flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all">
              <span>Download for Android</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3" />
              </svg>
            </a>
            <p className="text-sm text-gray-400 font-medium italic">v1.0.4 • 5 Free Scripts • ₹30 for Lifetime VIP</p>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // CASE 2: USER IS LOGGED IN (Dashboard)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      {showPaywall && <Paywall onUnlock={handleUnlockSuccess} />}
      <div className="max-w-md mx-auto pt-6">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black italic text-blue-500">CreatorCoach</h2>
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-gray-500 font-bold">LOGOUT</button>
        </div>
        <p className="mb-4 text-xs font-black text-gray-500 uppercase tracking-widest">
            {isVIP ? "👑 VIP MEMBER" : `🎁 REMAINING: ${Math.max(0, 5 - usageCount)}`}
        </p>
        <textarea className="w-full bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-4 outline-none focus:border-blue-600 min-h-[150px] text-lg" placeholder="What is your video about?" value={aiIdea} onChange={(e) => setAiIdea(e.target.value)} />
        <button onClick={generateViralIdea} disabled={loading} className="w-full bg-blue-600 p-5 rounded-3xl font-black text-xl shadow-blue-900/20 shadow-2xl active:scale-95 transition-all disabled:opacity-50">
          {loading ? 'ANALYZING...' : 'GENERATE HOOKS 🚀'}
        </button>
        {result && (
            <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border border-zinc-800">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;