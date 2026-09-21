import React, { useState, useEffect } from 'react'
import { ShieldCheck, Award, Gift, Zap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Dashboard = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [orderMessage, setOrderMessage] = useState(null)
  const [buyingId, setBuyingId] = useState(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
  const userMetadata = user?.user_metadata || {}
  const displayName = userMetadata.username || userMetadata.full_name || (user?.email ? `@${user.email.split('@')[0]}` : '@User')

  useEffect(() => {
    fetchShopItems()
  }, [])

  const fetchShopItems = async () => {
    try {
      setLoadingItems(true)
      const res = await fetch(`${apiBaseUrl}/items`)
      const data = await res.json()
      if (data.items && data.items.length > 0) {
        setItems(data.items)
      } else {
        // Fallback items if API is empty
        setItems([
          { id: '1', title: 'บัตรเติมน้ำมัน 500 บาท', description: 'คูปองส่วนลดเติมน้ำมันสุดคุ้ม', points: 500, stock: 10, image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500' },
          { id: '2', title: 'หูฟังบลูทูธ Wireless Pro', description: 'หูฟังไร้สายคุณภาพสูง ตัดเสียงรบกวน', points: 1200, stock: 5, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
          { id: '3', title: 'ส่วนลดคูปองอาหาร 200 บาท', description: 'คูปองส่วนลดสำหรับร้านอาหารชั้นนำ', points: 200, stock: 20, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500' },
          { id: '4', title: 'แก้วน้ำเก็บความเย็น 750ml', description: 'แก้วสแตนเลสเก็บความเย็นข้ามวัน', points: 350, stock: 15, image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500' }
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleRedeemItem = async (item) => {
    try {
      setBuyingId(item.id)
      setOrderMessage(null)

      const res = await fetch(`${apiBaseUrl}/items/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          username: displayName,
          item_id: item.id,
          item_title: item.title,
          points_spent: item.points
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setOrderMessage({ success: true, text: `สั่งซื้อ/แลกสินค้า "${item.title}" สำเร็จ! ออเดอร์ถูกส่งไปยัง Backend Admin เรียบร้อยแล้ว 🎉` })
      } else {
        setOrderMessage({ success: false, text: data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ' })
      }
    } catch (err) {
      setOrderMessage({ success: false, text: 'ไม่สามารถเชื่อมต่อ API ส่งออเดอร์ไปยัง Backend ได้' })
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Hero User Banner */}
      <div className="dashboard-hero">
        <div className="profile-info">
          <div className="avatar">
            {displayName.replace(/^@/, '').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h2>ยินดีต้อนรับ, {displayName}!</h2>
            <p>ชื่อใน Roblox: {displayName}</p>
            <div className="status-badge">
              <ShieldCheck size={14} />
              <span>ยืนยันตัวตนแล้ว (Roblox Auth)</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คะแนนสะสมของคุณ</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Award size={28} />
            <span>500 PTS</span>
          </div>
        </div>
      </div>

      {/* Order Status Notification */}
      {orderMessage && (
        <div className={`alert ${orderMessage.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {orderMessage.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{orderMessage.text}</span>
        </div>
      )}

      {/* Rewards Exchange Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            <Gift size={20} color="var(--secondary)" />
            <span>รายการของรางวัลแนะนำสำหรับแลก (Exchange Preview)</span>
          </h2>
          <button onClick={fetchShopItems} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            <span>อัปเดตคลังสินค้า</span>
          </button>
        </div>

        {loadingItems ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>กำลังดึงรายการสินค้าจากคลัง...</p>
          </div>
        ) : (
          <div className="grid-cards">
            {items.map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: '0.85rem', background: '#000' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1rem' }}>{item.description || 'ไอเท็มแลกของรางวัลสุดพิเศษ'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span className="points-tag">
                    <Zap size={14} />
                    {item.points} แต้ม
                  </span>
                  <button
                    onClick={() => handleRedeemItem(item)}
                    className="btn-primary"
                    disabled={buyingId === item.id}
                    style={{ marginTop: 0, padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    {buyingId === item.id ? 'กำลังแลก...' : '🛒 แลกของรางวัล'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
