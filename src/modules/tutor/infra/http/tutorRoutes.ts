import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { createTutorController } from './controllers/createTutorController'
import { listTutorsController } from './controllers/listTutorsController'
import { getTutorController } from './controllers/getTutorController'
import { updateTutorController } from './controllers/updateTutorController'

export async function tutorRoutes(app: FastifyInstance) {
  app.addHook('preHandler', verifyJwt)

  app.post('/', createTutorController)
  app.get('/', listTutorsController)
  app.get('/:id', getTutorController)
  app.put('/:id', updateTutorController)
}
