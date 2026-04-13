import type { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetTutorUseCase } from '../../../useCases/factories/makeGetTutorUseCase'
import { z } from 'zod'

export const getTutorParamsSchema = z.object({ id: z.string().uuid() })

export async function getTutorController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { clinicId } = request.user
  const useCase = makeGetTutorUseCase()
  const tutor = await useCase.execute({ id: request.params.id, clinicId })
  return reply.status(200).send({ tutor })
}
