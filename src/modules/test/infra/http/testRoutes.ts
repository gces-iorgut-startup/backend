import { timingSafeEqual } from 'node:crypto'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { env } from '@config/env'
import { AppError } from '@shared/errors/app-error'
import {
  cleanupClinicController,
  cleanupClinicParamsSchema,
} from './controllers/cleanupClinicController'
import {
  createFirstAccessTokenController,
  createFirstAccessTokenBodySchema,
} from './controllers/createFirstAccessTokenController'

function hasValidSecret(received: unknown): boolean {
  if (typeof received !== 'string') return false

  const expected = Buffer.from(env.E2E_TEST_SECRET)
  const actual = Buffer.from(received)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/**
 * Rotas de teste para os testes E2E.
 *
 * Só são registradas com NODE_ENV=test E com E2E_TEST_SECRET definido — fora
 * disso retornam 404. Quando registradas, exigem o segredo no header
 * x-e2e-secret, porque algumas apagam dados ou emitem tokens sem autenticação.
 */
export const testRoutes: FastifyPluginAsyncZod = async (app) => {
  if (process.env.NODE_ENV !== 'test' || !env.E2E_TEST_SECRET) {
    return
  }

  app.addHook('onRequest', async (request) => {
    if (!hasValidSecret(request.headers['x-e2e-secret'])) {
      throw new AppError('Acesso negado.', 403)
    }
  })

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