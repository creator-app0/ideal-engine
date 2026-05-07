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

  // 1. Check if user is logged in + Load VIP status
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

  // 2. The Logic to Unlock
  const handleUnlockSuccess = () => {
    setIsVIP(true);
    localStorage.setItem('creator_vip_status', 'true');
    setShowPaywall(false);
  };

  // 3. The Generator Function
  const generateViralIdea = () => {
    if (!isVIP && usageCount >= 5) {
      setShowPaywall(true);
      return;
    }

    setResult("AI is generating your viral hook for: " + aiIdea);
    
    if (!isVIP) {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('creator_usage_count', newCount.toString());
    }
  };

  // ==========================================
  // SCREEN 1: NOT LOGGED IN -> BEAUTIFUL LANDING PAGE
  // ==========================================
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
        {/* NATIVE-STYLE HEADER */}
        <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
            <span className="font-black text-2xl tracking-tighter italic">CreatorCoach</span>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="px-6 pt-10 pb-24 max-w-6xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Free Beta Access</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
            Stop Staring at a <span className="text-blue-600 italic">Blank Screen.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first AI Coach built specifically for creators. Get viral reel ideas, high-retention hooks, and daily motivation.
          </p>
          
          {/* THE REAL DOWNLOAD BUTTON */}
          <div className="flex flex-col items-center gap-4 mb-16">
            <a 
              href="/creator-coach.apk" 
              download 
              className="group relative flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all"
            >
              <span>Download for Android</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3" />
              </svg>
            </a>
            <p className="text-sm text-gray-400 font-medium italic">v1.0.2 • 5 Free Scripts • ₹30 for Lifetime VIP</p>
          </div>

          {/* THE LOGIN BOX FOR APP USERS */}
          <div className="max-w-md mx-auto border-t border-gray-200 pt-12">
            <h3 className="text-gray-400 font-bold mb-4 uppercase tracking-widest text-sm">Already have an account?</h3>
            <Login />
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: LOGGED IN -> GENERATOR & PAYWALL
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      {/* THE PAYWALL TRAP */}
      {showPaywall && <Paywall onUnlock={handleUnlockSuccess} />}

      <div className="max-w-md mx-auto pt-10">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic text-blue-500">Dashboard</h2>
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-gray-500 underline">Logout</button>
        </div>

        <p className="mb-4 text-sm font-bold text-gray-400">
            {isVIP ? "👑 VIP UNLIMITED" : `🎁 FREE TRIES LEFT: ${5 - usageCount}`}
        </p>

        <textarea 
          className="w-full bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-4 outline-none focus:border-blue-500"
          placeholder="What is your video about?"
          value={aiIdea}
          onChange={(e) => setAiIdea(e.target.value)}
        />

        <button 
          onClick={generateViralIdea}
          className="w-full bg-blue-600 p-4 rounded-2xl font-black text-lg active:scale-95 transition-all"
        >
          GENERATE 🚀
        </button>

        {result && (
            <div className="mt-8 p-6 bg-zinc-900 rounded-2xl border border-blue-500/30">
                <p className="text-gray-200">{result}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;