import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'))
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null

// GET /api/items - Get all shop items
router.get('/', async (req, res) => {
  if (!supabase) return res.json({ success: true, items: [] })
  const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, items: data || [] })
})

// POST /api/items - Admin Add New Item
router.post('/', async (req, res) => {
  const { title, description, points, stock, image_url, category_id, category_name } = req.body
  if (!title || !points) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อสินค้าและจำนวนพอยท์' })
  }

  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { data, error } = await supabase.from('items').insert([{
    title,
    description: description || '',
    points: parseInt(points, 10),
    stock: parseInt(stock || 10, 10),
    image_url: image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
    category_id: category_id || null,
    category_name: category_name || null
  }]).select()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.status(201).json({ success: true, message: 'เพิ่มสินค้าเข้าคลังสำเร็จ!', item: data[0] })
})

// DELETE /api/items/:id - Admin Delete Item
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'ลบสินค้าเรียบร้อยแล้ว!' })
})

// PATCH /api/items/:id - Admin Edit Item
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, points, stock, image_url, category_id, category_name } = req.body
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const updateFields = {}
  if (title !== undefined) updateFields.title = title
  if (description !== undefined) updateFields.description = description
  if (points !== undefined) updateFields.points = parseInt(points, 10)
  if (stock !== undefined) updateFields.stock = parseInt(stock, 10)
  if (image_url !== undefined) updateFields.image_url = image_url
  if (category_id !== undefined) updateFields.category_id = category_id
  if (category_name !== undefined) updateFields.category_name = category_name

  const { data, error } = await supabase.from('items').update(updateFields).eq('id', id).select()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'แก้ไขสินค้าสำเร็จ!', item: data[0] })
})

// CATEGORIES API
// GET /api/items/categories - Get list of categories
router.get('/categories', async (req, res) => {
  if (!supabase) return res.json({ success: true, categories: [] })
  const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, categories: data || [] })
})

// POST /api/items/categories - Admin Add Category / Map
router.post('/categories', async (req, res) => {
  const { name, description, image_url } = req.body
  if (!name) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดหมู่/แมพ' })

  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { data, error } = await supabase.from('categories').insert([{
    name,
    description: description || 'เลือกหมวดหมู่เพื่อดูเพิ่มเติม',
    image_url: image_url || ''
  }]).select()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.status(201).json({ success: true, message: 'เพิ่มหมวดหมู่สำเร็จ!', category: data[0] })
})

// PATCH /api/items/categories/:id - Admin Edit Category
router.patch('/categories/:id', async (req, res) => {
  const { id } = req.params
  const { name, description, image_url } = req.body
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const updateFields = {}
  if (name !== undefined) updateFields.name = name
  if (description !== undefined) updateFields.description = description
  if (image_url !== undefined) updateFields.image_url = image_url

  const { data, error } = await supabase.from('categories').update(updateFields).eq('id', id).select()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'แก้ไขหมวดหมู่สำเร็จ!', category: data[0] })
})

// DELETE /api/items/categories/:id - Admin Delete Category
router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ!' })
})

// GET /api/items/orders - Admin Get All Orders
router.get('/orders', async (req, res) => {
  if (!supabase) return res.json({ success: true, orders: [] })
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, orders: data || [] })
})

// POST /api/items/orders - Player Redeem/Buy Item
router.post('/orders', async (req, res) => {
  const { user_id, username, item_id, item_title, points_spent } = req.body
  if (!username || !item_title || !points_spent) {
    return res.status(400).json({ success: false, message: 'ข้อมูลคำสั่งซื้อไม่ครบถ้วน' })
  }

  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { data, error } = await supabase.from('orders').insert([{
    user_id: user_id || null,
    username: username,
    item_id: item_id || null,
    item_title: item_title,
    points_spent: parseInt(points_spent, 10),
    status: 'pending'
  }]).select()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.status(201).json({ success: true, message: 'ส่งคำสั่งแลกสินค้าเรียบร้อยแล้ว!', order: data[0] })
})

// PATCH /api/items/orders/:id - Admin Update Order Status
router.patch('/orders/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'อัปเดตสถานะออเดอร์สำเร็จ!', order: data[0] })
})

// BANNERS API
// GET /api/items/banners - Get list of slider banners
router.get('/banners', async (req, res) => {
  if (!supabase) return res.json({ success: true, banners: [] })
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, banners: data || [] })
})

// POST /api/items/banners - Admin Add Banner Slide Image
router.post('/banners', async (req, res) => {
  const { image_url, title } = req.body
  if (!image_url) return res.status(400).json({ success: false, message: 'กรุณาระบุ URL รูปภาพ' })

  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { data, error } = await supabase.from('banners').insert([{ image_url, title: title || 'แบนเนอร์กิจกรรม' }]).select()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.status(201).json({ success: true, message: 'เพิ่มรูปสไลด์แบนเนอร์สำเร็จ!', banner: data[0] })
})

// PATCH /api/items/banners/:id - Admin Edit Banner
router.patch('/banners/:id', async (req, res) => {
  const { id } = req.params
  const { title, image_url } = req.body
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const updateFields = {}
  if (title !== undefined) updateFields.title = title
  if (image_url !== undefined) updateFields.image_url = image_url

  const { data, error } = await supabase.from('banners').update(updateFields).eq('id', id).select()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'แก้ไขแบนเนอร์สำเร็จ!', banner: data[0] })
})

// DELETE /api/items/banners/:id - Admin Delete Banner Slide Image
router.delete('/banners/:id', async (req, res) => {
  const { id } = req.params
  if (!supabase) return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า Supabase' })

  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, message: 'ลบรูปสไลด์แบนเนอร์สำเร็จ!' })
})

export default router
