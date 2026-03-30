import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateTutorUseCase } from '../../../useCases/factories/makeCreateTutorUseCase'
const bodySchema = z.object({
  fullName: z.string().min(2),
  cpf: z.string().length(11),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
  insurance: z.string().optional(),
})

export async function createTutorController(request: FastifyRequest, reply: FastifyReply) {
  const body = bodySchema.parse(request.body)
  const useCase = makeCreateTutorUseCase()
  const tutor = await useCase.execute(body)
  return reply.status(201).send({ tutor })
}
