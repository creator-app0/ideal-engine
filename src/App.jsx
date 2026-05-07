import React, { useState } from 'react';
import Paywall from './Paywall';

const LandingPage = () => {
  // This "state" controls if the paywall is visible or hidden
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. THE PAYWALL (Only shows when showPaywall is true) */}
      {showPaywall && (
        <Paywall onUnlock={() => setShowPaywall(false)} />
      )}

      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
          <span className="font-black text-2xl tracking-tighter italic text-black">CreatorCoach</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-16 pb-24 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-black">
          Stop Staring at a <span className="text-blue-600 italic">Blank Screen.</span>
        </h1>
        
        {/* 2. THE TEST BUTTON */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowPaywall(true)} 
            className="group relative flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all"
          >
            <span>Test Paywall (₹30)</span>
          </button>
          <p className="text-sm text-gray-400 font-medium italic">Click to see if your UPI apps open</p>
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