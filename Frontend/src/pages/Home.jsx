import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Gift, ShoppingBag, ShieldCheck, Award, Zap, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Home = () => {
  const { user } = useAuth()
  const [banners, setBanners] = useState([])
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [buyingId, setBuyingId] = useState(null)
  const [message, setMessage] = useState(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const usernameDisplay = user?.user_metadata?.username || (user?.email ? `@${user.email.split('@')[0]}` : null)

  useEffect(() => {
    fetchBanners()
    fetchItems()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/items/banners`)
      const data = await res.json()
      if (data.banners && data.banners.length > 0) {
        setBanners(data.banners)
      } else {
        setBanners([])
      }
    } catch (err) {
      setBanners([])
    }
  }

  const fetchItems = async () => {
    try {
      setLoadingItems(true)
      const res = await fetch(`${apiBaseUrl}/items`)
      const data = await res.json()
      if (data.items && data.items.length > 0) {
        setItems(data.items.slice(0, 6)) // Show top 6 latest items
      } else {
        setItems([])
      }
    } catch (err) {
      setItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleRedeem = async (item) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการซื้อ/แลกสินค้า')
      return
    }

    const username = user.user_metadata?.username || user.email?.split('@')[0]

    try {
      setBuyingId(item.id)
      setMessage(null)

      const res = await fetch(`${apiBaseUrl}/items/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: username,
          item_id: item.id,
          item_title: item.title,
          points_spent: item.points
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ success: true, text: `สั่งซื้อ/แลกสินค้า "${item.title}" สำเร็จ! 🎉` })
      } else {
        setMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการแลกสินค้า' })
      }
    } catch (err) {
      setMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ได้' })
    } finally {
      setBuyingId(null)
    }
  }

  // Auto Slide Change every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners])

  const nextSlide = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }
  }

  const prevSlide = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }

  const currentBanner = banners[currentIndex]

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* Banner Image Slider Section */}
      <div className="card" style={{
        padding: 0,
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        height: 380,
        borderRadius: 'var(--radius-xl)'
      }}>
        {banners.length > 0 ? (
          <>
            {/* Slide Image */}
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title || 'banner'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: 'brightness(0.65)'
              }}
            />

            {/* Banner Content Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2.5rem',
              background: 'linear-gradient(180deg, rgba(7, 9, 19, 0.1) 0%, rgba(7, 9, 19, 0.8) 100%)',
              zIndex: 2
            }}>
              {currentBanner.title && (
                <h1 style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  textShadow: '0 4px 15px rgba(0,0,0,0.8)',
                  lineHeight: 1.25,
                  maxWidth: 750
                }}>
                  {currentBanner.title}
                </h1>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Link to="/shop" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none', marginTop: 0 }}>
                  <ShoppingBag size={18} />
                  <span>เข้าชมคลังสินค้า</span>
                </Link>

                {!user ? (
                  <Link to="/login" className="btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none' }}>
                    <ShieldCheck size={18} />
                    <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
                  </Link>
                ) : (
                  <div className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
                    <Award size={18} color="var(--accent-amber)" />
                    <span>ยินดีต้อนรับ {usernameDisplay}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  onClick={nextSlide}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <ChevronRight size={22} />
                </button>

                {/* Slider Dots */}
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      style={{
                        width: currentIndex === i ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: currentIndex === i ? 'var(--primary)' : 'rgba(255, 255, 255, 0.4)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))'
          }}>
            <ImageIcon size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>ยังไม่ได้เพิ่มรูปสไลด์แบนเนอร์</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>สามารถเพิ่มรูปแบนเนอร์ใหม่ได้ที่หน้า Backend Admin Panel</p>
            <Link to="/shop" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none', marginTop: 0 }}>
              <ShoppingBag size={18} />
              <span>เข้าชมคลังสินค้า</span>
            </Link>
          </div>
        )}
      </div>

      {/* Latest Items Section */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles color="var(--accent-amber)" size={22} />
              <span>🔥 สินค้าล่าสุด / ของรางวัลแนะนำ</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>รายการของรางวัลล่าสุดที่คุณสามารถใช้แต้มสะสมแลกได้ทันที</p>
          </div>
          <Link to="/shop" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>ดูสินค้าทั้งหมด</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {message && (
          <div className={`alert ${message.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
            {message.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {loadingItems ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto', width: 32, height: 32 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>กำลังโหลดรายการสินค้าล่าสุด...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid-cards">
            {items.map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem' }}>{item.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span className="points-tag">
                    <Zap size={14} />
                    {item.points} แต้ม
                  </span>
                  <button
                    onClick={() => handleRedeem(item)}
                    className="btn-primary"
                    disabled={buyingId === item.id}
                    style={{ marginTop: 0, padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
                  >
                    {buyingId === item.id ? 'กำลังสั่งซื้อ...' : '🛒 สั่งซื้อ / แลก'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <ShoppingBag size={40} color="var(--primary)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>ยังไม่มีสินค้าในคลัง</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>สามารถเพิ่มสินค้าใหม่เข้าคลังได้จากหน้า Backend Admin Panel</p>
          </div>
        )}
      </div>
    </div>
  )
}
