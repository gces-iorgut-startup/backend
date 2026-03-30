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

export const app = fastify({ logger: env.NODE_ENV === 'development' })

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
