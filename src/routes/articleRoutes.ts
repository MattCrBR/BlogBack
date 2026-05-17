import { Router } from 'express'
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  addComment,
  likeArticle,
  unlikeArticle,
} from '../controllers/articleController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/', getArticles)
router.get('/user/my-articles', authMiddleware, getMyArticles)
router.get('/:id', getArticleById)
router.post('/', authMiddleware, createArticle)
router.put('/:id', authMiddleware, updateArticle)
router.delete('/:id', authMiddleware, deleteArticle)
router.post('/:id/comments', authMiddleware, addComment)
router.post('/:id/like', authMiddleware, likeArticle)
router.delete('/:id/like', authMiddleware, unlikeArticle)

export default router