import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { HTTP, SEED } from '../../utils/constants'
import { prismaMock } from '../../setup'

describe('Clinical record routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('POST /clinical-records', () => {
    it('inicia prontuário a partir de agendamento SCHEDULED', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(Factory.appointment() as never)
      prismaMock.clinicalRecord.findUnique.mockResolvedValue(null)
      prismaMock.clinicalRecord.create.mockResolvedValue(Factory.clinicalRecord() as never)
      prismaMock.appointment.update.mockResolvedValue(
        Factory.appointment({ status: 'IN_PROGRESS' }) as never,
      )

      const response = await app.injectAuth({
        method: 'POST',
        url: '/clinical-records',
        payload: { appointmentId: SEED.APPOINTMENT_ID },
      })

      expect(response.statusCode).toBe(HTTP.CREATED)
      expect(response.json().id).toBe(SEED.RECORD_ID)
    })

    it('reutiliza prontuário existente do agendamento', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(
        Factory.appointment({ status: 'IN_PROGRESS' }) as never,
      )
      prismaMock.clinicalRecord.findUnique.mockResolvedValue(Factory.clinicalRecord() as never)

      const response = await app.injectAuth({
        method: 'POST',
        url: '/clinical-records',
        payload: { appointmentId: SEED.APPOINTMENT_ID },
      })

      expect(response.statusCode).toBe(HTTP.CREATED)
    })

    it.each([
      { status: 'COMPLETED', code: HTTP.BAD_REQUEST },
      { status: 'CANCELLED', code: HTTP.BAD_REQUEST },
    ] as const)(
      'rejeita quando agendamento está $status',
      async ({ status, code }) => {
        prismaMock.appointment.findFirst.mockResolvedValue(
          Factory.appointment({ status }) as never,
        )

        const response = await app.injectAuth({
          method: 'POST',
          url: '/clinical-records',
          payload: { appointmentId: SEED.APPOINTMENT_ID },
        })

        expect(response.statusCode).toBe(code)
      },
    )

    it('retorna 403 quando vet do token não é o responsável', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(
        Factory.appointment({ vetId: SEED.VET_ID }) as never,
      )
      const response = await app.injectAuth({
        method: 'POST',
        url: '/clinical-records',
        payload: { appointmentId: SEED.APPOINTMENT_ID },
      })
      expect(response.statusCode).toBe(HTTP.FORBIDDEN)
    })

    it('retorna 404 quando agendamento não existe', async () => {
      prismaMock.appointment.findFirst.mockResolvedValue(null)
      const response = await app.injectAuth({
        method: 'POST',
        url: '/clinical-records',
        payload: { appointmentId: SEED.APPOINTMENT_ID },
      })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PUT /clinical-records/:id', () => {
    it('atualiza dados do prontuário', async () => {
      prismaMock.clinicalRecord.findFirst.mockResolvedValue(Factory.clinicalRecord() as never)
      prismaMock.clinicalRecord.update.mockResolvedValue(
        Factory.clinicalRecord({ diagnosis: 'Otite' }) as never,
      )

      const response = await app.injectAuth({
        method: 'PUT',
        url: `/clinical-records/${SEED.RECORD_ID}`,
        payload: { diagnosis: 'Otite', weightKg: 13 },
      })

      expect(response.statusCode).toBe(HTTP.OK)
    })

    it('retorna 404 quando prontuário não existe', async () => {
      prismaMock.clinicalRecord.findFirst.mockResolvedValue(null)
      const response = await app.injectAuth({
        method: 'PUT',
        url: `/clinical-records/${SEED.RECORD_ID}`,
        payload: { diagnosis: 'Otite' },
      })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PATCH /clinical-records/:id/finalize', () => {
    it('finaliza prontuário e marca agendamento como COMPLETED', async () => {
      prismaMock.clinicalRecord.findFirst.mockResolvedValue(Factory.clinicalRecord() as never)
      prismaMock.clinicalRecord.update.mockResolvedValue(
        Factory.clinicalRecord({ finalized: true }) as never,
      )
      prismaMock.appointment.update.mockResolvedValue(
        Factory.appointment({ status: 'COMPLETED' }) as never,
      )

      const response = await app.injectAuth({
        method: 'PATCH',
        url: `/clinical-records/${SEED.RECORD_ID}/finalize`,
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().finalized).toBe(true)
    })

    it('rejeita finalização duplicada com 400', async () => {
      prismaMock.clinicalRecord.findFirst.mockResolvedValue(
        Factory.clinicalRecord({ finalized: true }) as never,
      )
      const response = await app.injectAuth({
        method: 'PATCH',
        url: `/clinical-records/${SEED.RECORD_ID}/finalize`,
      })
      expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
    })
  })

  describe('GET /clinical-records/patient/:patientId', () => {
    it('lista histórico do paciente', async () => {
      prismaMock.clinicalRecord.findMany.mockResolvedValue([Factory.clinicalRecord()] as never)
      const response = await app.injectAuth({
        method: 'GET',
        url: `/clinical-records/patient/${SEED.PATIENT_ID}`,
      })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().items).toHaveLength(1)
    })
  })

  describe('GET /clinical-records/:id/prescription', () => {
    it('rejeita quando prontuário não está finalizado', async () => {
      prismaMock.clinicalRecord.findUnique.mockResolvedValue({
        ...Factory.clinicalRecord({ finalized: false }),
        patient: { ...Factory.patient(), tutor: Factory.tutor(), clinic: Factory.clinic() },
        vet: Factory.owner(),
      } as never)
      const response = await app.injectAuth({
        method: 'GET',
        url: `/clinical-records/${SEED.RECORD_ID}/prescription`,
      })
      expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
    })

    it('rejeita quando prontuário não tem prescrição', async () => {
      prismaMock.clinicalRecord.findUnique.mockResolvedValue({
        ...Factory.clinicalRecord({ finalized: true, prescriptions: null }),
        patient: { ...Factory.patient(), tutor: Factory.tutor(), clinic: Factory.clinic() },
        vet: Factory.owner(),
      } as never)
      const response = await app.injectAuth({
        method: 'GET',
        url: `/clinical-records/${SEED.RECORD_ID}/prescription`,
      })
      expect(response.statusCode).toBe(HTTP.BAD_REQUEST)
    })

    it('gera PDF quando prontuário está finalizado e possui prescrições', async () => {
      prismaMock.clinicalRecord.findUnique.mockResolvedValue({
        ...Factory.clinicalRecord({
          finalized: true,
          prescriptions: 'Amoxicilina 250mg, 2x ao dia, 7 dias.',
          routineGuidance: null,
        }),
        patient: { ...Factory.patient(), tutor: Factory.tutor(), clinic: Factory.clinic() },
        vet: Factory.owner(),
      } as never)

      const response = await app.injectAuth({
        method: 'GET',
        url: `/clinical-records/${SEED.RECORD_ID}/prescription`,
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.headers['content-type']).toContain('application/pdf')
    })
  })
})
