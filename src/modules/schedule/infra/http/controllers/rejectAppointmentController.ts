import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeRejectAppointmentUseCase } from '../../../useCases/factories/makeRejectAppointmentUseCase'

export const rejectAppointmentParamsSchema = z.object({
  id: z.string().uuid(),
})

export const rejectAppointmentBodySchema = z.object({
  reason: z.string().trim().min(1, 'Justificativa deve ter ao menos 1 caractere'),
})

export async function rejectAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as z.infer<typeof rejectAppointmentParamsSchema>
  const { reason } = request.body as z.infer<typeof rejectAppointmentBodySchema>
  const { clinicId } = request.user

  const useCase = makeRejectAppointmentUseCase()
  const appointment = await useCase.execute({ appointmentId: id, clinicId, reason })

  return reply.status(200).send({ appointment })
}
