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
  
  // This controls the initial "Sign Up / Login" choice screen
  const [showAuthForm, setShowAuthForm] = useState(false); 

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

  // --- SCREEN 1: THE APP ENTRY POINT ---
  if (!session) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-8">
        
        {/* THE AI TAGLINE */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-4">C</div>
          <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">CreatorCoach</h1>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-2">Your AI Viral Growth Partner</p>
        </div>

        {/* THE TWO OPTIONS */}
        {!showAuthForm ? (
          <div className="w-full max-w-sm space-y-4">
            <button 
              onClick={() => setShowAuthForm(true)}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg active:scale-95 transition-all"
            >
              Sign Up
            </button>
            <button 
              onClick={() => setShowAuthForm(true)}
              className="w-full bg-gray-100 text-gray-900 font-black py-5 rounded-2xl text-xl active:scale-95 transition-all"
            >
              Login
            </button>
            <p className="text-center text-gray-400 text-xs font-medium">New users get 5 free AI ideas.</p>
          </div>
        ) : (
          /* THE LOGIN FORM (Shows after clicking above) */
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Login />
             <button 
              onClick={() => setShowAuthForm(false)}
              className="w-full mt-4 text-gray-400 font-bold text-sm underline"
             >
               Go Back
             </button>
          </div>
        )}
      </div>
    );
  }

  // --- SCREEN 2: THE DASHBOARD (LOGGED IN) ---
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

        <textarea 
          className="w-full bg-zinc-900 p-5 rounded-3xl border border-zinc-800 mb-4 outline-none focus:border-blue-600 min-h-[150px] text-lg"
          placeholder="What is your video about?"
          value={aiIdea}
          onChange={(e) => setAiIdea(e.target.value)}
        />

        <button 
          onClick={generateViralIdea}
          disabled={loading}
          className="w-full bg-blue-600 p-5 rounded-3xl font-black text-xl shadow-blue-900/20 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'ANALYZING...' : 'GENERATE HOOKS 🚀'}
        </button>

        {result && (
            <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border border-zinc-800">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {result}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;