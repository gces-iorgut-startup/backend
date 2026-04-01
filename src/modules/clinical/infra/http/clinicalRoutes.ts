import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { startClinicalRecordController, startClinicalRecordBodySchema } from './controllers/startClinicalRecordController'
import { updateClinicalRecordController, updateClinicalRecordParamsSchema, updateClinicalRecordBodySchema } from './controllers/updateClinicalRecordController'
import { finalizeClinicalRecordController, finalizeClinicalRecordParamsSchema } from './controllers/finalizeClinicalRecordController'
import { getPatientHistoryController, getPatientHistoryParamsSchema } from './controllers/getPatientHistoryController'
import { verifyJwt } from '@shared/middleware/verify-jwt'

export const clinicalRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.post(
    '/',
    {
      schema: {
        summary: 'Start Clinical Record',
        tags: ['Clinical Record'],
        body: startClinicalRecordBodySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    startClinicalRecordController
  )

  app.put(
    '/:id',
    {
      schema: {
        summary: 'Update Clinical Record',
        tags: ['Clinical Record'],
        params: updateClinicalRecordParamsSchema,
        body: updateClinicalRecordBodySchema,
        security: [{ bearerAuth: [] }],
      },
    },
    updateClinicalRecordController
  )

  app.patch(
    '/:id/finalize',
    {
      schema: {
        summary: 'Finalize Clinical Record',
        tags: ['Clinical Record'],
        params: finalizeClinicalRecordParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    finalizeClinicalRecordController
  )

  app.get(
    '/patient/:patientId',
    {
      schema: {
        summary: 'Get Patient Clinical History',
        tags: ['Clinical Record'],
        params: getPatientHistoryParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    getPatientHistoryController
  )
}
