import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { APPOINTMENT, HTTP, SEED } from '../../utils/constants'
import { prismaMock } from '../../setup'

const FUTURE_ISO = '2026-12-31T10:00:00.000Z'
const FUTURE_END_ISO = '2026-12-31T10:30:00.000Z'

const validBody = (category: typeof APPOINTMENT.CATEGORIES[number]) => ({
  patientId: SEED.PATIENT_ID,
  vetId: SEED.OWNER_ID,
  dateTime: FUTURE_ISO,
  endDateTime: FUTURE_END_ISO,
  category,
})

describe('Appointment routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('POST /appointments', () => {
    it.each(APPOINTMENT.CATEGORIES)(
      'cria agendamento da categoria %s com 201',
      async (category) => {
        prismaMock.patient.findFirst.mockResolvedValue(Factory.patient() as never)
        prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)
        prismaMock.appointment.create.mockResolvedValue(
          Factory.appointment({ category }) as never,
        )

        const response = await app.injectAuth({
          method: 'POST',
          url: '/appointments',
          payload: validBody(category),
        })

        expect(response.statusCode).toBe(HTTP.CREATED)
        expect(response.json().appointment.category).toBe(category)
      },
    )

    it('retorna 404 quando paciente não existe', async () => {
      prismaMock.patient.findFirst.mockResolvedValue(null)
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)

      const response = await app.injectAuth({
        method: 'POST',
        url: '/appointments',
        payload: validBody('OBSERVATION'),
      })

      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })

    it('retorna 400 quando endDateTime <= dateTime', async () => {
      prismaMock.patient.findFirst.mockResolvedValue(Factory.patient() as never)
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner() as never)

      const response = await app.injectAuth({
        method: 'POST',
        url: '/appointments',
        payload: { ...validBody('OBSERVATION'), endDateTime: FUTURE_ISO },
      })

      expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
    })

    it.each([
      { name: 'patientId inválido', body: { ...validBody('OBSERVATION'), patientId: 'x' } },
      { name: 'categoria desconhecida', body: { ...validBody('OBSERVATION'), category: 'OUTRA' } },
      { name: 'dateTime inválido', body: { ...validBody('OBSERVATION'), dateTime: 'amanha' } },
    ])('rejeita payload inválido ($name) com 422', async ({ body }) => {
      const response = await app.injectAuth({
        method: 'POST',
        url: '/appointments',
        payload: body,
      })
      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })
  })

  describe('GET /appointments', () => {
    it('lista agendamentos do dia', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([Factory.appointment()] as never)
      const response = await app.injectAuth({
        method: 'GET',
        url: '/appointments?date=2026-12-31',
      })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().appointments).toHaveLength(1)
    })

    it('rejeita data em formato inválido', async () => {
      const response = await app.injectAuth({
        method: 'GET',
        url: '/appointments?date=31-12-2026',
      })
      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })
  })

  describe('DELETE /appointments/:id', () => {
    it('cancela agendamento SCHEDULED', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(Factory.appointment() as never)
      prismaMock.appointment.update.mockResolvedValue(
        Factory.appointment({ status: 'CANCELLED', cancelReason: 'tutor pediu' }) as never,
      )

      const response = await app.injectAuth({
        method: 'DELETE',
        url: `/appointments/${SEED.APPOINTMENT_ID}`,
        payload: { reason: 'tutor pediu' },
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().status).toBe('CANCELLED')
    })

    it.each(['COMPLETED', 'CANCELLED', 'IN_PROGRESS'] as const)(
      'rejeita cancelamento de agendamento com status %s',
      async (status) => {
        prismaMock.appointment.findFirst.mockResolvedValue(
          Factory.appointment({ status }) as never,
        )

        const response = await app.injectAuth({
          method: 'DELETE',
          url: `/appointments/${SEED.APPOINTMENT_ID}`,
          payload: { reason: 'tentativa' },
        })

        expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
      },
    )

    it('retorna 404 para agendamento inexistente', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(null)
      const response = await app.injectAuth({
        method: 'DELETE',
        url: `/appointments/${SEED.APPOINTMENT_ID}`,
        payload: { reason: 'x' },
      })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PATCH /appointments/:id/reschedule', () => {
    it('reagenda quando status é SCHEDULED', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(Factory.appointment() as never)
      prismaMock.appointment.update.mockResolvedValue(Factory.appointment() as never)

      const response = await app.injectAuth({
        method: 'PATCH',
        url: `/appointments/${SEED.APPOINTMENT_ID}/reschedule`,
        payload: { dateTime: FUTURE_ISO, endDateTime: FUTURE_END_ISO },
      })

      expect(response.statusCode).toBe(HTTP.OK)
    })
  })
})
