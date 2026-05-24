import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { FAKE, HTTP, ROLE, SEED } from '../../utils/constants'
import { prismaMock } from '../../setup'

const REGISTER_OWNER_PAYLOAD = {
  name: 'Dr. Dono',
  email: FAKE.EMAIL,
  password: FAKE.PASSWORD,
  clinicName: 'Clínica IOUGURT',
  clinicCnpj: FAKE.CNPJ_VALID,
  clinicAddress: 'Rua Vet, 100',
  clinicPhone: FAKE.PHONE,
  crmv: 'CRMV-12345',
}

describe('Auth routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('POST /auth/register', () => {
    it('cria OWNER e clínica com 201', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      prismaMock.clinic.create.mockResolvedValue(Factory.clinic() as never)
      prismaMock.user.create.mockResolvedValue(Factory.owner() as never)

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: REGISTER_OWNER_PAYLOAD,
      })

      expect(response.statusCode).toBe(HTTP.CREATED)
      expect(response.json().user).toMatchObject({
        id: SEED.OWNER_ID,
        email: FAKE.EMAIL,
        role: ROLE.OWNER,
      })
    })

    it('retorna 409 quando o e-mail já existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: REGISTER_OWNER_PAYLOAD,
      })

      expect(response.statusCode).toBe(HTTP.CONFLICT)
    })

    const INVALID_PAYLOADS = [
      { name: 'email inválido', body: { ...REGISTER_OWNER_PAYLOAD, email: 'nao-eh-email' } },
      { name: 'senha curta', body: { ...REGISTER_OWNER_PAYLOAD, password: '123' } },
      { name: 'sem clinicName', body: { ...REGISTER_OWNER_PAYLOAD, clinicName: '' } },
      { name: 'CNPJ inválido', body: { ...REGISTER_OWNER_PAYLOAD, clinicCnpj: '00000000000000' } },
    ]

    it.each(INVALID_PAYLOADS)('rejeita payload inválido ($name) com 422', async ({ body }) => {
      const response = await app.inject({ method: 'POST', url: '/auth/register', payload: body })
      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })
  })

  describe('POST /auth/login', () => {
    const LOGIN_PAYLOAD = { email: FAKE.EMAIL, password: FAKE.PASSWORD }

    it('autentica com credenciais válidas e devolve tokens', async () => {
      const hashed = await bcrypt.hash(FAKE.PASSWORD, 6)
      prismaMock.user.findUnique.mockResolvedValue(
        Factory.owner({ passwordHash: hashed }) as never,
      )
      prismaMock.refreshToken.create.mockResolvedValue(Factory.refreshToken() as never)

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: LOGIN_PAYLOAD,
      })

      expect(response.statusCode).toBe(HTTP.OK)
      const body = response.json()
      expect(body.accessToken).toEqual(expect.any(String))
      expect(body.refreshToken).toEqual(expect.any(String))
      expect(body.user.email).toBe(FAKE.EMAIL)
    })

    it('rejeita usuário inexistente com 401', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: LOGIN_PAYLOAD,
      })
      expect(response.statusCode).toBe(HTTP.UNAUTHORIZED)
    })

    it('rejeita senha incorreta com 401', async () => {
      const hashed = await bcrypt.hash('outra-senha', 6)
      prismaMock.user.findUnique.mockResolvedValue(
        Factory.owner({ passwordHash: hashed }) as never,
      )
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: LOGIN_PAYLOAD,
      })
      expect(response.statusCode).toBe(HTTP.UNAUTHORIZED)
    })
  })

  describe('GET /auth/me', () => {
    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/auth/me' })
      expect(response.statusCode).toBe(HTTP.UNAUTHORIZED)
    })

    it('retorna usuário autenticado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)
      const response = await app.injectAuth({ method: 'GET', url: '/auth/me' })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().user).toMatchObject({ id: SEED.OWNER_ID, email: FAKE.EMAIL })
    })

    it('retorna 404 quando usuário não encontrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      const response = await app.injectAuth({ method: 'GET', url: '/auth/me' })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PATCH /auth/me', () => {
    it('atualiza nome do usuário', async () => {
      const updated = Factory.owner({ name: 'Dr. Novo' })
      prismaMock.user.update.mockResolvedValue(updated as never)

      const response = await app.injectAuth({
        method: 'PATCH',
        url: '/auth/me',
        payload: { name: 'Dr. Novo' },
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().user.name).toBe('Dr. Novo')
    })
  })

  describe('POST /auth/register/vet', () => {
    const VET_PAYLOAD = {
      name: 'Vet Novo',
      email: 'vet.novo@iougurt.com',
      password: FAKE.PASSWORD,
      crmv: 'CRMV-9999',
    }

    it('cria VET quando chamado por OWNER', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      prismaMock.user.create.mockResolvedValue(Factory.vet() as never)

      const response = await app.injectAuth({
        method: 'POST',
        url: '/auth/register/vet',
        payload: VET_PAYLOAD,
      })

      expect(response.statusCode).toBe(HTTP.CREATED)
      expect(response.json().user.role).toBe(ROLE.VET)
    })

    it.each([ROLE.VET, ROLE.TUTOR])('rejeita role %s com 403', async (role) => {
      const response = await app.injectAuth(
        { method: 'POST', url: '/auth/register/vet', payload: VET_PAYLOAD },
        { role },
      )
      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })
  })

  describe('POST /auth/refresh', () => {
    it('renova token com refresh válido', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(Factory.refreshToken() as never)
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as never)
      prismaMock.refreshToken.create.mockResolvedValue(Factory.refreshToken() as never)
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)

      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: FAKE.REFRESH_TOKEN },
      })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().accessToken).toEqual(expect.any(String))
    })

    it('rejeita refresh token desconhecido com 401', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null)
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken: 'invalido' },
      })
      expect(response.statusCode).toBe(HTTP.UNAUTHORIZED)
    })
  })

  describe('DELETE /auth/logout', () => {
    it('encerra sessão com 204', async () => {
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as never)
      const response = await app.injectAuth({ method: 'DELETE', url: '/auth/logout' })
      expect(response.statusCode).toBe(HTTP.NO_CONTENT)
    })
  })

  describe('POST /auth/password/forgot', () => {
    it('retorna 204 mesmo quando e-mail não existe (não vaza informação)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)
      const response = await app.inject({
        method: 'POST',
        url: '/auth/password/forgot',
        payload: { email: FAKE.EMAIL },
      })
      expect(response.statusCode).toBe(HTTP.NO_CONTENT)
    })
  })

  describe('POST /auth/password/reset', () => {
    it('rejeita token inválido com 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/password/reset',
        payload: { token: 'token-invalido', newPassword: 'senha-nova-123' },
      })
      expect([HTTP.UNAUTHORIZED, HTTP.BAD_REQUEST]).toContain(response.statusCode)
    })
  })
})
