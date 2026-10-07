import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'

describe('CORS (preflight)', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])(
    'libera o método %s para requisições cross-origin',
    async (method) => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/appointments/00000000-0000-0000-0000-000000000000',
        headers: {
          origin: 'http://localhost:5173',
          'access-control-request-method': method,
        },
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers['access-control-allow-methods']).toContain(method)
    },
  )
})
