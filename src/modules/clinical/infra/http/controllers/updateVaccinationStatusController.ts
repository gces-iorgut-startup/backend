import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeUpdateVaccinationStatusUseCase } from '../../../useCases/factories/makeVaccinationUseCases'

export const updateVaccinationStatusParamsSchema = z.object({
  id: z.string().uuid(),
})

export const updateVaccinationStatusBodySchema = z.object({
  status: z.enum(['UP_TO_DATE', 'PENDING', 'OVERDUE']),
})

export async function updateVaccinationStatusController(
  request: FastifyRequest<{
    Params: z.infer<typeof updateVaccinationStatusParamsSchema>
    Body: z.infer<typeof updateVaccinationStatusBodySchema>
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { status } = request.body
  const { clinicId } = request.user

  const useCase = makeUpdateVaccinationStatusUseCase()

  const vaccination = await useCase.execute({
    vaccinationId: id,
    clinicId,
    status,
  })

  return reply.status(200).send(vaccination)
}
