import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGoogleAuthUseCase } from '../../../useCases/factories/makeGoogleAuthUseCase'
import type { Role } from '@prisma/client'

export const googleAuthBodySchema = z.object({
  accessToken: z.string().min(1, 'accessToken do Google é obrigatório'),
})

export async function googleAuthController(request: FastifyRequest, reply: FastifyReply) {
  const { accessToken } = googleAuthBodySchema.parse(request.body)

  const useCase = makeGoogleAuthUseCase()
  const result = await useCase.execute({ accessToken })

  const jwtToken = await reply.jwtSign({
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

  reply.setCookie('accessToken', jwtToken, {
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

  return reply.status(200).send({
    user: result.user,
    isNewUser: result.isNewUser,
  })
}
