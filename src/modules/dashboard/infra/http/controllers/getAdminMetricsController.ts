import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetAdminMetricsUseCase } from '../../../useCases/factories/makeDashboardUseCases'

export async function getAdminMetricsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId, clinicId } = request.user

  const useCase = makeGetAdminMetricsUseCase()

  const metrics = await useCase.execute({ userId, clinicId })

  return reply.status(200).send(metrics)
}
