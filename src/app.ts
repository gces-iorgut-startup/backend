import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import { env } from './config/env'
import { errorHandler } from './shared/middleware/error-handler'

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

// ── Routes (módulos) ─────────────────────────────────
// TODO: registrar rotas por módulo aqui conforme implementados
// app.register(authRoutes, { prefix: '/auth' })
// app.register(patientRoutes, { prefix: '/patients' })
// ...

// ── Error Handler ─────────────────────────────────────
app.setErrorHandler(errorHandler)

export default app
