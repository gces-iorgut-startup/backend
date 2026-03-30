import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListTutorsUseCase } from '../../../useCases/factories/makeListTutorsUseCase'

const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  perPage: z.coerce.number().default(20),
})

export async function listTutorsController(request: FastifyRequest, reply: FastifyReply) {
  const query = querySchema.parse(request.query)
  const useCase = makeListTutorsUseCase()
  const result = await useCase.execute(query)
  return reply.status(200).send(result)
}
