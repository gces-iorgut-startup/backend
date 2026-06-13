import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeFinalizeClinicalRecordUseCase } from '../../../useCases/factories/makeClinicalRecordsUseCases'

export const finalizeClinicalRecordParamsSchema = z.object({
  id: z.string().uuid(),
})

export const finalizeClinicalRecordBodySchema = z.object({
  endDateTime: z.string().datetime().optional(),
}).optional()

export async function finalizeClinicalRecordController(
  request: FastifyRequest<{
    Params: z.infer<typeof finalizeClinicalRecordParamsSchema>
    Body: z.infer<typeof finalizeClinicalRecordBodySchema>
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const vetId = request.user.userId
  const clinicId = request.user.clinicId
  const body = finalizeClinicalRecordBodySchema.parse(request.body)

  const useCase = makeFinalizeClinicalRecordUseCase()

  const record = await useCase.execute({
    recordId: id,
    vetId,
    clinicId,
    endDateTime: body?.endDateTime ? new Date(body.endDateTime) : undefined,
  })

  return reply.status(200).send(record)
}
