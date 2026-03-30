import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { env } from './config/env'
import { errorHandler } from './shared/middleware/error-handler'
import { authRoutes } from './modules/auth/infra/http/authRoutes'
import { tutorRoutes } from './modules/tutor/infra/http/tutorRoutes'
import { patientRoutes } from './modules/patient/infra/http/patientRoutes'
import { appointmentRoutes } from './modules/schedule/infra/http/appointmentRoutes'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'

export const app = fastify({ logger: env.NODE_ENV === 'development' })

// ── Zod Type Provider ────────────────────────────────
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// ── Swagger / OpenAPI ─────────────────────────────────
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'IOUGURT API',
      description: 'API de Gestão Veterinária — MVP 1',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

// ── Plugins ───────────────────────────────────────────
app.register(fastifyCors, { origin: '*' })

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.JWT_EXPIRES_IN },
  cookie: { cookieName: 'refreshToken', signed: false },
})

app.register(fastifyCookie)

// ── Health Check ─────────────────────────────────────
app.get('/health', () => ({ status: 'ok' }))

// ── Routes ────────────────────────────────────────────
app.register(authRoutes, { prefix: '/auth' })
app.register(tutorRoutes, { prefix: '/tutors' })
app.register(patientRoutes, { prefix: '/patients' })
app.register(appointmentRoutes, { prefix: '/appointments' })

// ── Error Handler ─────────────────────────────────────
app.setErrorHandler(errorHandler)

export default app
