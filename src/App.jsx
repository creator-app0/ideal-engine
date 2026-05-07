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
  const [showLoginScreen, setShowLoginScreen] = useState(false); 

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

    if (!aiIdea) return alert("Bro, type an idea first!");

    setLoading(true);
    setResult("⏳ Thinking of something viral...");
    
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { 
              role: "system", 
              content: "You are CreatorCoach. Your goal is to give viral reel/video ideas. Always use bullet points, clear headings, and line breaks so it is easy to read. Be punchy and energetic." 
            },
            { role: "user", content: aiIdea }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      setResult(aiResponse);

      if (!isVIP) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('creator_usage_count', newCount.toString());
      }
    } catch (error) {
      setResult("❌ AI failed. Check your API limits!");
    }
    setLoading(false);
  };

  if (!session) {
    if (showLoginScreen) {
      return (
        <div className="relative min-h-screen bg-gray-50">
          <button onClick={() => setShowLoginScreen(false)} className="absolute top-8 left-8 font-black text-gray-500 z-50">← Back</button>
          <Login />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
        <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
            <span className="font-black text-2xl tracking-tighter italic">CreatorCoach</span>
          </div>
          <button onClick={() => setShowLoginScreen(true)} className="font-black text-blue-600 bg-blue-100 px-6 py-2 rounded-full shadow-sm">Login</button>
        </nav>

        <section className="px-6 pt-10 pb-24 max-w-6xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Free Beta Access</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">Stop Staring at a <span className="text-blue-600 italic">Blank Screen.</span></h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">The first AI Coach for creators. Viral hooks in seconds.</p>
          
          <div className="flex flex-col items-center gap-4">
            <a href="/creator-coach.apk" download className="group relative flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all">
              <span>Download for Android</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:animate-bounce"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3" /></svg>
            </a>
            <p className="text-sm text-gray-400 font-medium italic">v1.0.3 • 5 Free Scripts • ₹30 for Lifetime VIP</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen