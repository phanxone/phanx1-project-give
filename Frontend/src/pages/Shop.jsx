import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Zap, CheckCircle2, AlertCircle, ArrowLeft, ShoppingCart, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Shop = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [buyingId, setBuyingId] = useState(null)

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

  const handleRedeem = async (item) => {
    if (item.stock <= 0) return

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
        setMessage({ success: true, text: `สั่งซื้อ/แลกสินค้า "${item.title}" สำเร็จ! ออเดอร์ถูกส่งไปยัง Backend Admin เรียบร้อยแล้ว 🎉` })
        fetchData() // Refresh stock count
      } else {
        setMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการแลกสินค้า' })
      }
    } catch (err) {
      setMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ได้' })
    } finally {
      setBuyingId(null)
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
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>🏠 หน้าแรก</Link>
        <span>/</span>
        <span
          onClick={() => setSelectedCategory(null)}
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
            <span style={{ color: '#fff', fontWeight: 600 }}>📦 {selectedCategory.name}</span>
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
              gridTemplateColumns: 'repeat(2, 1fr)',
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
      ) : (
        /* ITEMS VIEW IN SELECTED CATEGORY (Matching Image 1 Design) */
        <div style={{ background: 'rgba(15, 17, 26, 0.85)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {/* Top Header Row matching Image 1 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                background: 'linear-gradient(135deg, #f95700, #ff5722)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(249, 87, 0, 0.35)'
              }}
            >
              <ArrowLeft size={18} />
              <span>กลับ</span>
            </button>

            <div style={{ width: 3, height: 26, background: '#f95700', borderRadius: 2 }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2 }}>
                {selectedCategory.name}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                &gt; เลือกไอเทมที่ต้องการ
              </p>
            </div>
          </div>

          {/* Items Grid Layout matching Image 1 */}
          {filteredItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredItems.map((item) => {
                const isOutOfStock = item.stock <= 0
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#181b26',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, border-color 0.2s'
                    }}
                  >
                    {/* Square Image Box with Overlay if Out of Stock */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0c0e14',
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
                          filter: isOutOfStock ? 'grayscale(100%) brightness(0.35)' : 'none'
                        }}
                      />

                      {isOutOfStock && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%) rotate(-10deg)',
                          background: 'rgba(0, 0, 0, 0.85)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          padding: '0.35rem 1.25rem',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.8)'
                        }}>
                          สินค้าหมด
                        </div>
                      )}
                    </div>

                    {/* Item Title */}
                    <h3 style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      marginTop: '0.75rem',
                      marginBottom: '0.5rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.5px'
                    }}>
                      {item.title}
                    </h3>

                    {/* Price and Stock Status Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>ราคา</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f95700', lineHeight: 1.1 }}>
                          {item.points} <span style={{ fontSize: '0.75rem' }}>PTS</span>
                        </div>
                      </div>

                      {isOutOfStock ? (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          color: '#fca5a5',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          หมด
                        </span>
                      ) : (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          color: '#34d399',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px'
                        }}>
                          x{item.stock}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {!isOutOfStock ? (
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={buyingId === item.id}
                        style={{
                          background: 'linear-gradient(135deg, #f95700, #ff5722)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(249, 87, 0, 0.3)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <ShoppingCart size={16} />
                        <span>{buyingId === item.id ? 'กำลังสั่งซื้อ...' : 'สั่งซื้อ'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#6b7280',
                          borderRadius: '6px',
                          padding: '0.6rem',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'not-allowed',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
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
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <ShoppingBag size={44} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>ยังไม่มีสินค้าในหมวดหมู่นี้</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>คุณสามารถลงสินค้าใหม่ได้ที่หน้า Backend Admin Panel ครับ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
