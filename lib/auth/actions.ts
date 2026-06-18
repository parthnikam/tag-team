'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'



export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/login?message=' + encodeURIComponent(error.message))
  }

  redirect('/') // Go to protected home page
}


const getURL = async () => {
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const host = forwardedHost ?? headersList.get('host')

  if (host) {
    const protocol =
      headersList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
};

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const siteUrl = await getURL();
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/auth/login?message=' + encodeURIComponent('Passwords do not match'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  })

  if (error) {
    redirect('/auth/login?message=' + encodeURIComponent(error.message))
  }

  if (data.session) {
    redirect('/')
  }

  redirect('/auth/signup-confirmation')
}


export async function signInWithGoogle() {
  const supabase = await createClient()
  const siteUrl = await getURL();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth/login?message=' + encodeURIComponent(error.message))
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  redirect('/auth/login')
}
