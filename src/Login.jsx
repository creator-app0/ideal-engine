import React, { useState } from 'react'
import { supabase } from './supabaseclient'

function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('') 
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [codeSent, setCodeSent] = useState(false) 

  // Step 1: Sends the code to the email
  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the 6-digit code! 🚀')
      setCodeSent(true) 
    }
    setLoading(false)
  }

  // Step 2: Verifies the code they typed in
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Clean up the code to ensure no accidental spaces
    const cleanCode = code.trim()

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: cleanCode,
      type: 'email'
    })

    // ALWAYS stop loading, whether it succeeds or fails
    setLoading(false)

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage('✅ Success! Booting up Llama-3.1...')
      // Force the app to reload so App.jsx detects the live session
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-blue-600">CreatorCoach</h2>
        <p className="text-gray-500 mt-2">
          {!codeSent ? "Enter your email to start building." : "Enter the 6-digit code sent to your email."}
        </p>
      </div>
      
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <input
            type="email"
            placeholder="yourname@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg text-black"
            required
          />
          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg"
          >
            {loading ? 'Sending...' : 'Send Login Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <input
            type="text"
            placeholder="123456"
            maxLength={6} // Forces them to only type 6 numbers!
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-2xl text-center tracking-[0.5em] font-mono text-black"
            required
          />
          <button
            disabled={loading || code.length !== 6} // Button won't work until 6 digits are typed
            className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}

      {message && (
        <div className="mt-6 p-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-center font-medium">
          {message}
        </div>
      )}
    </div>
  )
}

export default Login