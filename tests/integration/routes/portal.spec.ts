import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { HTTP, ROLE, SEED } from '../../utils/constants'
import { prismaMock } from '../../setup'

function tutorUserWithPatients() {
  return {
    ...Factory.tutorUser(),
    tutorAccount: {
      ...Factory.tutor({ userId: SEED.TUTOR_USER_ID }),
      patients: [Factory.patient()],
    },
  }
}

describe('Portal do Tutor routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('GET /portal/dashboard', () => {
    it('retorna dashboard do tutor autenticado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.appointment.findMany.mockResolvedValue([] as never)
      prismaMock.vaccination.findMany.mockResolvedValue([] as never)

      const response = await app.injectAuth(
        { method: 'GET', url: '/portal/dashboard' },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)
    })

    it.each([ROLE.OWNER, ROLE.VET])('rejeita role %s com 403', async (role) => {
      prismaMock.user.findUnique.mockResolvedValue(Factory.owner({ role }) as never)
      const response = await app.injectAuth(
        { method: 'GET', url: '/portal/dashboard' },
        { role },
      )
      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })

    it('retorna 404 quando conta de tutor não existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...Factory.tutorUser(),
        tutorAccount: null,
      } as never)
      const response = await app.injectAuth(
        { method: 'GET', url: '/portal/dashboard' },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('GET /portal/alerts', () => {
    it('retorna alertas do tutor', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.vaccination.findMany.mockResolvedValue([] as never)
      prismaMock.clinicalRecord.findMany.mockResolvedValue([] as never)

      const response = await app.injectAuth(
        { method: 'GET', url: '/portal/alerts' },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)
    })
  })

  describe('GET /portal/patients/:patientId/history', () => {
    it('retorna histórico de pet pertencente ao tutor', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient() as never)
      prismaMock.clinicalRecord.findMany.mockResolvedValue([] as never)
      prismaMock.vaccination.findMany.mockResolvedValue([] as never)
      prismaMock.examFile.findMany.mockResolvedValue([] as never)
      prismaMock.appointment.findMany.mockResolvedValue([] as never)

      const response = await app.injectAuth(
        {
          method: 'GET',
          url: `/portal/patients/${SEED.PATIENT_ID}/history`,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)
    })

    it('rejeita pet que não pertence ao tutor com 403', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...Factory.tutorUser(),
        tutorAccount: { ...Factory.tutor(), patients: [] },
      } as never)
      const response = await app.injectAuth(
        {
          method: 'GET',
          url: `/portal/patients/${SEED.PATIENT_ID}/history`,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )
      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })
  })

  describe('POST /portal/appointments/request', () => {
    const validBody = {
      patientId: SEED.PATIENT_ID,
      category: 'VACCINATION',
      dateTime: '2026-12-31T10:00:00.000Z',
      observation: 'Primeira dose',
    }

    it('cria solicitação com status PENDING_APPROVAL e vetId nulo (201)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient({ id: SEED.PATIENT_ID, tutorId: SEED.TUTOR_ID }) as never)
      prismaMock.appointment.create.mockResolvedValue({
        ...Factory.appointment({
          patientId: SEED.PATIENT_ID,
          vetId: null,
          status: 'PENDING_APPROVAL',
        }),
        patient: { id: SEED.PATIENT_ID, name: 'Rex', species: 'Canino' },
      } as never)

      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments/request',
          payload: validBody,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.CREATED)
      const data = response.json()
      expect(data.appointment.status).toBe('PENDING_APPROVAL')
      expect(data.appointment.vetId).toBeNull()
    })

    it('rejeita solicitação para animal de outro tutor com 403', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...Factory.tutorUser(),
        tutorAccount: { ...Factory.tutor({ id: 'tutor-1' }), patients: [] },
      } as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient({ id: SEED.PATIENT_ID, tutorId: 'outro-tutor' }) as never)

      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments/request',
          payload: validBody,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })

    it('rejeita solicitação com data no passado com 400', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient({ id: SEED.PATIENT_ID, tutorId: SEED.TUTOR_ID }) as never)

      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments/request',
          payload: {
            ...validBody,
            dateTime: '2020-01-01T10:00:00.000Z',
          },
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
    })

    it('rejeita com 404 quando o pet não existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(null as never)

      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments/request',
          payload: validBody,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })

    it('rejeita payload inválido com 422', async () => {
      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments/request',
          payload: { category: 'INVALID' },
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })

    it('funciona também via alias /portal/appointments', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient({ id: SEED.PATIENT_ID, tutorId: SEED.TUTOR_ID }) as never)
      prismaMock.appointment.create.mockResolvedValue({
        ...Factory.appointment({
          patientId: SEED.PATIENT_ID,
          vetId: null,
          status: 'PENDING_APPROVAL',
        }),
        patient: { id: SEED.PATIENT_ID, name: 'Rex', species: 'Canino' },
      } as never)

      const response = await app.injectAuth(
        {
          method: 'POST',
          url: '/portal/appointments',
          payload: validBody,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.CREATED)
    })
  })

  describe('GET /portal/appointments', () => {
    it('retorna lista de agendamentos dos pets do tutor com status e motivo (200)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          ...Factory.appointment({
            status: 'REJECTED',
            cancelReason: 'Sem disponibilidade',
          }),
          patient: { id: SEED.PATIENT_ID, name: 'Rex', species: 'Canino' },
        },
      ] as never)

      const response = await app.injectAuth(
        {
          method: 'GET',
          url: '/portal/appointments',
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)
      const data = response.json()
      expect(data.appointments).toHaveLength(1)
      expect(data.appointments[0].status).toBe('REJECTED')
      expect(data.appointments[0].cancelReason).toBe('Sem disponibilidade')
    })
  })
})
