import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gift, ShoppingBag, ShieldCheck, Award, Zap, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [message, setMessage] = useState(null)

  // Order Confirmation State
  const [selectedItem, setSelectedItem] = useState(null)
  const [robloxUsername, setRobloxUsername] = useState('')
  const [orderNote, setOrderNote] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [buying, setBuying] = useState(false)

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
        setItems(data.items.slice(0, 8)) // Show top 8 latest items
      } else {
        setItems([])
      }
    } catch (err) {
      setItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleOpenItemDetail = (item) => {
    setSelectedItem(item)
    setQuantity(1)
    setOrderNote('')
    const defaultUsername = user?.user_metadata?.username || (user?.email ? user.email.split('@')[0] : '')
    setRobloxUsername(defaultUsername ? `@${defaultUsername.replace(/^@/, '')}` : '')
    setMessage(null)
  }

  const handleConfirmOrder = async () => {
    if (!selectedItem || selectedItem.stock <= 0) return

    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ')
      return
    }

    if (!robloxUsername.trim()) {
      alert('กรุณากรอกชื่อตัวละคร ROBLOX (USERNAME)')
      return
    }

    try {
      setBuying(true)
      setMessage(null)

      const totalPoints = selectedItem.points * quantity

      const res = await fetch(`${apiBaseUrl}/items/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: robloxUsername.trim(),
          item_id: selectedItem.id,
          item_title: selectedItem.title,
          points_spent: totalPoints,
          quantity: quantity,
          note: orderNote.trim()
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({
          success: true,
          text: `สั่งซื้อ "${selectedItem.title}" (x${quantity}) สำเร็จแล้ว! คำสั่งซื้อถูกส่งไปยังทีมงานเรียบร้อยแล้ว 🎉`
        })
        fetchItems() // Refresh stock count
        setSelectedItem(null) // Return to home view
      } else {
        setMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ' })
      }
    } catch (err) {
      setMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ได้' })
    } finally {
      setBuying(false)
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
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const currentBanner = banners[currentIndex] || {}

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
      {message && (
        <div className={`alert ${message.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
          {message.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {selectedItem ? (
        /* PRODUCT DETAIL & CHECKOUT CONFIRMATION VIEW (Matching Image 2 directly on Home Page) */
        <div style={{
          background: 'rgba(15, 21, 37, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '1.75rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: 4, height: 28, background: 'linear-gradient(to bottom, #ec4899, #6366f1)', borderRadius: 4 }} />
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                  ยืนยันการสั่งซื้อ
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  &gt; ตรวจสอบข้อมูลก่อนชำระแต้ม
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.35rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s ease',
                marginLeft: 'auto'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <ArrowLeft size={18} />
              <span>ย้อนกลับ</span>
            </button>
          </div>

          {/* 2-Column Checkout Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            {/* Left Card: Product Overview Summary */}
            <div style={{
              background: 'rgba(22, 30, 52, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Product Image Square Container */}
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                background: '#0a0d16',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: (selectedItem.stock !== undefined ? selectedItem.stock : 10) <= 0 ? 'grayscale(100%) brightness(0.3)' : 'none'
                  }}
                />
                {(selectedItem.stock !== undefined ? selectedItem.stock : 10) <= 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-8deg)',
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(239, 68, 68, 0.6)',
                    color: '#f87171',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    padding: '0.4rem 1.25rem',
                    borderRadius: '8px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.8)'
                  }}>
                    สินค้าหมด
                  </div>
                )}
              </div>

              {/* Product Title */}
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem'
              }}>
                {selectedItem.title}
              </h3>

              {/* Price & Stock status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ราคาต่อชิ้น</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                    {selectedItem.points} <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>PTS</span>
                  </span>
                </div>

                {(selectedItem.stock !== undefined ? selectedItem.stock : 10) <= 0 ? (
                  <span style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px'
                  }}>
                    สินค้าหมด
                  </span>
                ) : (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    color: '#34d399',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '6px',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                  }}>
                    คงเหลือ x{selectedItem.stock !== undefined ? selectedItem.stock : 10}
                  </span>
                )}
              </div>

              {/* Description / Notes */}
              <div style={{
                background: 'rgba(10, 13, 22, 0.5)',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}>
                {selectedItem.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </div>
            </div>

            {/* Right Card: Order Form Inputs */}
            <div style={{
              background: 'rgba(22, 30, 52, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {/* Field 1: ROBLOX USERNAME */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#f87171',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.4rem'
                }}>
                  ชื่อตัวละคร ROBLOX (USERNAME)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    placeholder="@YourRobloxName"
                    style={{
                      width: '100%',
                      background: 'rgba(10, 13, 22, 0.85)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      padding: '0.75rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxShadow: '0 0 12px rgba(239, 68, 68, 0.15)'
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  โปรดตรวจสอบชื่อตัวละครให้ถูกต้อง สินค้าจะถูกส่งไปยังชื่อนี้
                </p>
              </div>

              {/* Field 2: OPTIONAL NOTE TO ADMIN */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.4rem'
                }}>
                  หมายเหตุถึงแอดมิน (OPTION)
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="ฝากข้อความถึงแอดมิน..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(10, 13, 22, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Divider */}
              <div style={{ width: '100%', height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />

              {/* Field 3: Quantity Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  จำนวนที่ต้องการ (Quantity)
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(10, 13, 22, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: quantity <= 1 ? '#475569' : '#ffffff',
                      padding: '0.5rem 0.85rem',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Minus size={16} />
                  </button>

                  <span style={{
                    padding: '0 0.85rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    minWidth: 32,
                    textAlign: 'center'
                  }}>
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(Math.min((selectedItem.stock !== undefined ? selectedItem.stock : 10), quantity + 1))}
                    disabled={quantity >= (selectedItem.stock !== undefined ? selectedItem.stock : 10)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: quantity >= (selectedItem.stock !== undefined ? selectedItem.stock : 10) ? '#475569' : '#fbbf24',
                      padding: '0.5rem 0.85rem',
                      cursor: quantity >= (selectedItem.stock !== undefined ? selectedItem.stock : 10) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Field 4: Total Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  ยอดรวม (Total)
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                  {selectedItem.points * quantity} <span style={{ fontSize: '0.85rem', color: '#fbbf24' }}>PTS</span>
                </span>
              </div>

              {/* Submit Confirmation Button */}
              {(selectedItem.stock !== undefined ? selectedItem.stock : 10) > 0 ? (
                <button
                  onClick={handleConfirmOrder}
                  disabled={buying}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.2s ease',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <ShoppingCart size={18} />
                  <span>{buying ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}</span>
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-subtle)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'not-allowed',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>ไม่มีสินค้าในขณะนี้</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD HOME PAGE VIEW (Hero Banner + Latest Items Grid) */
        <>
          {/* Hero Banner Slider Section (Aspect Ratio 2048x512) */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2048 / 512',
            borderRadius: 24,
            overflow: 'hidden',
            marginBottom: '2.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#0c0f1d'
          }}>
            {banners.length > 0 ? (
              <>
                <img
                  src={currentBanner.image_url}
                  alt={currentBanner.title || 'Slide Banner'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'all 0.5s ease-in-out'
                  }}
                />

                {/* Gradient Overlay & Text Box */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '2rem 2.5rem',
                  background: 'linear-gradient(180deg, rgba(7, 9, 19, 0.1) 0%, rgba(7, 9, 19, 0.85) 100%)',
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

            {loadingItems ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem auto', width: 32, height: 32 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>กำลังโหลดรายการสินค้าล่าสุด...</p>
              </div>
            ) : items.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
                gap: '1.35rem'
              }}>
                {items.map((item) => {
                  const isOutOfStock = (item.stock !== undefined ? item.stock : 10) <= 0
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenItemDetail(item)}
                      style={{
                        background: 'rgba(22, 30, 52, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.borderColor = isOutOfStock ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.5)'
                        e.currentTarget.style.boxShadow = isOutOfStock ? '0 12px 25px rgba(239, 68, 68, 0.15)' : '0 12px 25px rgba(99, 102, 241, 0.25)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = isOutOfStock ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {/* Square Image Container */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#0a0d16',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={item.image_url}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: isOutOfStock ? 'grayscale(100%) brightness(0.3)' : 'none',
                            transition: 'transform 0.3s ease'
                          }}
                        />

                        {isOutOfStock && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-8deg)',
                            background: 'rgba(15, 23, 42, 0.92)',
                            border: '1px solid rgba(239, 68, 68, 0.6)',
                            color: '#f87171',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            padding: '0.4rem 1.25rem',
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.3)',
                            letterSpacing: '0.5px'
                          }}>
                            สินค้าหมด
                          </div>
                        )}
                      </div>

                      {/* Item Title */}
                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        marginTop: '0.85rem',
                        marginBottom: '0.5rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '0.3px'
                      }}>
                        {item.title}
                      </h3>

                      {/* Price and Stock Status Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '0.85rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ราคา</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.2rem', lineHeight: 1.1 }}>
                            <span>{item.points}</span>
                            <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>PTS</span>
                          </div>
                        </div>

                        {isOutOfStock ? (
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#fca5a5',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '6px'
                          }}>
                            หมด
                          </span>
                        ) : (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.18)',
                            border: '1px solid rgba(16, 185, 129, 0.45)',
                            color: '#34d399',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '6px',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                          }}>
                            x{item.stock !== undefined ? item.stock : 10}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {!isOutOfStock ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenItemDetail(item)
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.65rem',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.45)'}
                          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.35)'}
                        >
                          <ShoppingCart size={16} />
                          <span>สั่งซื้อ</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-subtle)',
                            borderRadius: '10px',
                            padding: '0.65rem',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'not-allowed',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem'
                          }}
                        >
                          <ShoppingCart size={16} />
                          <span>ไม่มีสินค้า</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <ShoppingBag size={40} color="var(--primary)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>ยังไม่มีสินค้าในคลัง</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>สามารถเพิ่มสินค้าใหม่เข้าคลังได้จากหน้า Backend Admin Panel</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
