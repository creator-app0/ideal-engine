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

    // This is where your AI call happens
    setResult("AI is generating your viral hook for: " + aiIdea);
    
    if (!isVIP) {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('creator_usage_count', newCount.toString());
    }
  };

  // --- UI LOGIC ---

  // SCREEN 1: Not Logged In -> Show Landing Page
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-black text-blue-600 mb-4 italic">CreatorCoach</h1>
        <p className="text-gray-500 mb-8">Viral AI Hooks in seconds.</p>
        <Login /> {/* This shows your email/OTP login */}
      </div>
    );
  }

  // SCREEN 2: Logged In -> Show Generator + Paywall
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