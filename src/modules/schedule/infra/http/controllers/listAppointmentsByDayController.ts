import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListAppointmentsByDayUseCase } from '../../../useCases/factories/makeListAppointmentsByDayUseCase'

export const listAppointmentsByDayQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD'),
  vetId: z.string().uuid().optional(),
})

export async function listAppointmentsByDayController(request: FastifyRequest, reply: FastifyReply) {
  const { clinicId } = request.user
  const query = listAppointmentsByDayQuerySchema.parse(request.query)
  const useCase = makeListAppointmentsByDayUseCase()
  const appointments = await useCase.execute({ ...query, clinicId })
  return reply.status(200).send({ appointments })
}
