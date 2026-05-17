import { Router } from 'express'
import { updateProfile } from '../controllers/userController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.put('/profile', authMiddleware, updateProfile)

export default router