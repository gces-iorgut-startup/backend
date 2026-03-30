import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeLogoutUseCase } from '../../../useCases/factories/makeLogoutUseCase'

export async function logoutController(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user
  const useCase = makeLogoutUseCase()
  await useCase.execute(userId)
  return reply.status(204).send()
}
