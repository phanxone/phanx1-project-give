import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPoints, setUserPoints] = useState(500)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  const fetchUserPoints = async (userId) => {
    if (!userId) return
    try {
      // 1. Try Backend API
      const res = await fetch(`${apiBaseUrl}/user/points/${userId}`)
      const data = await res.json()
      if (data.success && data.points !== undefined) {
        setUserPoints(data.points)
        return
      }

      // 2. Fallback to Supabase direct query
      if (isSupabaseConfigured) {
        const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single()
        if (profile && profile.points !== undefined) {
          setUserPoints(profile.points)
        }
      }
    } catch (err) {
      console.error('Error fetching user points:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser?.id) {
        fetchUserPoints(currentUser.id)
      }
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching session:', err)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser?.id) {
        fetchUserPoints(currentUser.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up method
  const signUp = async ({ email, password, username, fullName }) => {
    if (!isSupabaseConfigured) {
      throw new Error('ยังไม่ได้ตั้งค่า Supabase Credentials ในไฟล์ .env')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: fullName || username || email.split('@')[0],
        },
      },
    })

    if (error) throw error
    return data
  }

  // Sign in method
  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      throw new Error('ยังไม่ได้ตั้งค่า Supabase Credentials ในไฟล์ .env')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  // Sign out method
  const signOut = async () => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    userPoints,
    setUserPoints,
    fetchUserPoints: () => user?.id && fetchUserPoints(user.id),
    isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
