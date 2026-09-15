import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateTutorAccountUseCase } from '../../../useCases/factories/makeCreateTutorAccountUseCase'

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
  const { clinicId, role } = request.user

  const useCase = makeCreateTutorAccountUseCase(request.log)
  const result = await useCase.execute({
    tutorId,
    email,
    userClinicId: clinicId,
    userRole: role,
  })

  return reply.status(201).send(result)
}
