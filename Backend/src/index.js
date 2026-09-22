import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import itemRoutes from './routes/itemRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware with 50mb Body Limit for File Uploads
app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve Static Files
app.use(express.static(path.join(__dirname, '../public')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/items', itemRoutes)

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'))
})

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'))
})

// Fallback to Login Page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  })
})

app.listen(PORT, () => {
  console.log(`=================================`)
  console.log(`🚀 Rewards Exchange Backend Running`)
  console.log(`🌐 URL: http://localhost:${PORT}`)
  console.log(`=================================`)
})
