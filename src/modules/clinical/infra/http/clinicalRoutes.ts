import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { startClinicalRecordController, startClinicalRecordBodySchema } from './controllers/startClinicalRecordController'
import { updateClinicalRecordController, updateClinicalRecordParamsSchema, updateClinicalRecordBodySchema } from './controllers/updateClinicalRecordController'
import {
  finalizeClinicalRecordController,
  finalizeClinicalRecordParamsSchema,
  finalizeClinicalRecordBodySchema,
} from './controllers/finalizeClinicalRecordController'
import { getPatientHistoryController, getPatientHistoryParamsSchema } from './controllers/getPatientHistoryController'
import { generatePrescriptionController, generatePrescriptionParamsSchema } from './controllers/generatePrescriptionController'
import { generateAISummaryController, generateAISummaryParamsSchema } from './controllers/generateAISummaryController'
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
        body: finalizeClinicalRecordBodySchema,
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

  app.get(
    '/:id/prescription',
    {
      schema: {
        summary: 'Gerar Receituário em PDF (prontuário deve estar finalizado)',
        tags: ['Clinical Record'],
        params: generatePrescriptionParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    generatePrescriptionController
  )

  app.post(
    '/:id/ai-summary',
    {
      schema: {
        summary: 'Gerar Resumo do Atendimento por IA (Gemini)',
        tags: ['Clinical Record'],
        params: generateAISummaryParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    generateAISummaryController
  )
}
