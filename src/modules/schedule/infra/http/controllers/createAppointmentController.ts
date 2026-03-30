import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeCreateAppointmentUseCase } from '../../../useCases/factories/makeCreateAppointmentUseCase'

const bodySchema = z.object({
  patientId: z.string().uuid(),
  vetId: z.string().uuid(),
  dateTime: z.string().datetime(),
  category: z.enum(['VACCINATION', 'OBSERVATION', 'EXAM', 'SURGICAL']),
  observation: z.string().optional(),
})

export async function createAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const body = bodySchema.parse(request.body)
  const useCase = makeCreateAppointmentUseCase()
  const appointment = await useCase.execute({ ...body, dateTime: new Date(body.dateTime) })
  return reply.status(201).send({ appointment })
}
