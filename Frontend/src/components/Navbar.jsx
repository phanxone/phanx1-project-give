import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gift, LogOut, User, ShieldCheck, ShoppingBag, Home, ChevronDown, Zap, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, signOut, userPoints } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    try {
      await signOut()
      setIsOpen(false)
      setShowDropdown(false)
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const usernameDisplay = user?.user_metadata?.username || (user?.email ? `@${user.email.split('@')[0]}` : '@User')
  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar-wrapper">
      <div className="navbar-pill">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={() => setIsOpen(false)}>
          <div className="brand-icon">
            <Gift size={20} color="#ffffff" />
          </div>
          <span>Rewards Exchange</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-menu-desktop">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={15} style={{ marginRight: 6 }} />
            หน้าแรก
          </Link>

          <Link to="/shop" className={`nav-link ${isActive('/shop') ? 'active' : ''}`}>
            <ShoppingBag size={15} style={{ marginRight: 6 }} />
            คลังสินค้า
          </Link>
        </nav>

        {/* Desktop User Profile Dropdown & Points Badge */}
        <div className="btn-cta-desktop" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {/* Points Badge on Navbar */}
              <div className="points-tag" style={{ borderRadius: 9999, padding: '0.35rem 0.85rem' }}>
                <Zap size={14} />
                <span>{userPoints !== undefined ? userPoints : 500} PTS</span>
              </div>

              {/* User Dropdown Pill */}
              <div className="profile-dropdown-wrapper">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn-secondary"
                  style={{
                    borderRadius: 9999,
                    padding: '0.45rem 1.1rem',
                    fontSize: '0.85rem',
                    borderColor: showDropdown ? 'var(--primary)' : 'var(--border-glass)'
                  }}
                >
                  <User size={15} color="var(--primary)" />
                  <span>{usernameDisplay}</span>
                  <ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div style={{ padding: '0.65rem 0.9rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{usernameDisplay}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Award size={12} />
                        <span>สะสม {userPoints !== undefined ? userPoints : 500} พอยท์</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger"
                    >
                      <LogOut size={16} />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-cta">
              <ShieldCheck size={16} />
              <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
