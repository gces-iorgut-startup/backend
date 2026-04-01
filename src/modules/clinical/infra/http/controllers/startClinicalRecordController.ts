import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeStartClinicalRecordUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const startClinicalRecordBodySchema = z.object({
  appointmentId: z.string().uuid(),
})

export async function startClinicalRecordController(
  request: FastifyRequest<{ Body: z.infer<typeof startClinicalRecordBodySchema> }>,
  reply: FastifyReply
) {
  const { appointmentId } = request.body
  const vetId = request.user.userId

  const useCase = makeStartClinicalRecordUseCase()

  const record = await useCase.execute({
    appointmentId,
    vetId,
  })

  return reply.status(201).send(record)
}
