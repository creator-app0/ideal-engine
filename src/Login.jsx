import React, { useState } from 'react'
import { supabase } from './supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('') // New: Stores the 6-digit code
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [codeSent, setCodeSent] = useState(false) // New: Tracks which screen to show

  // Step 1: Sends the code to the email
  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // Supabase automatically sends a 6-digit code along with the link
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the 6-digit code! 🚀')
      setCodeSent(true) // Flips the UI to show the code input
    }
    setLoading(false)
  }

  // Step 2: Verifies the code they typed in
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    }
    // If successful, App.jsx automatically detects the login and shows the AI!
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-600">Creator-Coach</h2>
          <p className="text-gray-500 mt-2">
            {!codeSent ? "Enter your email to start building." : "Enter the code sent to your email."}
          </p>
        </div>
        
        {/* THE UI FLIP: Shows Email form first, then Code form */}
        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <input
              type="email"
              placeholder="yourname@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
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
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-2xl text-center tracking-[0.5em] font-mono"
              required
            />
            <button
              disabled={loading}
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
    </div>
  )
}

export default Login