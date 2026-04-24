import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeResetPasswordUseCase } from '../../../useCases/factories/makeResetPasswordUseCase'

export const resetPasswordBodySchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
})

export async function resetPasswordController(request: FastifyRequest, reply: FastifyReply) {
  const body = resetPasswordBodySchema.parse(request.body)
  await makeResetPasswordUseCase().execute(body)
  return reply.status(204).send()
}