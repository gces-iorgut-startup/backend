import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TestApp } from '../../utils/app-builder'
import { Factory } from '../../utils/factories'
import { HTTP, SEED } from '../../utils/constants'
import { prismaMock } from '../../setup'

const VALID_PATIENT_BODY = {
  name: 'Rex',
  tutorId: SEED.TUTOR_ID,
  species: 'Canino',
  breed: 'SRD',
  sex: 'Masculino',
  weightKg: 12.5,
}

describe('Patient routes', () => {
  let app: TestApp

  beforeAll(async () => { app = await TestApp.build() })
  afterAll(async () => { await app.close() })

  describe('POST /patients', () => {
    it('cria paciente quando tutor existe', async () => {
      prismaMock.tutor.findFirst.mockResolvedValue(Factory.tutor() as never)
      prismaMock.patient.create.mockResolvedValue(Factory.patient() as never)

      const response = await app.injectAuth({
        method: 'POST',
        url: '/patients',
        payload: VALID_PATIENT_BODY,
      })

      expect(response.statusCode).toBe(HTTP.CREATED)
      expect(response.json().patient).toMatchObject({ id: SEED.PATIENT_ID })
    })

    it('retorna 404 quando tutor não existe', async () => {
      prismaMock.tutor.findFirst.mockResolvedValue(null)
      const response = await app.injectAuth({
        method: 'POST',
        url: '/patients',
        payload: VALID_PATIENT_BODY,
      })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })

    it.each([
      { name: 'sem species', body: { ...VALID_PATIENT_BODY, species: '' } },
      { name: 'tutorId não UUID', body: { ...VALID_PATIENT_BODY, tutorId: 'bad' } },
      { name: 'peso acima do máximo', body: { ...VALID_PATIENT_BODY, weightKg: 9999 } },
    ])('rejeita payload inválido ($name) com 422', async ({ body }) => {
      const response = await app.injectAuth({ method: 'POST', url: '/patients', payload: body })
      expect(response.statusCode).toBe(HTTP.UNPROCESSABLE)
    })
  })

  describe('GET /patients', () => {
    it('lista pacientes', async () => {
      prismaMock.patient.findMany.mockResolvedValue([Factory.patient()] as never)
      prismaMock.patient.count.mockResolvedValue(1 as never)

      const response = await app.injectAuth({ method: 'GET', url: '/patients' })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().patients).toHaveLength(1)
    })
  })

  describe('GET /patients/:id', () => {
    it('retorna 200 quando encontrado', async () => {
      prismaMock.patient.findFirst.mockResolvedValue(Factory.patient() as never)
      const response = await app.injectAuth({
        method: 'GET',
        url: `/patients/${SEED.PATIENT_ID}`,
      })
      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().patient.id).toBe(SEED.PATIENT_ID)
    })

    it('retorna 404 quando não encontrado', async () => {
      prismaMock.patient.findFirst.mockResolvedValue(null)
      const response = await app.injectAuth({
        method: 'GET',
        url: `/patients/${SEED.PATIENT_ID}`,
      })
      expect(response.statusCode).toBe(HTTP.NOT_FOUND)
    })
  })

  describe('PUT /patients/:id', () => {
    it('atualiza paciente', async () => {
      const patientWithTutor = { ...Factory.patient(), tutor: Factory.tutor() }
      const updatedPatient = { ...Factory.patient({ name: 'Rex Renomeado' }), tutor: Factory.tutor() }
      prismaMock.patient.findFirst
        .mockResolvedValueOnce(patientWithTutor as never)
        .mockResolvedValueOnce(updatedPatient as never)
      prismaMock.patient.update.mockResolvedValue(Factory.patient() as never)
      prismaMock.tutor.findFirst.mockResolvedValue(Factory.tutor() as never)

      const response = await app.injectAuth({
        method: 'PUT',
        url: `/patients/${SEED.PATIENT_ID}`,
        payload: { name: 'Rex Renomeado' },
      })

      expect(response.statusCode).toBe(HTTP.OK)
      expect(response.json().patient.name).toBe('Rex Renomeado')
    })
  })
})
