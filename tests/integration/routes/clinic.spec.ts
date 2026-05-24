import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { HTTP, ROLE, SEED, FAKE } from '../../utils/constants'
import { prismaMock } from '../../setup'

describe('Clinic routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('GET /clinics/me', () => {
    it('retorna 401 sem token', async () => {
      const response = await app.inject({ method: 'GET', url: '/clinics/me' })
      expect(response.statusCode).toBe(HTTP.UNAUTHORIZED)
    })

    it('retorna clínica do usuário autenticado', async () => {
      prismaMock.clinic.findUnique.mockResolvedValue(Factory.clinic() as never)
      const response = await app.injectAuth({ method: 'GET', url: '/clinics/me' })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().clinic).toMatchObject({ id: SEED.CLINIC_ID })
    })

    it('retorna 404 quando clínica não encontrada', async () => {
      prismaMock.clinic.findUnique.mockResolvedValue(null)
      const response = await app.injectAuth({ method: 'GET', url: '/clinics/me' })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PATCH /clinics/me', () => {
    it('atualiza clínica quando role é OWNER', async () => {
      const updated = Factory.clinic({ name: 'Nova Clínica' })
      prismaMock.clinic.update.mockResolvedValue(updated as never)

      const response = await app.injectAuth({
        method: 'PATCH',
        url: '/clinics/me',
        payload: { name: 'Nova Clínica' },
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().clinic.name).toBe('Nova Clínica')
    })

    it.each([ROLE.VET, ROLE.TUTOR])('rejeita role %s com 403', async (role) => {
      const response = await app.injectAuth(
        { method: 'PATCH', url: '/clinics/me', payload: { name: 'Nome OK' } },
        { role },
      )
      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })

    it.each([
      { name: 'CNPJ inválido', body: { cnpj: '00000000000000' } },
      { name: 'nome curto', body: { name: 'a' } },
      { name: 'phone curto', body: { phone: '11' } },
    ])('rejeita payload inválido ($name) com 422', async ({ body }) => {
      const response = await app.injectAuth({ method: 'PATCH', url: '/clinics/me', payload: body })
      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })

    it('aceita CNPJ válido normalizado', async () => {
      prismaMock.clinic.update.mockResolvedValue(Factory.clinic() as never)
      const response = await app.injectAuth({
        method: 'PATCH',
        url: '/clinics/me',
        payload: { cnpj: FAKE.CNPJ_VALID },
      })
      expect(response.statusCode).toBe(HTTP.OK)
    })
  })
})
