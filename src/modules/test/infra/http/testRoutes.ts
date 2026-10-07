import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  cleanupClinicController,
  cleanupClinicParamsSchema,
} from './controllers/cleanupClinicController'
import {
  createFirstAccessTokenController,
  createFirstAccessTokenBodySchema,
} from './controllers/createFirstAccessTokenController'

/**
 * Rotas de teste para os testes E2E.
 *
 * Disponíveis apenas quando NODE_ENV=test — fora desse ambiente, as rotas
 * não são registradas (retornam 404).
 */
export const testRoutes: FastifyPluginAsyncZod = async (app) => {
  if (process.env.NODE_ENV !== 'test') {
    return
  }

  // Apaga PERMANENTEMENTE uma clínica e todos os seus dados dependentes.
  app.delete(
    '/clinics/:id',
    {
      schema: {
        tags: ['Test'],
        summary: '[TESTE] Remove uma clínica e TODOS os seus dados (sem autenticação).',
        params: cleanupClinicParamsSchema,
      },
    },
    cleanupClinicController,
  )

  // Gera token de primeiro acesso para a conta de um tutor (sem envio de e-mail).
  app.post(
    '/first-access-token',
    {
      schema: {
        tags: ['Test'],
        summary: '[TESTE] Gera token de primeiro acesso para a conta de um tutor (sem autenticação).',
        body: createFirstAccessTokenBodySchema,
      },
    },
    createFirstAccessTokenController,
  )
}