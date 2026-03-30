import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRefreshTokenUseCase } from '../../../useCases/factories/makeRefreshTokenUseCase'
import type { Role } from '@prisma/client'

const bodySchema = z.object({ refreshToken: z.string() })

export async function refreshTokenController(request: FastifyRequest, reply: FastifyReply) {
  const { refreshToken } = bodySchema.parse(request.body)
  const useCase = makeRefreshTokenUseCase()
  const result = await useCase.execute({ refreshToken })

  const accessToken = await reply.jwtSign({
    userId: result.user.id,
    role: result.user.role as Role,
  })

  return reply.status(200).send({ user: result.user, accessToken, refreshToken: result.refreshToken })
}
