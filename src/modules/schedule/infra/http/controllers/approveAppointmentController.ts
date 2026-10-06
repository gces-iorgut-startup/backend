import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeApproveAppointmentUseCase } from '../../../useCases/factories/makeApproveAppointmentUseCase'

export const approveAppointmentParamsSchema = z.object({
  id: z.string().uuid(),
})

export const approveAppointmentBodySchema = z.object({
  vetId: z.string().uuid(),
  endDateTime: z.string().datetime().optional(),
})

export async function approveAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as z.infer<typeof approveAppointmentParamsSchema>
  const { vetId, endDateTime } = request.body as z.infer<typeof approveAppointmentBodySchema>
  const { clinicId } = request.user

  const useCase = makeApproveAppointmentUseCase()
  const appointment = await useCase.execute({
    appointmentId: id,
    clinicId,
    vetId,
    endDateTime: endDateTime ? new Date(endDateTime) : undefined,
  })

  return reply.status(200).send({ appointment })
}
