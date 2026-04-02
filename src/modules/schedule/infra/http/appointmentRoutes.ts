import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { createAppointmentController, createAppointmentBodySchema } from './controllers/createAppointmentController'
import { listAppointmentsByDayController, listAppointmentsByDayQuerySchema } from './controllers/listAppointmentsByDayController'
import { cancelAppointmentController, cancelAppointmentParamsSchema, cancelAppointmentBodySchema } from './controllers/cancelAppointmentController'
import { rescheduleAppointmentController, rescheduleAppointmentParamsSchema, rescheduleAppointmentBodySchema } from './controllers/rescheduleAppointmentController'

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

  app.delete('/:id', {
    schema: {
      tags: ['Appointments'],
      summary: 'Cancelar agendamento (requer justificativa)',
      security: [{ bearerAuth: [] }],
      params: cancelAppointmentParamsSchema,
      body: cancelAppointmentBodySchema,
    },
  }, cancelAppointmentController)

  app.patch('/:id/reschedule', {
    schema: {
      tags: ['Appointments'],
      summary: 'Reagendar consulta (apenas status SCHEDULED)',
      security: [{ bearerAuth: [] }],
      params: rescheduleAppointmentParamsSchema,
      body: rescheduleAppointmentBodySchema,
    },
  }, rescheduleAppointmentController)
}
