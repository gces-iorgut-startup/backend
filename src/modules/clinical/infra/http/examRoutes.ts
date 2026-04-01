import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { uploadExamFileController } from './controllers/uploadExamFileController'
import { listPatientExamsController, listPatientExamsParamsSchema } from './controllers/listPatientExamsController'
import { z } from 'zod'

export const examRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.post(
    '/upload',
    {
      schema: {
        summary: 'Upload Exam File (Multipart Form-Data)',
        tags: ['Exam Files'],
        security: [{ bearerAuth: [] }],
        // For fastify-multipart, the body type is not cleanly inferable through zod since it's a stream
      },
    },
    uploadExamFileController
  )

  app.get(
    '/patient/:patientId',
    {
      schema: {
        summary: 'List Patient Exam Files',
        tags: ['Exam Files'],
        params: listPatientExamsParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    listPatientExamsController
  )
}
