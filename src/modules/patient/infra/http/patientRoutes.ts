import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { createPatientController } from './controllers/createPatientController'
import { listPatientsController } from './controllers/listPatientsController'
import { getPatientController } from './controllers/getPatientController'
import { updatePatientController } from './controllers/updatePatientController'

export async function patientRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyJwt)

  app.post('/', createPatientController)
  app.get('/', listPatientsController)
  app.get('/:id', getPatientController)
  app.put('/:id', updatePatientController)
}
