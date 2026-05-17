import React, { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import Groq from "groq-sdk";
import { supabase } from './supabaseclient';
import Login from './Login';
import Paywall from './Paywall';
import ReactMarkdown from 'react-markdown';

const App = () => {
  // --- AUTH & LANDING PAGE STATE ---
  const [session, setSession] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // --- DASHBOARD STATE ---
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userBio, setUserBio] = useState(localStorage.getItem('userBio') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 🛡️ THE BULLETPROOF SWITCH 🛡️
  const isNativeApp = typeof window !== 'undefined' && !!window.Capacitor;

  // --- NATIVE VOICE RECOGNITION ---
  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported on this browser.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      setInputText(prev => prev + " " + e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.start();
  };

  // --- USE EFFECTS ---
  useEffect(() => {
    theme === 'dark' ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { 
    if (!session) return;
    const fetchChats = async () => {
      const { data } = await supabase.from('chats').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (data) setChats(data);
    };
    fetchChats(); 
  }, [session]);

  useEffect(() => {
    if (!activeChatId) { 
      if (session) setMessages([{ text: `**Welcome back!** 🚀 Ready to dominate today?`, sender: 'ai' }]);
      return; 
    }
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', activeChatId).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [activeChatId, session]);

  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  // --- STRICT Llama-3.1 API CALL ---
  const handleSend = async () => {
    if (inputText.trim() === '' || !session) return;
    
    const userText = inputText;
    const currentUserId = session.user.id;
    setInputText('');

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    // Fallback if key doesn't exist
    if (!apiKey || apiKey === "MISSING_KEY" || apiKey === "") {
      setMessages(prev => [
        ...prev, 
        { text: userText, sender: 'user' },
        { text: "❌ **ERROR:** `VITE_GROQ_API_KEY` is completely missing. Please add it to your `.env` file or Vercel Environment Variables and restart your server.", sender: 'ai' }
      ]);
      return;
    }

    await Haptics.impact({ style: ImpactStyle.Light });

    let currentChatId = activeChatId;
    if (!currentChatId) {
      const { data: newChat } = await supabase.from('chats').insert([{ user_id: currentUserId, title: userText.substring(0, 30) }]).select().single();
      if (newChat) { currentChatId = newChat.id; setActiveChatId(newChat.id); setChats(prev => [newChat, ...prev]); }
    }

    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setIsTyping(true);
    await supabase.from('messages').insert([{ text: userText, sender: 'user', user_id: currentUserId, chat_id: currentChatId }]);

    try {
      const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are a Viral Growth Coach. User Bio: ${userBio}. Be concise, use Markdown, and bold headers.` },
          { role: "user", content: userText }
        ],
        model: "llama-3.1-8b-instant",
        stream: true,
      });

      let fullAiText = "";
      setMessages(prev => [...prev, { text: "", sender: 'ai' }]); 

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullAiText += content;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullAiText;
          return updated;
        });
      }
      await supabase.from('messages').insert([{ text: fullAiText, sender: 'ai', user_id: currentUserId, chat_id: currentChatId }]);
    } catch (e) { 
      console.error(e); 
      setMessages(prev => [...prev, { text: `❌ **Groq API Connection Error:** ${e.message || e}`, sender: 'ai' }]);
    } finally { 
      setIsTyping(false); 
    }
  };


  // ==========================================
  // 📱 VIEW 1: WHAT HAPPENS INSIDE THE APK 📱
  // ==========================================
  if (isNativeApp) {
    
    // 🔒 NOT LOGGED IN? SHOW SIGNUP SCREEN
    if (!session) {
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

    // 🔥 LOGGED IN? SHOW YOUR REAL LLAMA-3.1 DASHBOARD 🔥
    return (
      <div className={`h-[100dvh] w-full flex font-sans overflow-hidden transition-colors ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        
        {/* SETTINGS MODAL */}
        {showSettings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
               <h2 className="text-xl font-black mb-4">Creator Profile</h2>
               <p className="text-xs text-gray-500 mb-2">Tell the Coach about your niche/goals:</p>
               <textarea 
                 value={userBio} 
                 onChange={(e) => { setUserBio(e.target.value); localStorage.setItem('userBio', e.target.value); }}
                 className="w-full h-32 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-sm text-black dark:text-white"
                 placeholder="e.g. I am a fitness coach on Instagram trying to reach 10k followers..."
               />
               <button onClick={() => setShowSettings(false)} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold">Save Profile</button>
               <button onClick={() => supabase.auth.signOut()} className="w-full mt-4 text-red-500 text-sm font-bold underline">Log Out of App</button>
            </div>
          </div>
        )}
  
        {/* HISTORY DRAWER */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-72 bg-gray-900 text-white p-4 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold">History</h2>
                 <button onClick={() => setShowHistory(false)}>✕</button>
              </div>
              <button onClick={() => { setActiveChatId(null); setShowHistory(false); }} className="w-full bg-blue-600 py-3 rounded-xl font-bold mb-4">+ New Chat</button>
              <div className="flex-1 overflow-y-auto space-y-2">
                 {chats.map(chat => (
                   <div key={chat.id} onClick={() => { setActiveChatId(chat.id); setShowHistory(false); }} className={`p-3 rounded-lg text-sm truncate cursor-pointer ${activeChatId === chat.id ? 'bg-gray-800' : 'text-gray-400 hover:bg-gray-800/50'}`}>{chat.title || ''}</div>
                 ))}
              </div>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setShowHistory(false)}></div>
          </div>
        )}
  
        <main className="flex-1 flex flex-col h-full relative">
          <header className={`border-b p-4 flex justify-between items-center z-10 pt-safe ${theme === 'dark' ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80'} backdrop-blur-md`}>
            <div className="flex items-center gap-3">
               <button onClick={() => setShowHistory(true)} className="text-2xl">☰</button>
               <h1 className="text-xl font-black text-blue-600">CreatorCoach</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSettings(true)} className="text-xl p-2">⚙️</button>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="text-xl p-2">{theme === 'light' ? '🌙' : '☀️'}</button>
            </div>
          </header>
  
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-5 py-3 max-w-[95%] shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-900 border border-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
                    {/* 🛠️ FIXED: Removed className from ReactMarkdown and wrapped it inside a standard div */}
                    <div className="prose prose-sm dark:prose-invert text-[16px] leading-relaxed overflow-hidden">
                      <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex gap-1 pl-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
  
          <footer className={`absolute bottom-0 w-full p-4 pb-safe ${theme === 'dark' ? 'bg-gray-950/90' : 'bg-white/90'} backdrop-blur-md`}>
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 items-center">
                <button onClick={startSpeech} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                </button>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="What's the goal today?" className={`flex-1 border-none rounded-2xl px-5 py-4 outline-none text-[16px] shadow-sm ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} />
                <button onClick={handleSend} className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                   <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                </button>
              </div>
            </div>
          </footer>
        </main>
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