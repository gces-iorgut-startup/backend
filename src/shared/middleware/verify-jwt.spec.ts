import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import jwt from 'jsonwebtoken'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyJwt } from './verify-jwt'

describe('verifyJwt', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | null = null

  async function buildApp() {
    const instance = Fastify()
    await instance.register(fastifyJwt, { secret: 'shared-secret' })

    instance.get('/protected', { preHandler: verifyJwt }, async request => {
      return { user: request.user }
    })

    return instance
  }

  afterEach(async () => {
    if (app) await app.close()
    app = null
  })

  it('aceita access token com payload esperado', async () => {
    app = await buildApp()
    const accessToken = app.jwt.sign({
      userId: 'user-1',
      role: 'OWNER',
      clinicId: 'clinic-1',
    })

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
  })

  it('rejeita token de reset mesmo quando assinado com o mesmo secret', async () => {
    app = await buildApp()
    const resetToken = jwt.sign(
      { sub: 'user-1', purpose: 'password-reset' },
      'shared-secret',
      { expiresIn: '2h' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: `Bearer ${resetToken}` },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ message: 'Token inválido ou expirado.' })
  })
})
