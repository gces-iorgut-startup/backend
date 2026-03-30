import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { CreateTutorAccountUseCase } from '../../../useCases/createTutorAccountUseCase'

export const createTutorAccountParamsSchema = z.object({
  id: z.string().uuid(),
})

export const createTutorAccountBodySchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function createTutorAccountController(
  request: FastifyRequest<{
    Params: z.infer<typeof createTutorAccountParamsSchema>
    Body: z.infer<typeof createTutorAccountBodySchema>
  }>,
  reply: FastifyReply
) {
  const { id: tutorId } = request.params
  const { email } = request.body

  const useCase = new CreateTutorAccountUseCase()
  const result = await useCase.execute({ tutorId, email })

  return reply.status(201).send(result)
}
