import type { FastifyInstance, InjectOptions } from 'fastify'
import { FAKE, SEED, ROLE } from './constants'

export interface AuthClaims {
  userId: string
  role: typeof ROLE[keyof typeof ROLE]
  clinicId: string
}

export class TestApp {
  private constructor(public readonly fastify: FastifyInstance) {}

  static async build(): Promise<TestApp> {
    const { app } = await import('../../src/app')
    await app.ready()
    return new TestApp(app)
  }

  async close(): Promise<void> {
    await this.fastify.close()
  }

  signToken(claims: Partial<AuthClaims> = {}): string {
    const payload: AuthClaims = {
      userId: claims.userId ?? SEED.OWNER_ID,
      role: claims.role ?? ROLE.OWNER,
      clinicId: claims.clinicId ?? SEED.CLINIC_ID,
    }
    return this.fastify.jwt.sign(payload)
  }

  authHeader(claims: Partial<AuthClaims> = {}): Record<string, string> {
    return { authorization: `${FAKE.BEARER_PREFIX}${this.signToken(claims)}` }
  }

  inject(opts: InjectOptions) {
    return this.fastify.inject(opts)
  }

  injectAuth(opts: InjectOptions, claims: Partial<AuthClaims> = {}) {
    return this.fastify.inject({
      ...opts,
      headers: { ...(opts.headers ?? {}), ...this.authHeader(claims) },
    })
  }
}
