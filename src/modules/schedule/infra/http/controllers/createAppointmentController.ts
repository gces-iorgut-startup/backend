import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateAppointmentUseCase } from '../../../useCases/factories/makeCreateAppointmentUseCase'

export const createAppointmentBodySchema = z.object({
  patientId: z.string().uuid(),
  vetId: z.string().uuid(),
  dateTime: z.string().datetime(),
  category: z.enum(['VACCINATION', 'OBSERVATION', 'EXAM', 'SURGICAL']),
  observation: z.string().optional(),
})

export async function createAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const { clinicId } = request.user
  const body = createAppointmentBodySchema.parse(request.body)
  const useCase = makeCreateAppointmentUseCase()
  const appointment = await useCase.execute({ ...body, clinicId, dateTime: new Date(body.dateTime) })
  return reply.status(201).send({ appointment })
}
