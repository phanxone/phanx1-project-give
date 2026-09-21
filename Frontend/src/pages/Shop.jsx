import React, { useEffect, useState } from 'react'
import { ShoppingBag, Zap, CheckCircle2, AlertCircle, ArrowLeft, Grid, Layers, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Shop = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null) // null = view categories grid, or category object
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
      } else {
        setMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการแลกสินค้า' })
      }
    } catch (err) {
      setMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ได้' })
    } finally {
      setBuyingId(null)
    }
  }

  // Filter items by category if selected
  const filteredItems = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory.id || i.category_name === selectedCategory.name)
    : items

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag color="var(--secondary)" />
            <span>{selectedCategory ? `คลังสินค้า: ${selectedCategory.name}` : 'หมวดหมู่สินค้า & แมพเกม (Item Categories)'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {selectedCategory ? 'เลือกแลกไอเท็มสะสมในหมวดหมู่นี้' : 'เลือกหมวดหมู่หรือแมพเกมเพื่อเลือกแลกของรางวัล'}
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="btn-secondary"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>ย้อนกลับไปเลือกหมวดหมู่</span>
          </button>
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
        {/* CATEGORIES VIEW (Matching Image 2 Layout - 2 Columns Grid) */}
        <div>
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
            /* Empty Categories State */
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
        /* ITEMS VIEW IN SELECTED CATEGORY */
        <div>
          {filteredItems.length > 0 ? (
            <div className="grid-cards">
              {filteredItems.map((item) => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{item.title}</h3>
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
                      style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      {buyingId === item.id ? 'กำลังสั่งซื้อ...' : '🛒 สั่งซื้อ / แลก'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <ShoppingBag size={44} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>ยังไม่มีสินค้าในหมวดหมู่นี้</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>คุณสามารถเลือกหมวดหมู่นี้ตอนลงสินค้าใหม่ที่หน้า Backend Admin Panel ได้ครับ</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
