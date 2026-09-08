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

    it('seleciona categoria e data do agendamento que originou o prontuário', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient() as never)
      prismaMock.clinicalRecord.findMany.mockResolvedValue([
        {
          ...Factory.clinicalRecord({ finalized: true }),
          vet: { name: 'Dra. Camila' },
          appointment: { category: 'VACCINATION', dateTime: new Date('2026-03-10T14:00:00.000Z') },
        },
      ] as never)
      prismaMock.vaccination.findMany.mockResolvedValue([] as never)
      prismaMock.examFile.findMany.mockResolvedValue([] as never)

      const response = await app.injectAuth(
        {
          method: 'GET',
          url: `/portal/patients/${SEED.PATIENT_ID}/history`,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)

      // O mock devolve o que for stubado, então a garantia real de que o tipo
      // de atendimento chega ao tutor está no select pedido ao Prisma.
      expect(prismaMock.clinicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            appointment: { select: { category: true, dateTime: true } },
          }),
        }),
      )

      expect(response.json().clinicalRecords[0].appointment).toMatchObject({
        category: 'VACCINATION',
      })
    })

    it('devolve appointment nulo em prontuário aberto fora da agenda', async () => {
      prismaMock.user.findUnique.mockResolvedValue(tutorUserWithPatients() as never)
      prismaMock.patient.findUnique.mockResolvedValue(Factory.patient() as never)
      prismaMock.clinicalRecord.findMany.mockResolvedValue([
        {
          ...Factory.clinicalRecord({ appointmentId: null, finalized: true }),
          vet: { name: 'Dra. Camila' },
          appointment: null,
        },
      ] as never)
      prismaMock.vaccination.findMany.mockResolvedValue([] as never)
      prismaMock.examFile.findMany.mockResolvedValue([] as never)

      const response = await app.injectAuth(
        {
          method: 'GET',
          url: `/portal/patients/${SEED.PATIENT_ID}/history`,
        },
        { role: ROLE.TUTOR, userId: SEED.TUTOR_USER_ID },
      )

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().clinicalRecords[0].appointment).toBeNull()
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
})
