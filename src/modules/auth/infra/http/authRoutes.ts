import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { registerOwnerController, registerOwnerBodySchema } from './controllers/registerOwnerController'
import { registerVetController, registerVetBodySchema } from './controllers/registerVetController'
import { authenticateController, authenticateBodySchema } from './controllers/authenticateController'
import { refreshTokenController, refreshTokenBodySchema } from './controllers/refreshTokenController'
import { logoutController } from './controllers/logoutController'
import { googleAuthController, googleAuthBodySchema } from './controllers/googleAuthController'
import { getMeController, updateMeController, updateUserBodySchema } from './controllers/meController'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { verifyRole } from '@shared/middleware/verify-role'

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  // Registro de OWNER (cria clínica automaticamente)
  app.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Criar conta de Dono de Clínica (cria a clínica automaticamente)',
      body: registerOwnerBodySchema,
    },
  }, registerOwnerController)

  // Registro de VET (apenas OWNER pode criar VETs na sua clínica)
  app.post('/register/vet', {
    preHandler: [verifyJwt, verifyRole('OWNER')],
    schema: {
      tags: ['Auth'],
      summary: 'Criar conta de Veterinário (apenas OWNER)',
      body: registerVetBodySchema,
      security: [{ bearerAuth: [] }],
    },
  }, registerVetController)

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
      summary: 'Login / Registro com Google',
      body: googleAuthBodySchema,
    },
  }, googleAuthController)

  app.get('/me', {
    preHandler: [verifyJwt],
    schema: {
      tags: ['Auth'],
      summary: 'Retorna o usuário autenticado (inclui CRMV)',
      security: [{ bearerAuth: [] }],
    },
  }, getMeController)

  app.patch('/me', {
    preHandler: [verifyJwt],
    schema: {
      tags: ['Auth'],
      summary: 'Atualiza o próprio perfil (nome, CRMV)',
      body: updateUserBodySchema,
      security: [{ bearerAuth: [] }],
    },
  }, updateMeController)
}
