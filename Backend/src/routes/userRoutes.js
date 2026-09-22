import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { verifySupabaseToken } from '../middleware/authMiddleware.js'

dotenv.config()

const router = express.Router()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'))
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null

// GET /api/user/profile - Protected route requiring valid Supabase token
router.get('/profile', verifySupabaseToken, (req, res) => {
  res.json({
    success: true,
    message: 'ตรวจสอบ Token ฝั่ง Backend สำเร็จเรียบร้อยแล้ว!',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      user_metadata: req.user.user_metadata || {},
      is_demo: req.user.is_demo || false
    },
    timestamp: new Date().toISOString()
  })
})

// GET /api/user/points/:userId - Fetch current points of user from profiles table
router.get('/points/:userId', async (req, res) => {
  const { userId } = req.params
  if (!supabase || !userId) return res.json({ success: true, points: 500 })

  try {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single()
    if (profile && profile.points !== undefined) {
      return res.json({ success: true, points: profile.points })
    }
    return res.json({ success: true, points: 500 })
  } catch (err) {
    return res.json({ success: true, points: 500 })
  }
})

export default router
