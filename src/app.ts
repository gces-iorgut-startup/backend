import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env'
import { errorHandler } from './shared/middleware/error-handler'
import { authRoutes } from './modules/auth/infra/http/authRoutes'
import { clinicRoutes } from './modules/clinic/infra/http/clinicRoutes'
import { tutorRoutes } from './modules/tutor/infra/http/tutorRoutes'
import { patientRoutes } from './modules/patient/infra/http/patientRoutes'
import { appointmentRoutes } from './modules/schedule/infra/http/appointmentRoutes'
import { clinicalRoutes } from './modules/clinical/infra/http/clinicalRoutes'
import { vaccinationRoutes } from './modules/clinical/infra/http/vaccinationRoutes'
import { examRoutes } from './modules/clinical/infra/http/examRoutes'
import { dashboardRoutes } from './modules/dashboard/infra/http/dashboardRoutes'
import { portalRoutes } from './modules/portal/infra/http/portalRoutes'

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
      description: 'API de Gestão Veterinária — MVP 3 (Completo)',
      version: '3.0.0',
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'uploads'),
  prefix: '/uploads/',
})

// ── Health Check ─────────────────────────────────────
app.get('/health', () => ({ status: 'ok' }))

// ── Routes ────────────────────────────────────────────
app.register(authRoutes, { prefix: '/auth' })
app.register(clinicRoutes, { prefix: '/clinics' })
app.register(tutorRoutes, { prefix: '/tutors' })
app.register(patientRoutes, { prefix: '/patients' })
app.register(appointmentRoutes, { prefix: '/appointments' })
app.register(clinicalRoutes, { prefix: '/clinical-records' })
app.register(vaccinationRoutes, { prefix: '/vaccinations' })
app.register(examRoutes, { prefix: '/exams' })
app.register(dashboardRoutes, { prefix: '/dashboard' })
app.register(portalRoutes, { prefix: '/portal' })

// ── Error Handler ─────────────────────────────────────
app.setErrorHandler(errorHandler)

export default app
