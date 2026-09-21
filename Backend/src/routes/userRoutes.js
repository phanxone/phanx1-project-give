import express from 'express'
import { verifySupabaseToken } from '../middleware/authMiddleware.js'

const router = express.Router()

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

export default router
