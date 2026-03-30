import type { FastifyInstance } from 'fastify'
import { createUserController } from './controllers/createUserController'
import { authenticateController } from './controllers/authenticateController'
import { refreshTokenController } from './controllers/refreshTokenController'
import { logoutController } from './controllers/logoutController'
import { verifyJwt } from '@shared/middleware/verify-jwt'

export async function authRoutes(app: FastifyInstance) {
  // Pública
  app.post('/register', createUserController)
  app.post('/login', authenticateController)
  app.post('/refresh', refreshTokenController)

  // Protegida
  app.delete('/logout', { preHandler: [verifyJwt] }, logoutController)
}
