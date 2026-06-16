import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryAppointmentsRepository } from '../schedule/repositories/in-memory/InMemoryAppointmentsRepository'
import { InMemoryClinicalRecordsRepository } from './repositories/in-memory/InMemoryClinicalRecordsRepository'
import { StartClinicalRecordUseCase } from './useCases/startClinicalRecordUseCase'
import { UpdateClinicalRecordUseCase } from './useCases/updateClinicalRecordUseCase'
import { FinalizeClinicalRecordUseCase } from './useCases/finalizeClinicalRecordUseCase'
import { GetPatientHistoryUseCase } from './useCases/getPatientHistoryUseCase'
import { randomUUID } from 'crypto'

describe('Clinical Records Module', () => {
  let appointmentsRepository: InMemoryAppointmentsRepository
  let clinicalRecordsRepository: InMemoryClinicalRecordsRepository
  let startUseCase: StartClinicalRecordUseCase
  let updateUseCase: UpdateClinicalRecordUseCase
  let finalizeUseCase: FinalizeClinicalRecordUseCase
  let historyUseCase: GetPatientHistoryUseCase

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository()
    clinicalRecordsRepository = new InMemoryClinicalRecordsRepository()

    startUseCase = new StartClinicalRecordUseCase(appointmentsRepository, clinicalRecordsRepository)
    updateUseCase = new UpdateClinicalRecordUseCase(clinicalRecordsRepository)
    finalizeUseCase = new FinalizeClinicalRecordUseCase(clinicalRecordsRepository, appointmentsRepository)
    historyUseCase = new GetPatientHistoryUseCase(clinicalRecordsRepository)
  })

  it('should start a clinical record and change appointment status to IN_PROGRESS', async () => {
    const vetId = randomUUID()
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date(),
      category: 'OBSERVATION',
    })

    const record = await startUseCase.execute({
      appointmentId: appointment.id,
      vetId,
      clinicId: 'clinic-1',
    })

    expect(record.id).toBeDefined()
    expect(record.appointmentId).toBe(appointment.id)
    expect(record.patientId).toBe('patient-1')

    const updatedAppt = await appointmentsRepository.findById(appointment.id, 'clinic-1')
    expect(updatedAppt?.status).toBe('IN_PROGRESS')
  })

  it('should not allow starting a record if not the assigned vet', async () => {
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId: randomUUID(),
      dateTime: new Date(),
      category: 'OBSERVATION',
    })

    await expect(startUseCase.execute({
      appointmentId: appointment.id,
      vetId: randomUUID(), // different vet
      clinicId: 'clinic-1',
    })).rejects.toThrow('Apenas o veterinário responsável')
  })

  it('should update clinical record notes and weight', async () => {
    const vetId = randomUUID()
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date(),
      category: 'OBSERVATION',
    })

    const record = await startUseCase.execute({
      appointmentId: appointment.id,
      vetId,
      clinicId: 'clinic-1',
    })

    const updated = await updateUseCase.execute({
      recordId: record.id,
      vetId,
      clinicId: 'clinic-1',
      data: {
        weightKg: 12.5,
        clinicalNotes: 'Paciente estável',
      },
    })

    expect(updated.weightKg?.toNumber()).toBe(12.5)
    expect(updated.clinicalNotes).toBe('Paciente estável')
  })

  it('should finalize clinical record and mark appointment as COMPLETED', async () => {
    const vetId = randomUUID()
    const endDateTime = new Date('2099-01-01T10:30:00.000Z')
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date(),
      category: 'OBSERVATION',
    })

    const record = await startUseCase.execute({
      appointmentId: appointment.id,
      vetId,
      clinicId: 'clinic-1',
    })

    const finalized = await finalizeUseCase.execute({
      recordId: record.id,
      vetId,
      clinicId: 'clinic-1',
      endDateTime,
    })

    expect(finalized.finalized).toBe(true)

    const appt = await appointmentsRepository.findById(appointment.id, 'clinic-1')
    expect(appt?.status).toBe('COMPLETED')
    expect(appt?.endDateTime?.toISOString()).toBe(endDateTime.toISOString())
  })

  it('should keep the scheduled endDateTime when finalizing a booked appointment out of hours', async () => {
    const vetId = randomUUID()
    const scheduledEnd = new Date('2099-01-01T08:15:00.000Z')
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date('2099-01-01T08:00:00.000Z'),
      endDateTime: scheduledEnd, // agendamento com horário marcado (8h-8h15)
      category: 'OBSERVATION',
    })

    const record = await startUseCase.execute({
      appointmentId: appointment.id,
      vetId,
      clinicId: 'clinic-1',
    })

    // Finaliza muito depois do horário marcado (ex.: às 19h).
    await finalizeUseCase.execute({
      recordId: record.id,
      vetId,
      clinicId: 'clinic-1',
      endDateTime: new Date('2099-01-01T19:00:00.000Z'),
    })

    const appt = await appointmentsRepository.findById(appointment.id, 'clinic-1')
    expect(appt?.status).toBe('COMPLETED')
    // O fim deve permanecer o horário agendado, não o horário de finalização.
    expect(appt?.endDateTime?.toISOString()).toBe(scheduledEnd.toISOString())
  })

  it('should not allow editing a finalized record', async () => {
    const vetId = randomUUID()
    const appointment = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date(),
      category: 'OBSERVATION',
    })

    const record = await startUseCase.execute({
      appointmentId: appointment.id,
      vetId,
      clinicId: 'clinic-1',
    })

    await finalizeUseCase.execute({ recordId: record.id, vetId, clinicId: 'clinic-1' })

    await expect(updateUseCase.execute({
      recordId: record.id,
      vetId,
      clinicId: 'clinic-1',
      data: { weightKg: 15 },
    })).rejects.toThrow('Não é possível editar um prontuário finalizado')
  })

  it('should fetch patient clinical history', async () => {
    const vetId = randomUUID()
    const appointment1 = await appointmentsRepository.create({
      patientId: 'patient-1',
      vetId,
      dateTime: new Date(),
      category: 'OBSERVATION',
    })
    await startUseCase.execute({ appointmentId: appointment1.id, vetId, clinicId: 'clinic-1' })

    const history = await historyUseCase.execute({ patientId: 'patient-1' })
    expect(history.length).toBe(1)
  })
})
