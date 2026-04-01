import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryPatientsRepository } from '../patient/repositories/in-memory/InMemoryPatientsRepository'
import { InMemoryVaccinationsRepository } from './repositories/in-memory/InMemoryVaccinationsRepository'
import { AddVaccinationUseCase } from './useCases/vaccinations/addVaccinationUseCase'
import { UpdateVaccinationStatusUseCase } from './useCases/vaccinations/updateVaccinationStatusUseCase'
import { ListPatientVaccinationsUseCase } from './useCases/vaccinations/listPatientVaccinationsUseCase'
import { randomUUID } from 'crypto'

describe('Vaccinations Use Cases', () => {
  let patientsRepository: InMemoryPatientsRepository
  let vaccinationsRepository: InMemoryVaccinationsRepository
  let addVaccinationUseCase: AddVaccinationUseCase
  let updateUseCase: UpdateVaccinationStatusUseCase
  let listUseCase: ListPatientVaccinationsUseCase

  beforeEach(() => {
    patientsRepository = new InMemoryPatientsRepository()
    vaccinationsRepository = new InMemoryVaccinationsRepository()

    addVaccinationUseCase = new AddVaccinationUseCase(vaccinationsRepository, patientsRepository)
    updateUseCase = new UpdateVaccinationStatusUseCase(vaccinationsRepository)
    listUseCase = new ListPatientVaccinationsUseCase(vaccinationsRepository)
  })

  it('should add an applied vaccination', async () => {
    const patient = await patientsRepository.create({
      name: 'Rex',
      species: 'Dog',
      tutorId: 'tutor-1',
    })

    const vaccination = await addVaccinationUseCase.execute({
      patientId: patient.id,
      vaccineName: 'Raiva',
      status: 'UP_TO_DATE',
      appliedAt: new Date(),
    })

    expect(vaccination.id).toBeDefined()
    expect(vaccination.status).toBe('UP_TO_DATE')
  })

  it('should not allow UP_TO_DATE without appliedAt', async () => {
    const patient = await patientsRepository.create({
      name: 'Rex',
      species: 'Dog',
      tutorId: 'tutor-1',
    })

    await expect(addVaccinationUseCase.execute({
      patientId: patient.id,
      vaccineName: 'Raiva',
      status: 'UP_TO_DATE',
      // omitting appliedAt
    })).rejects.toThrow('Data de aplicação é obrigatória')
  })

  it('should list all patient vaccinations', async () => {
    const patient = await patientsRepository.create({
      name: 'Rex',
      species: 'Dog',
      tutorId: 'tutor-1',
    })

    await addVaccinationUseCase.execute({
      patientId: patient.id,
      vaccineName: 'V10',
      status: 'UP_TO_DATE',
      appliedAt: new Date(),
    })

    await addVaccinationUseCase.execute({
      patientId: patient.id,
      vaccineName: 'Gripe',
      status: 'PENDING',
      nextDoseAt: new Date(),
    })

    const items = await listUseCase.execute({ patientId: patient.id })
    expect(items.length).toBe(2)
  })

  it('should not allow updating status of an already UP_TO_DATE vaccination', async () => {
    const patient = await patientsRepository.create({
      name: 'Rex',
      species: 'Dog',
      tutorId: 'tutor-1',
    })

    const applied = await addVaccinationUseCase.execute({
      patientId: patient.id,
      vaccineName: 'V10',
      status: 'UP_TO_DATE',
      appliedAt: new Date(),
    })

    await expect(updateUseCase.execute({
      vaccinationId: applied.id,
      status: 'OVERDUE',
    })).rejects.toThrow('Não é possível alterar o status de uma vacina já aplicada')
  })
})
