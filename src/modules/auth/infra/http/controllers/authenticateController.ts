import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeAuthenticateUseCase } from '../../../useCases/factories/makeAuthenticateUseCase'
import type { Role } from '@prisma/client'

export const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authenticateController(request: FastifyRequest, reply: FastifyReply) {
  const body = authenticateBodySchema.parse(request.body)
  const useCase = makeAuthenticateUseCase()
  const result = await useCase.execute(body)

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

