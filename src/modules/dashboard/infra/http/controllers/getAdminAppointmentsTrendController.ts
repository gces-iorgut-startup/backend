import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetAdminAppointmentsTrendUseCase } from '../../../useCases/factories/makeDashboardUseCases'

export const getAdminAppointmentsTrendQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
})

export async function getAdminAppointmentsTrendController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId, clinicId } = request.user
  const { days } = getAdminAppointmentsTrendQuerySchema.parse(request.query)

  const useCase = makeGetAdminAppointmentsTrendUseCase()

  const trend = await useCase.execute({ userId, clinicId, days })

  return reply.status(200).send({
    days,
    trend,
  })
}
