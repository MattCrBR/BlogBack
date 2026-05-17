import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../database/connection'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'As senhas não correspondem' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    return res.status(201).json({ message: 'Usuário criado com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' })
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const user = (users as any[])[0]

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    return res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}