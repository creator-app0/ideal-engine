import React from 'react';

const Paywall = ({ onUnlock }) => {
  // --- IMPORTANT UPDATE REQUIRED HERE ---
  // Replace this with your exact UPI ID (e.g., yourname@oksbi)
  const upiId = "harshbasoya@fam"; 
  const name = "CreatorCoach";
  
  // The price is locked at 149
  const amount = "149";
  
  // This constructs the exact URL that forces GPay/PhonePe to open
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-2">Lifetime VIP</h2>
        <p className="text-gray-400 mb-8">Unlock unlimited Llama-3.1 viral scripts and niche analysis.</p>
        
        <div className="text-5xl font-black text-white mb-8">
          ₹149 <span className="text-lg text-gray-500 font-medium tracking-normal">/ forever</span>
        </div>

        <button 
          onClick={() => window.location.href = upiDeepLink}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-lg shadow-lg active:scale-95 transition-all mb-4 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
          </svg>
          Pay ₹149 via UPI
        </button>
        
        <p className="text-xs text-gray-500 font-medium">Secured Payment. Instant activation.</p>
      </div>
    </div>
  );
};

export default Paywall;