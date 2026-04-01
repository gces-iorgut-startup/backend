import { describe, it, expect, beforeEach } from 'vitest'
import { CreateAppointmentUseCase } from './createAppointmentUseCase'
import { ListAppointmentsByDayUseCase } from './listAppointmentsByDayUseCase'
import { InMemoryAppointmentsRepository } from '../repositories/in-memory/InMemoryAppointmentsRepository'
import { InMemoryPatientsRepository } from '../../patient/repositories/in-memory/InMemoryPatientsRepository'
import { InMemoryUsersRepository } from '../../auth/repositories/in-memory/InMemoryUsersRepository'

async function setupRepos() {
  const appointmentsRepo = new InMemoryAppointmentsRepository()
  const patientsRepo = new InMemoryPatientsRepository()
  const usersRepo = new InMemoryUsersRepository()

  const patient = await patientsRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
  const vet = await usersRepo.create({ name: 'Dr. Vet', email: 'vet@g.com', passwordHash: 'x', role: 'VET' })

  return { appointmentsRepo, patientsRepo, usersRepo, patientId: patient.id, vetId: vet.id }
}

describe('CreateAppointmentUseCase', () => {
  it('deve criar agendamento com status SCHEDULED', async () => {
    const { appointmentsRepo, patientsRepo, usersRepo, patientId, vetId } = await setupRepos()
    const sut = new CreateAppointmentUseCase(appointmentsRepo, patientsRepo, usersRepo)

    const result = await sut.execute({ patientId, vetId, dateTime: new Date('2026-04-01T10:00:00'), category: 'VACCINATION' })

    expect(result.id).toBeDefined()
    expect(result.status).toBe('SCHEDULED')
  })

  it('deve criar agendamento de EXAM com observação', async () => {
    const { appointmentsRepo, patientsRepo, usersRepo, patientId, vetId } = await setupRepos()
    const sut = new CreateAppointmentUseCase(appointmentsRepo, patientsRepo, usersRepo)

    const result = await sut.execute({ patientId, vetId, dateTime: new Date('2026-04-01T14:00:00'), category: 'EXAM', observation: 'Exame de sangue' })
    expect(result.category).toBe('EXAM')
  })

  it('deve lançar 404 para paciente inexistente', async () => {
    const { appointmentsRepo, patientsRepo, usersRepo, vetId } = await setupRepos()
    const sut = new CreateAppointmentUseCase(appointmentsRepo, patientsRepo, usersRepo)

    await expect(sut.execute({ patientId: 'id-fake', vetId, dateTime: new Date(), category: 'OBSERVATION' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('deve lançar 404 para veterinário inexistente', async () => {
    const { appointmentsRepo, patientsRepo, usersRepo, patientId } = await setupRepos()
    const sut = new CreateAppointmentUseCase(appointmentsRepo, patientsRepo, usersRepo)

    await expect(sut.execute({ patientId, vetId: 'id-fake', dateTime: new Date(), category: 'OBSERVATION' })).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('ListAppointmentsByDayUseCase', () => {
  let appointmentsRepo: InMemoryAppointmentsRepository

  beforeEach(async () => {
    appointmentsRepo = new InMemoryAppointmentsRepository()
    await appointmentsRepo.create({ patientId: 'p1', vetId: 'v1', dateTime: new Date('2026-04-01T09:00:00'), category: 'VACCINATION' })
    await appointmentsRepo.create({ patientId: 'p2', vetId: 'v2', dateTime: new Date('2026-04-01T15:00:00'), category: 'EXAM' })
    await appointmentsRepo.create({ patientId: 'p3', vetId: 'v1', dateTime: new Date('2026-04-02T09:00:00'), category: 'EXAM' })
  })

  it('deve retornar apenas os agendamentos do dia informado', async () => {
    const result = await new ListAppointmentsByDayUseCase(appointmentsRepo).execute({ date: '2026-04-01' })
    expect(result).toHaveLength(2)
  })

  it('deve filtrar por vetId dentro do dia', async () => {
    const result = await new ListAppointmentsByDayUseCase(appointmentsRepo).execute({ date: '2026-04-01', vetId: 'v1' })
    expect(result).toHaveLength(1)
    expect(result[0].vetId).toBe('v1')
  })

  it('deve retornar array vazio para dia sem agendamentos', async () => {
    const result = await new ListAppointmentsByDayUseCase(appointmentsRepo).execute({ date: '2099-01-01' })
    expect(result).toHaveLength(0)
  })
})

import { CancelAppointmentUseCase } from './cancelAppointmentUseCase'
import { RescheduleAppointmentUseCase } from './rescheduleAppointmentUseCase'

describe('CancelAppointmentUseCase', () => {
  it('deve cancelar um agendamento SCHEDULED com justificativa', async () => {
    const { appointmentsRepo, patientId, vetId } = await setupRepos()
    const createUC = new CreateAppointmentUseCase(appointmentsRepo, new InMemoryPatientsRepository(), new InMemoryUsersRepository())
    // Recria repos com dados
    const pRepo = new InMemoryPatientsRepository()
    const uRepo = new InMemoryUsersRepository()
    const aRepo = new InMemoryAppointmentsRepository()
    const patient = await pRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
    const vet = await uRepo.create({ name: 'Dr. Vet', email: 'vet2@g.com', passwordHash: 'x', role: 'VET' })
    const appointment = await new CreateAppointmentUseCase(aRepo, pRepo, uRepo).execute({
      patientId: patient.id,
      vetId: vet.id,
      dateTime: new Date('2099-01-01T10:00:00'),
      category: 'OBSERVATION',
    })
    const cancelUC = new CancelAppointmentUseCase(aRepo)
    const result = await cancelUC.execute({ appointmentId: appointment.id, reason: 'Paciente não compareceu' })
    expect(result.status).toBe('CANCELLED')
    expect(result.cancelReason).toBe('Paciente não compareceu')
  })

  it('deve rejeitar cancelamento sem justificativa adequada', async () => {
    const aRepo = new InMemoryAppointmentsRepository()
    const pRepo = new InMemoryPatientsRepository()
    const uRepo = new InMemoryUsersRepository()
    const patient = await pRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
    const vet = await uRepo.create({ name: 'Dr. Vet', email: 'vet3@g.com', passwordHash: 'x', role: 'VET' })
    const appointment = await new CreateAppointmentUseCase(aRepo, pRepo, uRepo).execute({
      patientId: patient.id, vetId: vet.id,
      dateTime: new Date('2099-01-01T10:00:00'), category: 'OBSERVATION',
    })
    const cancelUC = new CancelAppointmentUseCase(aRepo)
    await expect(cancelUC.execute({ appointmentId: appointment.id, reason: 'ok' }))
      .rejects.toMatchObject({ statusCode: 400 })
  })

  it('deve rejeitar cancelamento de agendamento já cancelado', async () => {
    const aRepo = new InMemoryAppointmentsRepository()
    const pRepo = new InMemoryPatientsRepository()
    const uRepo = new InMemoryUsersRepository()
    const patient = await pRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
    const vet = await uRepo.create({ name: 'Dr. Vet', email: 'vet4@g.com', passwordHash: 'x', role: 'VET' })
    const appointment = await new CreateAppointmentUseCase(aRepo, pRepo, uRepo).execute({
      patientId: patient.id, vetId: vet.id,
      dateTime: new Date('2099-01-01T10:00:00'), category: 'OBSERVATION',
    })
    const cancelUC = new CancelAppointmentUseCase(aRepo)
    await cancelUC.execute({ appointmentId: appointment.id, reason: 'Motivo válido aqui' })
    await expect(cancelUC.execute({ appointmentId: appointment.id, reason: 'Motivo válido aqui' }))
      .rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('RescheduleAppointmentUseCase', () => {
  it('deve reagendar um agendamento SCHEDULED para data futura', async () => {
    const aRepo = new InMemoryAppointmentsRepository()
    const pRepo = new InMemoryPatientsRepository()
    const uRepo = new InMemoryUsersRepository()
    const patient = await pRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
    const vet = await uRepo.create({ name: 'Dr. Vet', email: 'vet5@g.com', passwordHash: 'x', role: 'VET' })
    const appointment = await new CreateAppointmentUseCase(aRepo, pRepo, uRepo).execute({
      patientId: patient.id, vetId: vet.id,
      dateTime: new Date('2099-01-01T10:00:00'), category: 'OBSERVATION',
    })
    const newDate = new Date('2099-06-01T10:00:00')
    const result = await new RescheduleAppointmentUseCase(aRepo).execute({
      appointmentId: appointment.id, newDateTime: newDate,
    })
    expect(result.dateTime).toEqual(newDate)
  })

  it('deve rejeitar reagendamento para data no passado', async () => {
    const aRepo = new InMemoryAppointmentsRepository()
    const pRepo = new InMemoryPatientsRepository()
    const uRepo = new InMemoryUsersRepository()
    const patient = await pRepo.create({ name: 'Rex', tutorId: 'tutor-1', species: 'Cachorro' })
    const vet = await uRepo.create({ name: 'Dr. Vet', email: 'vet6@g.com', passwordHash: 'x', role: 'VET' })
    const appointment = await new CreateAppointmentUseCase(aRepo, pRepo, uRepo).execute({
      patientId: patient.id, vetId: vet.id,
      dateTime: new Date('2099-01-01T10:00:00'), category: 'OBSERVATION',
    })
    await expect(
      new RescheduleAppointmentUseCase(aRepo).execute({
        appointmentId: appointment.id,
        newDateTime: new Date('2020-01-01'),
      })
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})
