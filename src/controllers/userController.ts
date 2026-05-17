import { Request, Response } from 'express'
import pool from '../database/connection'

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { name, email, bio } = req.body

    if (!name || !email) {
      return res.status(400).json({ message: 'Nome e email são obrigatórios' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    )

    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' })
    }

    await pool.query(
      'UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?',
      [name, email, bio || null, userId]
    )

    return res.json({ message: 'Perfil atualizado com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}