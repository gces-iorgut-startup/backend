import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { createAppointmentController, createAppointmentBodySchema } from './controllers/createAppointmentController'
import { listAppointmentsByDayController, listAppointmentsByDayQuerySchema } from './controllers/listAppointmentsByDayController'

export const appointmentRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('preHandler', verifyJwt)

  app.post('/', {
    schema: {
      tags: ['Appointments'],
      summary: 'Agendar uma consulta (VACCINATION, OBSERVATION, EXAM, SURGICAL)',
      security: [{ bearerAuth: [] }],
      body: createAppointmentBodySchema,
    },
  }, createAppointmentController)

  app.get('/', {
    schema: {
      tags: ['Appointments'],
      summary: 'Listar agendamentos do dia',
      security: [{ bearerAuth: [] }],
      querystring: listAppointmentsByDayQuerySchema,
    },
  }, listAppointmentsByDayController)
}
