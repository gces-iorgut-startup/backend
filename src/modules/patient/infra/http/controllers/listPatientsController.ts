import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListPatientsUseCase } from '../../../useCases/factories/makeListPatientsUseCase'

const querySchema = z.object({
  search: z.string().optional(),
  tutorId: z.string().uuid().optional(),
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
})

export async function listPatientsController(request: FastifyRequest, reply: FastifyReply) {
  const query = querySchema.parse(request.query)
  const useCase = makeListPatientsUseCase()
  const result = await useCase.execute(query)
  return reply.status(200).send(result)
}
