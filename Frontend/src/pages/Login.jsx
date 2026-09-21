import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleUsernameChange = (e) => {
    let val = e.target.value
    if (val && !val.startsWith('@')) {
      val = '@' + val.replace(/@/g, '')
    }
    setUsername(val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase()

    if (!cleanUsername || !password) {
      setError('กรุณากรอก Username (@ชื่อใน Roblox) และรหัสผ่านให้ครบถ้วน')
      return
    }

    try {
      setLoading(true)
      const internalEmail = `${cleanUsername}@roblox.com`
      await signIn({ email: internalEmail, password })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Username หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge">
          <Sparkles size={14} />
          <span>Rewards Platform</span>
        </div>
        <h1 className="auth-title">เข้าสู่ระบบ</h1>
        <p className="auth-subtitle">ใส่ชื่อใน Roblox และรหัสผ่านเพื่อเข้าสู่ระบบ</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            ชื่อผู้ใช้ใน Roblox (ต้องมี @ นำหน้า)
          </label>
          <div className="input-wrapper">
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="@RobloxUsername"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <User className="input-icon" size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            รหัสผ่าน (Password)
          </label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '2.8rem' }}
              required
            />
            <Lock className="input-icon" size={18} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.8rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem'
              }}
              title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" />
              <span>กำลังเข้าสู่ระบบ...</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>เข้าสู่ระบบ</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        ยังไม่มีบัญชีสมาชิก?
        <Link to="/register">สมัครสมาชิกที่นี่</Link>
      </div>
    </div>
  )
}
