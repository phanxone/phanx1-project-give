import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, UserCheck, AlertCircle, CheckCircle2, Gift, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleUsernameChange = (e) => {
    let val = e.target.value
    if (val && !val.startsWith('@')) {
      val = '@' + val.replace(/@/g, '')
    }
    setUsername(val)
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase()
    const formattedUsername = '@' + cleanUsername

    if (!cleanUsername) {
      setError('กรุณากรอกชื่อใน Roblox (ต้องมี @ นำหน้า)')
      return
    }

    if (!username.startsWith('@')) {
      setError('ชื่อใน Roblox ต้องมีเครื่องหมาย @ นำหน้า')
      return
    }

    if (!password || !confirmPassword) {
      setError('กรุณากรอกรหัสผ่านและยืนยันรหัสผ่าน')
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    try {
      setLoading(true)
      const internalEmail = `${cleanUsername}@roblox.com`
      await signUp({
        email: internalEmail,
        password,
        username: formattedUsername,
        fullName: formattedUsername,
      })
      setSuccessMsg('สมัครสมาชิกสำเร็จ! กำลังนำท่านไปยังหน้าเข้าสู่ระบบ...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge">
          <Gift size={14} />
          <span>สร้างบัญชีใหม่</span>
        </div>
        <h1 className="auth-title">สมัครสมาชิก</h1>
        <p className="auth-subtitle">กรอกชื่อใน Roblox และรหัสผ่านเพื่อเริ่มสะสมแต้ม</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            ชื่อผู้ใช้ใน Roblox (บังคับมี @ นำหน้า)
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
          <label className="form-label" htmlFor="reg-password">
            รหัสผ่าน (Password)
          </label>
          <div className="input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '2.8rem' }}
              required
            />
            <Lock className="input-icon" size={18} />
            <button
              type="button"
              onClick={togglePasswordVisibility}
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
              title={showPassword ? 'ซ่อนรหัสผ่านทั้งสองช่อง' : 'แสดงรหัสผ่านทั้งสองช่อง'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            ยืนยันรหัสผ่าน (Confirm Password)
          </label>
          <div className="input-wrapper">
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingRight: '2.8rem' }}
              required
            />
            <Lock className="input-icon" size={18} />
            <button
              type="button"
              onClick={togglePasswordVisibility}
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
              title={showPassword ? 'ซ่อนรหัสผ่านทั้งสองช่อง' : 'แสดงรหัสผ่านทั้งสองช่อง'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" />
              <span>กำลังสร้างบัญชี...</span>
            </>
          ) : (
            <>
              <UserCheck size={18} />
              <span>ยืนยันการสมัครสมาชิก</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        มีบัญชีอยู่อยู่แล้ว?
        <Link to="/login">เข้าสู่ระบบ</Link>
      </div>
    </div>
  )
}
