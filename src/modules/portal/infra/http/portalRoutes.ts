import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { z } from 'zod'
import { GetTutorDashboardUseCase } from '../../useCases/getTutorDashboardUseCase'
import { GetTutorAlertsUseCase } from '../../useCases/getTutorAlertsUseCase'
import { GetTutorPatientHistoryUseCase } from '../../useCases/getTutorPatientHistoryUseCase'

const patientHistoryParamsSchema = z.object({
  patientId: z.string().uuid(),
})

export const portalRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.get(
    '/dashboard',
    {
      schema: {
        summary: 'Dashboard do Tutor — pets, agendamentos recentes e vacinas',
        tags: ['Portal do Tutor'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const useCase = new GetTutorDashboardUseCase()
      const result = await useCase.execute({ userId: request.user.userId })
      return reply.status(200).send(result)
    }
  )

  app.get(
    '/alerts',
    {
      schema: {
        summary: 'Alertas do Tutor — vacinas vencidas, próximas e recomendações',
        tags: ['Portal do Tutor'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const useCase = new GetTutorAlertsUseCase()
      const result = await useCase.execute({ userId: request.user.userId })
      return reply.status(200).send(result)
    }
  )

  app.get(
    '/patients/:patientId/history',
    {
      schema: {
        summary: 'Histórico clínico completo do pet (somente leitura)',
        tags: ['Portal do Tutor'],
        params: patientHistoryParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { patientId } = request.params as z.infer<typeof patientHistoryParamsSchema>
      const useCase = new GetTutorPatientHistoryUseCase()
      const result = await useCase.execute({ userId: request.user.userId, patientId })
      return reply.status(200).send(result)
    }
  )
}
