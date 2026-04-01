import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { addVaccinationController, addVaccinationBodySchema } from './controllers/addVaccinationController'
import { listPatientVaccinationsController, listPatientVaccinationsParamsSchema } from './controllers/listPatientVaccinationsController'
import { updateVaccinationStatusController, updateVaccinationStatusParamsSchema, updateVaccinationStatusBodySchema } from './controllers/updateVaccinationStatusController'

export const vaccinationRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.post(
    '/',
    {
      schema: {
        summary: 'Add Vaccination',
        tags: ['Vaccinations'],
        body: addVaccinationBodySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    addVaccinationController
  )

  app.get(
    '/patient/:patientId',
    {
      schema: {
        summary: 'List Patient Vaccinations',
        tags: ['Vaccinations'],
        params: listPatientVaccinationsParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    listPatientVaccinationsController
  )

  app.patch(
    '/:id/status',
    {
      schema: {
        summary: 'Update Vaccination Status',
        tags: ['Vaccinations'],
        params: updateVaccinationStatusParamsSchema,
        body: updateVaccinationStatusBodySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    updateVaccinationStatusController
  )
}
