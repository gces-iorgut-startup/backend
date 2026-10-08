import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeListAppointmentsByDayUseCase } from '../../../useCases/factories/makeListAppointmentsByDayUseCase'
import { makeListAppointmentsByStatusUseCase } from '../../../useCases/factories/makeListAppointmentsByStatusUseCase'

export const listAppointmentsByDayQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD').optional(),
  vetId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING_APPROVAL', 'REJECTED']).optional(),
}).refine(query => query.date || query.status, {
  message: 'Informe date ou status',
  path: ['date'],
})

export async function listAppointmentsByDayController(request: FastifyRequest, reply: FastifyReply) {
  const { clinicId } = request.user
  const { date, vetId, status } = listAppointmentsByDayQuerySchema.parse(request.query)

  // Com status (ex.: fila de PENDING_APPROVAL), lista por status; date vira filtro opcional.
  if (status) {
    const appointments = await makeListAppointmentsByStatusUseCase().execute({ status, clinicId, date })
    return reply.status(200).send({ appointments })
  }

  const appointments = await makeListAppointmentsByDayUseCase().execute({ date: date!, clinicId, vetId })
  return reply.status(200).send({ appointments })
}
