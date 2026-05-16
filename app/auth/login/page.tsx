'use client'

import { login, signup, signInWithGoogle } from '@/lib/auth/actions'
import { useAuth } from '@/app/providers'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const signupParam = searchParams.get('signup')
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    signupParam === 'true' ? 'signup' : 'login'
  )

  useEffect(() => {
    if (user) {
      router.replace('/room')
    }
  }, [router, user])

  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-[440px] rounded-[2rem] border border-[#E7E7E7] bg-white p-6 sm:p-8 shadow-[0_20px_80px_rgba(10,10,10,0.06)]">
        
        {/* Tabs Toggle */}
        <div className="mb-8 flex rounded-full border border-[#E7E7E7] p-1.5 bg-[#F9F9F9]">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'login' 
                ? 'bg-white text-[#0A0A0A] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-[#667085] hover:text-[#0A0A0A]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'signup' 
                ? 'bg-white text-[#0A0A0A] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-[#667085] hover:text-[#0A0A0A]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#FFF4F4] p-4 text-[#B42318] border border-[#FFD9D9]">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#0A0A0A]">
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mt-2 text-[1rem] text-[#667085]">
            {activeTab === 'login' 
              ? 'Enter your credentials to sign in.' 
              : 'Enter your details to get started.'}
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#0A0A0A]">Email</span>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full rounded-[1.2rem] border border-[#E7E7E7] bg-[#F9F9F9] px-5 py-3.5 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#94A3B8] hover:bg-[#F2F2F2] focus:border-[#0A0A0A] focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#0A0A0A]">Password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-[1.2rem] border border-[#E7E7E7] bg-[#F9F9F9] px-5 py-3.5 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#94A3B8] hover:bg-[#F2F2F2] focus:border-[#0A0A0A] focus:bg-white"
            />
          </label>

          {activeTab === 'signup' && (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#0A0A0A]">Confirm Password</span>
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-[1.2rem] border border-[#E7E7E7] bg-[#F9F9F9] px-5 py-3.5 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#94A3B8] hover:bg-[#F2F2F2] focus:border-[#0A0A0A] focus:bg-white"
              />
            </label>
          )}

          <button 
            formAction={activeTab === 'login' ? login : signup}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-[#0A0A0A] px-6 py-3.5 text-[1rem] font-semibold text-white transition-colors hover:bg-[#222222]"
          >
            {activeTab === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="my-8 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-[#E7E7E7]" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#667085]">
            OR
          </span>
          <div className="h-px flex-1 bg-[#E7E7E7]" />
        </div>

        <form>
          <button
            formAction={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#E7E7E7] bg-white px-6 py-3.5 text-[1rem] font-semibold text-[#0A0A0A] transition-colors hover:bg-[#F9F9F9]"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
