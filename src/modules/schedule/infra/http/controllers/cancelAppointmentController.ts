import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCancelAppointmentUseCase } from '../../../useCases/factories/makeCancelAppointmentUseCase'

export const cancelAppointmentParamsSchema = z.object({
  id: z.string().uuid(),
})

export const cancelAppointmentBodySchema = z.object({
  reason: z.string().trim().min(1, 'Justificativa deve ter ao menos 1 caractere'),
})

export async function cancelAppointmentController(
  request: FastifyRequest<{
    Params: z.infer<typeof cancelAppointmentParamsSchema>
    Body: z.infer<typeof cancelAppointmentBodySchema>
  }>,
  reply: FastifyReply
) {
  const { id } = request.params
  const { reason } = request.body
  const { clinicId } = request.user

  const useCase = makeCancelAppointmentUseCase()
  const appointment = await useCase.execute({ appointmentId: id, clinicId, reason })

  return reply.status(200).send(appointment)
}
