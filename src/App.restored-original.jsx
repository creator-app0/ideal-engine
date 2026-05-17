/**
 * Restored from Cursor local history (snapshot kYnI.jsx, May 2026).
 * Llama-3.1-8b-instant + Groq streaming, light/dark toggle, History drawer.
 * Import path adjusted for this repo (supabaseclient.js).
 */
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import React, { useState, useEffect, useRef } from 'react'
import Groq from "groq-sdk";
import { supabase } from './supabaseclient'
import Login from './Login'
import ReactMarkdown from 'react-markdown'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [session, setSession] = useState(null)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  
  // PRO FEATURE: CUSTOM PERSONA
  const [userBio, setUserBio] = useState(localStorage.getItem('userBio') || '')
  const [showSettings, setShowSettings] = useState(false)

  // --- NATIVE VOICE RECOGNITION ---
  const [isListening, setIsListening] = useState(false);
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
  }

  useEffect(() => {
    theme === 'dark' ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  const fetchChats = async () => {
    if (!session) return
    const { data } = await supabase.from('chats').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (data) setChats(data)
  }
  useEffect(() => { fetchChats() }, [session])

  useEffect(() => {
    if (!activeChatId) { 
      if (session) setMessages([{ text: `**Welcome back!** 🚀 Ready to dominate today?`, sender: 'ai' }]);
      return; 
    }
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', activeChatId).order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    fetchMessages()
  }, [activeChatId, session])

  const messagesEndRef = useRef(null)
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isTyping])

  // --- PRO FEATURE: STREAMING RESPONSES ---
  const handleSend = async () => {
    if (inputText.trim() === '' || !session) return
   // Trigger a light premium vibration
   await Haptics.impact({ style: ImpactStyle.Light });
    const userText = inputText 
    const currentUserId = session.user.id
    setInputText('') 

    let currentChatId = activeChatId
    if (!currentChatId) {
      const { data: newChat } = await supabase.from('chats').insert([{ user_id: currentUserId, title: userText.substring(0, 30) }]).select().single()
      if (newChat) { currentChatId = newChat.id; setActiveChatId(newChat.id); setChats(prev => [newChat, ...prev]); }
    }

    setMessages(prev => [...prev, { text: userText, sender: 'user' }])
    setIsTyping(true)
    await supabase.from('messages').insert([{ text: userText, sender: 'user', user_id: currentUserId, chat_id: currentChatId }])

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are a Viral Growth Coach. User Bio: ${userBio}. Be concise, use Markdown, and bold headers.` },
          { role: "user", content: userText }
        ],
        model: "llama-3.1-8b-instant",
        stream: true, // THE "PRO" UPGRADE
      });

      let fullAiText = "";
      setMessages(prev => [...prev, { text: "", sender: 'ai' }]); // Placeholder for streaming

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullAiText += content;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullAiText;
          return updated;
        });
      }
      
      await supabase.from('messages').insert([{ text: fullAiText, sender: 'ai', user_id: currentUserId, chat_id: currentChatId }])
    } catch (e) { console.error(e) } finally { setIsTyping(false) }
  }

  if (!session) return <Login />

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
               className="w-full h-32 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-sm"
               placeholder="e.g. I am a fitness coach on Instagram trying to reach 10k followers..."
             />
             <button onClick={() => setShowSettings(false)} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold">Save Profile</button>
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
                 <div key={chat.id} onClick={() => { setActiveChatId(chat.id); setShowHistory(false); }} className={`p-3 rounded-lg text-sm truncate ${activeChatId === chat.id ? 'bg-gray-800' : 'text-gray-400'}`}>{chat.title}</div>
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
             <h1 className="text-xl font-black text-blue-600">Creator Coach</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="text-xl p-2">⚙️</button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="text-xl p-2">{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-44">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-5 py-3 max-w-[95%] shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-900 border border-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
                  <ReactMarkdown className="prose prose-sm dark:prose-invert text-[16px] leading-relaxed overflow-hidden">{msg.text}</ReactMarkdown>
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
              {/* VOICE INPUT BUTTON */}
              <button onClick={startSpeech} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-800'}`}>
                🎙️
              </button>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="What's the goal today?" className={`flex-1 border-none rounded-2xl px-5 py-4 outline-none text-[16px] ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} />
              <button onClick={handleSend} className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                 <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App