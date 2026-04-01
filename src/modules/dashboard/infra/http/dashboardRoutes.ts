import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { getDailyOverviewController, getDailyOverviewQuerySchema } from './controllers/getDailyOverviewController'
import { getAdminMetricsController } from './controllers/getAdminMetricsController'

export const dashboardRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.get(
    '/daily',
    {
      schema: {
        summary: 'Get Daily Overview',
        tags: ['Dashboard'],
        querystring: getDailyOverviewQuerySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    getDailyOverviewController
  )

  app.get(
    '/admin',
    {
      schema: {
        summary: 'Get Admin Metrics',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
      },
    },
    getAdminMetricsController
  )
}
