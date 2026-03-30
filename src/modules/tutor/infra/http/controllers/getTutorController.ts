import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetTutorUseCase } from '../../../useCases/factories/makeGetTutorUseCase'

export async function getTutorController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const useCase = makeGetTutorUseCase()
  const tutor = await useCase.execute(request.params.id)
  return reply.status(200).send({ tutor })
}
