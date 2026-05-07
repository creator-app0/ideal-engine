import React, { useState } from 'react';

const Paywall = ({ onUnlock }) => {
  const [codeInput, setCodeInput] = useState('');
  
  // YOUR DETAILS GO HERE
  const upiId = "harshbasoya@fampay"; // Replace with your exact UPI ID
  const whatsappNumber = "919999936371s"; 
  const exactPrice = "30.00"; // Keep the .00 for UPI formatting
  const SECRET_PASSCODE = "VIP-30"; 

  // THIS IS THE MAGIC LINK
  // It forces Android to open UPI apps with your details pre-filled
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=CreatorCoach&am=${exactPrice}&cu=INR&tn=Premium%20Upgrade`;

  const handleVerify = () => {
    if (codeInput === SECRET_PASSCODE) {
      onUnlock(); 
    } else {
      alert("Invalid code! Make sure you paid and got the code on WhatsApp.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 text-white font-sans">
      <div className="bg-[#111] border border-blue-500/30 p-8 rounded-[30px] max-w-sm w-full shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)] text-center">
        
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚡
        </div>
        
        <h2 className="text-3xl font-black mb-2 tracking-tight">Go Premium</h2>
        <p className="text-gray-400 text-sm mb-6">
          Unlock unlimited viral scripts and hooks for just ₹30.
        </p>

        {/* ONE-CLICK UNIVERSAL UPI BUTTON */}
        <button 
          onClick={() => window.open(upiDeepLink, '_system')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white w-full py-4 rounded-xl font-black text-lg mb-4 shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] active:scale-95 transition-all"
        >
          <span>Pay ₹30 (Any UPI App)</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
        
        {/* WHATSAPP BUTTON */}
        <a 
          href={`https://wa.me/${whatsappNumber}?text=Bro%20I%20just%20paid%20%E2%82%B930%20for%20CreatorCoach!%20Here%20is%20my%20screenshot.`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-400 underline hover:text-white mb-8 block"
        >
          Paid? Click here to send screenshot & get your Unlock Code
        </a>

        {/* UNLOCK CODE INPUT */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">Enter VIP Code</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Code from WhatsApp..." 
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 outline-none focus:border-blue-500 font-mono text-center text-sm uppercase"
            />
            <button 
              onClick={handleVerify}
              className="bg-white text-black px-6 rounded-xl font-bold transition active:scale-95"
            >
              Unlock
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Paywall;