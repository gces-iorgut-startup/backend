import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { uploadPatientPhotoController } from './controllers/uploadPatientPhotoController'
import {
  listPatientPhotosController,
  listPatientPhotosParamsSchema,
} from './controllers/listPatientPhotosController'

export const photoRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)

  app.post(
    '/upload',
    {
      schema: {
        summary: 'Upload Patient Photo (Multipart Form-Data)',
        description:
          'Campos: file (imagem), patientId (uuid), description (opcional), takenAt (ISO, opcional)',
        tags: ['Patient Photos'],
        security: [{ bearerAuth: [] }],
        // Como no upload de exames, o corpo é um stream multipart e não é
        // descrito por zod aqui.
      },
    },
    uploadPatientPhotoController
  )

  app.get(
    '/patient/:patientId',
    {
      schema: {
        summary: 'List Patient Photos',
        tags: ['Patient Photos'],
        params: listPatientPhotosParamsSchema,
        security: [{ bearerAuth: [] }],
      },
    },
    listPatientPhotosController
  )
}
