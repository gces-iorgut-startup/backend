import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRefreshTokenUseCase } from '../../../useCases/factories/makeRefreshTokenUseCase'
import type { Role } from '@prisma/client'

export async function refreshTokenController(request: FastifyRequest, reply: FastifyReply) {
  const refreshToken = request.cookies.refreshToken

  if (!refreshToken) {
    return reply.status(401).send({ message: 'Refresh token não fornecido.' })
  }

  const useCase = makeRefreshTokenUseCase()
  const result = await useCase.execute({ refreshToken })

  const accessToken = await reply.jwtSign({
    userId: result.user.id,
    role: result.user.role as Role,
    clinicId: result.user.clinicId,
  })

  const csrfToken = await reply.generateCsrf()

  const cookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  }

  reply.setCookie('accessToken', accessToken, {
    ...cookieOptions,
    httpOnly: true,
  })

  reply.setCookie('refreshToken', result.refreshToken, {
    ...cookieOptions,
    httpOnly: true,
  })

  reply.setCookie('XSRF-TOKEN', csrfToken, {
    ...cookieOptions,
    httpOnly: false,
  })

  return reply.status(200).send({ user: result.user })
}
