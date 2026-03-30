import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAuthenticateUseCase } from '../../../useCases/factories/makeAuthenticateUseCase'
import type { Role } from '@prisma/client'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authenticateController(request: FastifyRequest, reply: FastifyReply) {
  const body = bodySchema.parse(request.body)
  const useCase = makeAuthenticateUseCase()
  const result = await useCase.execute(body)

  const accessToken = await reply.jwtSign({
    userId: result.user.id,
    role: result.user.role as Role,
  })

  return reply.status(200).send({ user: result.user, accessToken, refreshToken: result.refreshToken })
}
