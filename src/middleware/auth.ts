import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            userId?: number
        }
   }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => { const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any 
        req.userId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' })
    }
}