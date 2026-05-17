import React, { useState, useEffect } from 'react';
import Paywall from './Paywall';
import Login from './Login';
import { supabase } from './supabaseclient'; 

const App = () => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [session, setSession] = useState(null); 

  // AI Dashboard States
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hooks, setHooks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // 🛡️ THE BULLETPROOF SWITCH 🛡️
  const isNativeApp = typeof window !== 'undefined' && !!window.Capacitor;

  // 🕵️ THE VIP BOUNCER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // FAKE GENERATOR JUST FOR YOUR SCREEN RECORDING REEL 🎥
  const handleGenerateHooks = () => {
    if (!idea) return;
    setIsGenerating(true);
    setHooks([]);
    
    // Fakes a 2-second loading animation for the Reel
    setTimeout(() => {
      setHooks([
        "❌ Stop doing [Blank] if you want to [Goal]. Do this instead...",
        "🤫 The dark psychology secret nobody tells you about [Topic].",
        "🤯 I tried [Strategy] for 30 days and my mind is blown."
      ]);
      setIsGenerating(false);
    }, 2000);
  };


  // ==========================================
  // 📱 VIEW 1: WHAT HAPPENS INSIDE THE APK 📱
  // ==========================================
  if (isNativeApp) {
    
    // 🔥 IF LOGGED IN: SHOW THE AI DASHBOARD 🔥
    if (session) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-6 font-sans">
          
          {/* Header */}
          <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
               <h2 className="text-xl font-black text-gray-900 tracking-tight">CreatorCoach</h2>
             </div>
             <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-gray-400 underline">Log Out</button>
          </div>

          {/* AI Generator Box */}
          <div className="w-full max-w-md bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 mb-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Generate Hook</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100">Llama-3.1-8b</span>
             </div>

             <div className="relative mb-6">
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="What is your video about? e.g. How to get rich in your 20s..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[120px] text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
                
                {/* Voice-to-Idea Mic Button */}
                <button 
                  onClick={() => setIsRecording(!isRecording)}
                  className={`absolute bottom-3 right-3 p-2.5 rounded-full transition-all shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                </button>
             </div>

             <button 
               onClick={handleGenerateHooks}
               disabled={isGenerating || !idea}
               className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
             >
               {isGenerating ? (
                 <span className="animate-pulse">Analyzing Audience...</span>
               ) : (
                 'Generate Viral Hooks 🚀'
               )}
             </button>
          </div>

          {/* Results Area */}
          {hooks.length > 0 && (
            <div className="w-full max-w-md space-y-4 animate-[fadeIn_0.5s_ease-out]">
              <h4 className="font-black text-gray-800 ml-2">Top Performing Hooks:</h4>
              {hooks.map((hook, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start cursor-copy hover:border-blue-300 transition-all">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0">{index + 1}</div>
                  <p className="text-gray-700 font-medium leading-relaxed">{hook}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      );
    }

    // 🔒 IF NOT LOGGED IN: SHOW LOGIN SCREEN 🔒
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-4">C</div>
          <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">CreatorCoach</h1>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-2">Your AI Viral Growth Partner</p>
        </div>

        {!showAuthForm ? (
          <div className="w-full max-w-sm space-y-4">
            <button onClick={() => setShowAuthForm(true)} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg active:scale-95 transition-all">Sign Up</button>
            <button onClick={() => setShowAuthForm(true)} className="w-full bg-gray-100 text-gray-900 font-black py-5 rounded-2xl text-xl active:scale-95 transition-all">Login</button>
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

  // ==============================================
  // 🌐 VIEW 2: WHAT HAPPENS ON THE INSTA LINK 🌐
  // ==============================================
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center font-sans">
      <div className="mt-12 mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-4">C</div>
        <h1 className="text-3xl font-black italic tracking-tighter text-white">CreatorCoach</h1>
        <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mt-2">Your AI Viral Growth Partner</p>
      </div>

      <section className="px-6 pb-24 max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <span className="bg-blue-900/50 border border-blue-800 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Free Beta Access</span>
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-white">
          Stop Staring at a <span className="text-blue-600">Blank Screen.</span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The first AI Coach for Indian creators. Viral hooks generated by Llama-3.1 in seconds.
        </p>

        <div className="flex flex-col items-center gap-4">
          <a href="/creator-coach.apk" download className="w-full max-w-sm bg-blue-600 text-white font-black px-8 py-5 rounded-2xl text-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3">
            Download for Android
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          </a>
          <p className="text-sm text-gray-500 font-medium italic mt-2">v1.0.5 • <span className="text-yellow-500 font-bold">₹149 for Lifetime VIP</span></p>
        </div>
      </section>

      {showPaywall && <Paywall onUnlock={() => setShowPaywall(false)} />}
    </div>
  );
};

export default App;