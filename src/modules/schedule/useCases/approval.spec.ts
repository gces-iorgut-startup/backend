import { describe, it, expect } from 'vitest'
import { ApproveAppointmentUseCase } from './approveAppointmentUseCase'
import { RejectAppointmentUseCase } from './rejectAppointmentUseCase'
import { ListAppointmentsByStatusUseCase } from './listAppointmentsByStatusUseCase'
import { InMemoryAppointmentsRepository } from '../repositories/in-memory/InMemoryAppointmentsRepository'
import { InMemoryUsersRepository } from '../../auth/repositories/in-memory/InMemoryUsersRepository'
import { DEFAULT_APPOINTMENT_DURATION_MS, type AppointmentStatus } from '../repositories/IAppointmentsRepository'

const CLINIC_ID = 'clinic-1'
const REQUESTED_AT = new Date('2099-03-01T09:00:00')

async function setup() {
  const appointmentsRepo = new InMemoryAppointmentsRepository()
  const usersRepo = new InMemoryUsersRepository()
  const vet = await usersRepo.create({ name: 'Dr. Vet', email: 'vet@g.com', passwordHash: 'x', role: 'VET', clinicId: CLINIC_ID })

  async function createWithStatus(status: AppointmentStatus, overrides: { vetId?: string; dateTime?: Date; endDateTime?: Date } = {}) {
    const appointment = await appointmentsRepo.create({
      patientId: 'p1',
      dateTime: REQUESTED_AT,
      category: 'VACCINATION',
      ...overrides,
    })
    await appointmentsRepo.updateStatus(appointment.id, status)
    return appointment
  }

  return { appointmentsRepo, usersRepo, vetId: vet.id, createWithStatus }
}

describe('ApproveAppointmentUseCase', () => {
  it('deve aprovar solicitação pendente, atribuir veterinário e usar duração padrão', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    const result = await sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId })

    expect(result.status).toBe('SCHEDULED')
    expect(result.vetId).toBe(vetId)
    expect(result.vet).toEqual({ id: vetId, name: 'Veterinário' })
    expect(result.endDateTime).toEqual(new Date(REQUESTED_AT.getTime() + DEFAULT_APPOINTMENT_DURATION_MS))
  })

  it('deve usar o endDateTime informado na aprovação', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)
    const endDateTime = new Date('2099-03-01T09:30:00')

    const result = await sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId, endDateTime })

    expect(result.endDateTime).toEqual(endDateTime)
  })

  it('deve lançar 404 para agendamento de outra clínica', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: 'outra-clinica', vetId }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('deve lançar 404 para veterinário inexistente', async () => {
    const { appointmentsRepo, usersRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId: 'id-fake' }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('deve lançar 404 para veterinário de outra clínica', async () => {
    const { appointmentsRepo, usersRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const otherVet = await usersRepo.create({ name: 'Dr. Outra', email: 'outra@g.com', passwordHash: 'x', role: 'VET', clinicId: 'outra-clinica' })
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId: otherVet.id }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it('deve lançar 404 ao tentar atribuir um usuário TUTOR como veterinário', async () => {
    const { appointmentsRepo, usersRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const tutorUser = await usersRepo.create({ name: 'Tutor', email: 'tutor@g.com', passwordHash: 'x', role: 'TUTOR', clinicId: CLINIC_ID })
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId: tutorUser.id }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it.each(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const)(
    'deve lançar 400 ao aprovar agendamento com status %s',
    async (status) => {
      const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
      const appointment = await createWithStatus(status, { vetId })
      const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

      await expect(sut.execute({ appointmentId: appointment.id, clinicId: CLINIC_ID, vetId }))
        .rejects.toMatchObject({ statusCode: 400 })
    },
  )

  it('deve lançar 400 ao aprovar solicitação com data no passado', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL', { dateTime: new Date('2020-01-01T09:00:00') })
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId }))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('deve lançar 400 quando endDateTime não é posterior ao dateTime', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId, endDateTime: REQUESTED_AT }))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('deve lançar 409 quando o veterinário já tem consulta no horário', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    await createWithStatus('SCHEDULED', { vetId, endDateTime: new Date('2099-03-01T09:30:00') })
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId }))
      .rejects.toMatchObject({ statusCode: 409 })
    expect((await appointmentsRepo.findById(pending.id, CLINIC_ID))?.status).toBe('PENDING_APPROVAL')
  })

  it('não deve considerar outra solicitação pendente no mesmo horário como conflito', async () => {
    const { appointmentsRepo, usersRepo, vetId, createWithStatus } = await setup()
    await createWithStatus('PENDING_APPROVAL')
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new ApproveAppointmentUseCase(appointmentsRepo, usersRepo)

    const result = await sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, vetId })
    expect(result.status).toBe('SCHEDULED')
  })
})

describe('RejectAppointmentUseCase', () => {
  it('deve recusar solicitação pendente e registrar a justificativa', async () => {
    const { appointmentsRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new RejectAppointmentUseCase(appointmentsRepo)

    const result = await sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, reason: '  Sem disponibilidade no horário.  ' })

    expect(result.status).toBe('REJECTED')
    expect(result.cancelReason).toBe('Sem disponibilidade no horário.')
    expect(result.vetId).toBeNull()
  })

  it('deve lançar 404 para agendamento de outra clínica', async () => {
    const { appointmentsRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new RejectAppointmentUseCase(appointmentsRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: 'outra-clinica', reason: 'x' }))
      .rejects.toMatchObject({ statusCode: 404 })
  })

  it.each(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const)(
    'deve lançar 400 ao recusar agendamento com status %s',
    async (status) => {
      const { appointmentsRepo, vetId, createWithStatus } = await setup()
      const appointment = await createWithStatus(status, { vetId })
      const sut = new RejectAppointmentUseCase(appointmentsRepo)

      await expect(sut.execute({ appointmentId: appointment.id, clinicId: CLINIC_ID, reason: 'x' }))
        .rejects.toMatchObject({ statusCode: 400 })
    },
  )

  it('deve lançar 400 para justificativa vazia', async () => {
    const { appointmentsRepo, createWithStatus } = await setup()
    const pending = await createWithStatus('PENDING_APPROVAL')
    const sut = new RejectAppointmentUseCase(appointmentsRepo)

    await expect(sut.execute({ appointmentId: pending.id, clinicId: CLINIC_ID, reason: '   ' }))
      .rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('ListAppointmentsByStatusUseCase', () => {
  it('deve listar apenas solicitações com o status pedido, em ordem de data', async () => {
    const { appointmentsRepo, vetId, createWithStatus } = await setup()
    const later = await createWithStatus('PENDING_APPROVAL', { dateTime: new Date('2099-03-02T09:00:00') })
    const earlier = await createWithStatus('PENDING_APPROVAL', { dateTime: new Date('2099-03-01T08:00:00') })
    await createWithStatus('SCHEDULED', { vetId })
    await createWithStatus('REJECTED')

    const result = await new ListAppointmentsByStatusUseCase(appointmentsRepo).execute({ status: 'PENDING_APPROVAL', clinicId: CLINIC_ID })

    expect(result.map(a => a.id)).toEqual([earlier.id, later.id])
  })

  it('deve filtrar pelo dia quando date é informado', async () => {
    const { appointmentsRepo, createWithStatus } = await setup()
    await createWithStatus('PENDING_APPROVAL', { dateTime: new Date('2099-03-02T09:00:00') })
    const sameDay = await createWithStatus('PENDING_APPROVAL', { dateTime: new Date('2099-03-01T09:00:00') })

    const result = await new ListAppointmentsByStatusUseCase(appointmentsRepo).execute({ status: 'PENDING_APPROVAL', clinicId: CLINIC_ID, date: '2099-03-01' })

    expect(result.map(a => a.id)).toEqual([sameDay.id])
  })

  it('não deve listar solicitações de outra clínica', async () => {
    const { appointmentsRepo, createWithStatus } = await setup()
    await createWithStatus('PENDING_APPROVAL')

    const result = await new ListAppointmentsByStatusUseCase(appointmentsRepo).execute({ status: 'PENDING_APPROVAL', clinicId: 'outra-clinica' })

    expect(result).toHaveLength(0)
  })
})
