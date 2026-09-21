import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Zap, CheckCircle2, AlertCircle, ArrowLeft, ShoppingCart, Lock, Minus, Plus, MessageSquare, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Shop = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [buying, setBuying] = useState(false)

  // Order Form State
  const [robloxUsername, setRobloxUsername] = useState('')
  const [orderNote, setOrderNote] = useState('')
  const [quantity, setQuantity] = useState(1)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [catRes, itemRes] = await Promise.all([
        fetch(`${apiBaseUrl}/items/categories`),
        fetch(`${apiBaseUrl}/items`)
      ])
      const catData = await catRes.json()
      const itemData = await itemRes.json()

      if (catData.categories) setCategories(catData.categories)
      if (itemData.items) setItems(itemData.items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
        fetchData() // Refresh stock count
        setSelectedItem(null) // Return to item list
      } else {
        setMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ' })
      }
    } catch (err) {
      setMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ได้' })
    } finally {
      setBuying(false)
    }
  }

  const filteredItems = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory.id || i.category_name === selectedCategory.name)
    : items

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
      {/* Breadcrumb Sequential Steps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '1.25rem',
        background: 'rgba(18, 24, 38, 0.6)',
        padding: '0.5rem 1rem',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap'
      }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>🏠 หน้าแรก</Link>
        <span>/</span>
        <span
          onClick={() => { setSelectedCategory(null); setSelectedItem(null); }}
          style={{
            color: selectedCategory ? 'var(--secondary)' : '#fff',
            fontWeight: selectedCategory ? 500 : 600,
            cursor: selectedCategory ? 'pointer' : 'default'
          }}
        >
          🎒 คลังสินค้า (หมวดหมู่)
        </span>
        {selectedCategory && (
          <>
            <span>/</span>
            <span
              onClick={() => setSelectedItem(null)}
              style={{
                color: selectedItem ? 'var(--secondary)' : '#fff',
                fontWeight: selectedItem ? 500 : 600,
                cursor: selectedItem ? 'pointer' : 'default'
              }}
            >
              📦 {selectedCategory.name}
            </span>
          </>
        )}
        {selectedItem && (
          <>
            <span>/</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>🛒 {selectedItem.title}</span>
          </>
        )}
      </div>

      {message && (
        <div className={`alert ${message.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {message.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto', width: 36, height: 36 }} />
          <p style={{ color: 'var(--text-muted)' }}>กำลังโหลดหมวดหมู่สินค้า...</p>
        </div>
      ) : !selectedCategory ? (
        /* CATEGORIES VIEW (2 Columns Grid) */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag color="var(--secondary)" />
                <span>หมวดหมู่สินค้า & แมพเกม (Item Categories)</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>เลือกหมวดหมู่หรือแมพเกมเพื่อเลือกแลกของรางวัล</p>
            </div>
          </div>

          {categories.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {categories.map((cat) => {
                const count = items.filter(i => i.category_id === cat.id || i.category_name === cat.name).length
                return (
                  <div
                    key={cat.id}
                    className="card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      background: 'rgba(18, 24, 38, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {/* Category Banner Image Header */}
                    <div style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      background: '#0d111a',
                      position: 'relative'
                    }}>
                      <img
                        src={cat.image_url || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600'}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Category Details Footer Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '1rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cat.name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {count > 0 ? `มีสินค้า ${count} รายการ` : (cat.description || 'เลือกหมวดหมู่เพื่อดูเพิ่มเติม')}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          background: 'linear-gradient(135deg, #00e676, #00c853)',
                          color: '#042010',
                          border: 'none',
                          padding: '0.5rem 1.1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 15px rgba(0, 230, 118, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        สินค้าทั้งหมด
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <ShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>ยังไม่ได้สร้างหมวดหมู่ / แมพสินค้า</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 1.5rem auto' }}>
                คุณสามารถตั้งค่าเพิ่มหมวดหมู่สินค้าและแมพต่างๆ (เช่น Blox Fruits, Steal An Egg, เติม Robux) ได้ที่หน้า Backend Admin Panel
              </p>
            </div>
          )}
        </div>
      ) : selectedItem ? (
        /* PRODUCT DETAIL & CHECKOUT CONFIRMATION VIEW (Matching Reference Image in Website Theme) */
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
                    filter: selectedItem.stock <= 0 ? 'grayscale(100%) brightness(0.3)' : 'none'
                  }}
                />
                {selectedItem.stock <= 0 && (
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

                {selectedItem.stock <= 0 ? (
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
                    คงเหลือ x{selectedItem.stock}
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
                    onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))}
                    disabled={quantity >= selectedItem.stock}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: quantity >= selectedItem.stock ? '#475569' : '#fbbf24',
                      padding: '0.5rem 0.85rem',
                      cursor: quantity >= selectedItem.stock ? 'not-allowed' : 'pointer',
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
              {selectedItem.stock > 0 ? (
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
        /* ITEMS VIEW IN SELECTED CATEGORY (Grid of Products) */
        <div style={{
          background: 'rgba(15, 21, 37, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '1.75rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)'
        }}>
          {/* Top Header Row with Back Button on the Right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: 4, height: 28, background: 'linear-gradient(to bottom, #ec4899, #6366f1)', borderRadius: 4 }} />
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                  {selectedCategory.name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  &gt; เลือกไอเทมที่ต้องการแลกรับ
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCategory(null)}
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

          {/* Items Grid Layout with Website Glass Theme */}
          {filteredItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))',
              gap: '1.35rem'
            }}>
              {filteredItems.map((item) => {
                const isOutOfStock = item.stock <= 0
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
                          x{item.stock}
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
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <ShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>ยังไม่มีสินค้าในหมวดหมู่นี้</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>คุณสามารถลงสินค้าใหม่ได้ที่หน้า Backend Admin Panel ครับ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
