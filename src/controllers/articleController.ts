import { Request, Response } from 'express'
import pool from '../database/connection'

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query

    let query = `
      SELECT a.*, u.name as author_name
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      query += ' AND (a.title LIKE ? OR a.content LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category) {
      query += ' AND a.category = ?'
      params.push(category)
    }

    query += ' ORDER BY a.created_at DESC'

    const [articles] = await pool.query(query, params)
    return res.json(articles)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const [articles] = await pool.query(
      `SELECT a.*, u.name as author_name
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [id]
    )

    const article = (articles as any[])[0]
    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado' })
    }

    const [comments] = await pool.query(
      `SELECT c.*, u.name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.article_id = ?
       ORDER BY c.created_at DESC`,
      [id]
    )

    return res.json({ ...article, comments })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, category, banner } = req.body
    const userId = req.userId

    if (!title || !content) {
      return res.status(400).json({ message: 'Título e conteúdo são obrigatórios' })
    }

    const wordCount = content.split(' ').length
    const readTime = Math.ceil(wordCount / 200)

    const [result] = await pool.query(
      `INSERT INTO articles (title, content, category, banner, author_id, average_read_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, category || null, banner || null, userId, readTime]
    )

    return res.status(201).json({
      message: 'Artigo criado com sucesso',
      articleId: (result as any).insertId,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, category, banner } = req.body
    const userId = req.userId

    const [articles] = await pool.query('SELECT * FROM articles WHERE id = ?', [id])
    const article = (articles as any[])[0]

    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado' })
    }

    if (article.author_id !== userId) {
      return res.status(403).json({ message: 'Não autorizado' })
    }

    const wordCount = content.split(' ').length
    const readTime = Math.ceil(wordCount / 200)

    await pool.query(
      `UPDATE articles
       SET title = ?, content = ?, category = ?, banner = ?, average_read_time = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, content, category || null, banner || null, readTime, id]
    )

    return res.json({ message: 'Artigo atualizado com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const [articles] = await pool.query('SELECT * FROM articles WHERE id = ?', [id])
    const article = (articles as any[])[0]

    if (!article) {
      return res.status(404).json({ message: 'Artigo não encontrado' })
    }

    if (article.author_id !== userId) {
      return res.status(403).json({ message: 'Não autorizado' })
    }

    await pool.query('DELETE FROM articles WHERE id = ?', [id])

    return res.json({ message: 'Artigo deletado com sucesso' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const getMyArticles = async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    const [articles] = await pool.query(
      `SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC`,
      [userId]
    )

    return res.json(articles)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.userId

    if (!content) {
      return res.status(400).json({ message: 'Conteúdo é obrigatório' })
    }

    const [result] = await pool.query(
      'INSERT INTO comments (content, article_id, user_id) VALUES (?, ?, ?)',
      [content, id, userId]
    )

    const [comments] = await pool.query(
      `SELECT c.*, u.name FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [(result as any).insertId]
    )

    return res.status(201).json((comments as any[])[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const likeArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    const [existing] = await pool.query(
      'SELECT * FROM likes WHERE article_id = ? AND user_id = ?',
      [id, userId]
    )

    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: 'Artigo já curtido' })
    }

    await pool.query('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [id, userId])
    await pool.query('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id])

    return res.json({ message: 'Artigo curtido' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}

export const unlikeArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    await pool.query('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [id, userId])
    await pool.query('UPDATE articles SET likes = likes - 1 WHERE id = ? AND likes > 0', [id])

    return res.json({ message: 'Curtida removida' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro no servidor' })
  }
}