import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

const isConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('your-supabase-project')

const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

export const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'ไม่พบ Bearer Token ใน Authorization Header'
      })
    }

    const token = authHeader.split(' ')[1]

    if (!isConfigured) {
      // Demo mode fallback when credentials are not yet updated in .env
      req.user = {
        id: 'demo-user-id-12345',
        email: 'demo@example.com',
        role: 'authenticated',
        is_demo: true
      }
      return next()
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Token',
        message: error?.message || 'Token ไม่ถูกต้องหรือหมดอายุแล้ว'
      })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth Middleware Error:', err)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการตรวจสอบ Token'
    })
  }
}
