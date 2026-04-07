import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createUserController, createUserBodySchema } from './controllers/createUserController'
import { authenticateController, authenticateBodySchema } from './controllers/authenticateController'
import { refreshTokenController, refreshTokenBodySchema } from './controllers/refreshTokenController'
import { logoutController } from './controllers/logoutController'
import { googleAuthController, googleAuthBodySchema } from './controllers/googleAuthController'
import { verifyJwt } from '@shared/middleware/verify-jwt'

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Criar uma nova conta (Dono ou Veterinário)',
      body: createUserBodySchema,
    },
  }, createUserController)

  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar com email e senha',
      body: authenticateBodySchema,
    },
  }, authenticateController)

  app.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Renovar o token de acesso (Refresh Token)',
      body: refreshTokenBodySchema,
    },
  }, refreshTokenController)

  app.delete('/logout', {
    preHandler: [verifyJwt],
    schema: {
      tags: ['Auth'],
      summary: 'Encerrar sessão ativa',
      security: [{ bearerAuth: [] }],
    },
  }, logoutController)

  app.post('/google', {
    schema: {
      tags: ['Auth'],
      summary: 'Login / Registro com Google (envia o idToken obtido pelo frontend)',
      body: googleAuthBodySchema,
    },
  }, googleAuthController)
}
