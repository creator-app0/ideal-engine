import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* NATIVE-STYLE HEADER */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
          <span className="font-black text-2xl tracking-tighter italic">CreatorCoach</span>
        </div>
        <a href="#download" className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all">Get Started</a>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-16 pb-24 max-w-6xl mx-auto text-center">
        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">Free Beta Access</span>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
          Stop Staring at a <span className="text-blue-600 italic">Blank Screen.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          The first AI Coach built specifically for creators. Get viral reel ideas, high-retention hooks, and daily motivation—delivered word-by-word on your Android device.
        </p>
        
        {/* DOWNLOAD BUTTON */}
        <div id="download" className="flex flex-col items-center gap-4">
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
          <p className="text-sm text-gray-400 font-medium italic">v1.0.2 • 100% Free • No Credit Card Required</p>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="text-4xl">⚡</div>
            <h3 className="text-xl font-bold">Llama-3.1 Speed</h3>
            <p className="text-gray-500">Built on the latest Llama-3.1-8b model for instant, word-by-word viral advice.</p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl">🎙️</div>
            <h3 className="text-xl font-bold">Voice-to-Idea</h3>
            <p className="text-gray-500">Record your thoughts on the go. Our native voice recognition handles the typing.</p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl">🌙</div>
            <h3 className="text-xl font-bold">Dark Mode UI</h3>
            <p className="text-gray-500">A premium interface designed for creators who build late into the night.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center border-t border-gray-50">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">© 2026 CreatorCoach AI Labs</p>
      </footer>
    </div>
  );
};

export default LandingPage;