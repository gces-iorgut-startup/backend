import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '../../../../shared/middleware/verify-jwt'
import { createAppointmentController } from './controllers/createAppointmentController'
import { listAppointmentsByDayController } from './controllers/listAppointmentsByDayController'

export async function appointmentRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyJwt)

  app.get('/', listAppointmentsByDayController)
  app.post('/', createAppointmentController)
}
