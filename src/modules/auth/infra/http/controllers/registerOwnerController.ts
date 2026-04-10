import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateOwnerUseCase } from '../../../useCases/factories/makeCreateOwnerUseCase'

export const registerOwnerBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  clinicName: z.string().min(2, 'Nome da clínica é obrigatório'),
})

export async function registerOwnerController(request: FastifyRequest, reply: FastifyReply) {
  const body = registerOwnerBodySchema.parse(request.body)
  const useCase = makeCreateOwnerUseCase()
  const result = await useCase.execute(body)
  return reply.status(201).send({ user: result })
}
