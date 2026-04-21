import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSendForgotPasswordMailUseCase } from '../../../useCases/factories/makeSendForgotPasswordMailUseCase'

export const sendForgotPasswordMailBodySchema = z.object({
  email: z.string().email(),
})

export async function sendForgotPasswordMailController(request: FastifyRequest, reply: FastifyReply) {
  const { email } = sendForgotPasswordMailBodySchema.parse(request.body)
  
  request.log.info({ email }, 'Iniciando solicitação de recuperação de senha')
  
  const useCase = makeSendForgotPasswordMailUseCase(request.log)
  await useCase.execute({ email })

  return reply.status(204).send()
}