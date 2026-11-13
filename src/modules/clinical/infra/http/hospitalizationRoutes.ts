import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJwt } from '@shared/middleware/verify-jwt'
import { verifyRole } from '@shared/middleware/verify-role'
import {
  hospitalizationDetailsResponseSchema,
  hospitalizationEvolutionResponseSchema,
  hospitalizationListResponseSchema,
  hospitalizationResponseSchema,
} from './hospitalizationPresenter'
import {
  admitPatientBodySchema,
  admitPatientController,
  admitPatientParamsSchema,
} from './controllers/admitPatientController'
import {
  listActiveHospitalizationsController,
  listActiveHospitalizationsParamsSchema,
} from './controllers/listActiveHospitalizationsController'
import {
  getHospitalizationDetailsController,
  getHospitalizationDetailsParamsSchema,
} from './controllers/getHospitalizationDetailsController'
import {
  addHospitalizationEvolutionBodySchema,
  addHospitalizationEvolutionController,
  addHospitalizationEvolutionParamsSchema,
} from './controllers/addHospitalizationEvolutionController'
import {
  dischargePatientBodySchema,
  dischargePatientController,
  dischargePatientParamsSchema,
} from './controllers/dischargePatientController'

/**
 * O caminho destas rotas carrega `:clinicId`, diferente do resto da API, que
 * tira a clínica só do token. Como o path é escolhido por quem chama, ele não
 * autoriza nada: aqui conferimos que a clínica pedida é a do token e
 * respondemos 403 caso contrário. Sem esta checagem, qualquer usuário
 * autenticado leria o painel de leitos de outra clínica trocando o UUID.
 */
async function verifyClinicScope(
  request: FastifyRequest<{ Params: { clinicId?: string } }>,
  reply: FastifyReply
) {
  const { clinicId } = request.params

  if (clinicId && clinicId !== request.user.clinicId) {
    return reply.status(403).send({ message: 'Acesso não autorizado para esta clínica.' })
  }
}

export const hospitalizationRoutes: FastifyPluginAsyncZod = async app => {
  app.addHook('onRequest', verifyJwt)
  app.addHook('preHandler', verifyClinicScope)

  app.get(
    '/active',
    {
      schema: {
        summary: 'List Active Hospitalizations',
        tags: ['Hospitalizations'],
        params: listActiveHospitalizationsParamsSchema,
        response: { 200: hospitalizationListResponseSchema },
        security: [{ bearerAuth: [] }],
      },
    },
    listActiveHospitalizationsController
  )

  app.get(
    '/:id',
    {
      schema: {
        summary: 'Get Hospitalization Details',
        tags: ['Hospitalizations'],
        params: getHospitalizationDetailsParamsSchema,
        response: { 200: hospitalizationDetailsResponseSchema },
        security: [{ bearerAuth: [] }],
      },
    },
    getHospitalizationDetailsController
  )

  app.register(async writeRoutes => {
    // Quem interna, registra evolução e dá alta é equipe clínica. O perfil
    // TUTOR nunca escreve aqui.
    writeRoutes.addHook('preHandler', verifyRole('OWNER', 'VET'))

    writeRoutes.post(
      '/',
      {
        schema: {
          summary: 'Admit Patient',
          tags: ['Hospitalizations'],
          params: admitPatientParamsSchema,
          body: admitPatientBodySchema,
          response: { 201: hospitalizationResponseSchema },
          security: [{ bearerAuth: [] }],
        },
      },
      admitPatientController
    )

    writeRoutes.post(
      '/:id/evolutions',
      {
        schema: {
          summary: 'Add Hospitalization Evolution',
          tags: ['Hospitalizations'],
          params: addHospitalizationEvolutionParamsSchema,
          body: addHospitalizationEvolutionBodySchema,
          response: { 201: hospitalizationEvolutionResponseSchema },
          security: [{ bearerAuth: [] }],
        },
      },
      addHospitalizationEvolutionController
    )

    writeRoutes.patch(
      '/:id/discharge',
      {
        schema: {
          summary: 'Discharge Patient',
          tags: ['Hospitalizations'],
          params: dischargePatientParamsSchema,
          body: dischargePatientBodySchema,
          response: { 200: hospitalizationResponseSchema },
          security: [{ bearerAuth: [] }],
        },
      },
      dischargePatientController
    )
  })
}
