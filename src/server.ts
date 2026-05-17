import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import articleRoutes from './routes/articleRoutes'
import userRoutes from './routes/userRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/users', userRoutes)

app.get('/health', (req, res) => {
  res.json({ message: 'Server is running!' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

export default app