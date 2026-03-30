import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateUserUseCase } from '../../../useCases/factories/makeCreateUserUseCase'

export const createUserBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'VET']),
})

export async function createUserController(request: FastifyRequest, reply: FastifyReply) {
  const body = createUserBodySchema.parse(request.body)
  const useCase = makeCreateUserUseCase()
  const user = await useCase.execute(body)
  return reply.status(201).send({ user })
}
