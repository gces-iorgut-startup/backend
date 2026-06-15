import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import {
  cleanupClinicController,
  cleanupClinicParamsSchema,
} from './controllers/cleanupClinicController'

/**
 * ⚠️  ATENÇÃO — ROTA DE TESTE ABERTA EM PRODUÇÃO (TEMPORÁRIO)
 *
 * Esta rota apaga PERMANENTEMENTE uma clínica e todos os seus dados, e está
 * propositalmente SEM autenticação por decisão do time (testes E2E em prod).
 * Qualquer um que conheça o UUID de uma clínica consegue apagá-la.
 *
 * Para travar depois, basta voltar a exigir um segredo: adicione um preHandler
 * que valide um header (ex.: x-test-token) contra uma env, ou remova o
 * registro de `testRoutes` no app.ts.
 */
export const testRoutes: FastifyPluginAsyncZod = async (app) => {
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
}
