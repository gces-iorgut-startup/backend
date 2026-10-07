import { z } from 'zod'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@config/prisma'
import { AppError } from '@shared/errors/app-error'
import { makeSendFirstAccessInviteUseCase } from '@modules/auth/useCases/factories/makeSendFirstAccessInviteUseCase'

export const createFirstAccessTokenBodySchema = z.object({
  email: z.string().email(),
})

type CreateFirstAccessTokenBody = z.infer<typeof createFirstAccessTokenBodySchema>

/**
 * [TESTE] Gera um token de primeiro acesso para a conta de um tutor, sem depender
 * do envio de e-mail (que não existe no CI). Usado pelos testes E2E para definir
 * a senha do tutor via POST /auth/set-password.
 */
export async function createFirstAccessTokenController(
  request: FastifyRequest<{ Body: CreateFirstAccessTokenBody }>,
  reply: FastifyReply,
) {
  const email = request.body.email.toLowerCase().trim()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'TUTOR') {
    throw new AppError('Conta de tutor não encontrada.', 404)
  }

  const { token } = await makeSendFirstAccessInviteUseCase().execute({ userId: user.id })

  return reply.status(201).send({ token })
}
