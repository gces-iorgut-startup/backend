import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRescheduleAppointmentUseCase } from '../../../useCases/factories/makeRescheduleAppointmentUseCase'

export const rescheduleAppointmentParamsSchema = z.object({
  id: z.string().uuid(),
})

export const rescheduleAppointmentBodySchema = z.object({
  dateTime: z.string().datetime(),
})

export async function rescheduleAppointmentController(
  request: FastifyRequest<{
    Params: z.infer<typeof rescheduleAppointmentParamsSchema>
    Body: z.infer<typeof rescheduleAppointmentBodySchema>
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { dateTime } = request.body
  const { clinicId } = request.user

  const useCase = makeRescheduleAppointmentUseCase()
  const appointment = await useCase.execute({ appointmentId: id, clinicId, newDateTime: new Date(dateTime) })

  return reply.status(200).send(appointment)
}
