import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'))
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null

// GET /api/auth/health - Check server status
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Rewards & Exchange Auth Backend API',
    supabaseConnected: Boolean(supabase),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// POST /api/auth/login - Backend Admin Login ONLY
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields',
        message: 'กรุณาระบุ username (@ชื่อใน Roblox) และ password'
      })
    }

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase()
    const formattedUsername = '@' + cleanUsername
    const internalEmail = `${cleanUsername}@roblox.com`

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase Not Configured',
        message: 'ยังไม่ได้ตั้งค่า SUPABASE_URL หรือ SUPABASE_ANON_KEY ใน Backend/.env'
      })
    }

    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: password
    })

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        error: 'Auth Failed',
        message: 'Username หรือ Password ไม่ถูกต้อง'
      })
    }

    // 2. Fetch User Profile to verify Admin Role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    const userRole = profile?.role || 'member'

    // Check if user is Admin
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'สิทธิ์ไม่ถูกต้อง! เฉพาะบัญชีสิทธิ์ Admin เท่านั้นที่สามารถเข้าใช้งานฝั่ง Backend ได้'
      })
    }

    return res.json({
      success: true,
      message: 'เข้าสู่ระบบ Admin ผ่าน Backend สำเร็จ!',
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: authData.user.id,
        username: formattedUsername,
        email: authData.user.email,
        role: userRole
      }
    })
  } catch (err) {
    console.error('Login API Error:', err)
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    })
  }
})

export default router
