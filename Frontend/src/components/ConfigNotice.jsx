import React from 'react'
import { AlertTriangle, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const ConfigNotice = () => {
  const { isSupabaseConfigured } = useAuth()

  if (isSupabaseConfigured) return null

  return (
    <div className="alert alert-warning" style={{ margin: '1rem 2rem 0 2rem' }}>
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>ยังไม่ได้ตั้งค่า Supabase Credentials:</strong>
        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
          กรุณานำ <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>SUPABASE_URL</code> และ <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>SUPABASE_ANON_KEY</code> มาใส่ในไฟล์ <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>Frontend/.env</code> เพื่อเปิดใช้งานการเชื่อมต่อแบบเรียลไทม์
        </p>
      </div>
    </div>
  )
}
