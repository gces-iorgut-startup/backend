import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetAdminMetricsUseCase } from '../../../useCases/factories/makeDashboardUseCases'

export async function getAdminMetricsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.userId

  const useCase = makeGetAdminMetricsUseCase()

  const metrics = await useCase.execute({ userId })

  return reply.status(200).send(metrics)
}
