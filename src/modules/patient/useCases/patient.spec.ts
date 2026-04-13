import { describe, it, expect, beforeEach } from 'vitest'
import { CreatePatientUseCase } from './createPatientUseCase'
import { GetPatientUseCase } from './getPatientUseCase'
import { ListPatientsUseCase } from './listPatientsUseCase'
import { UpdatePatientUseCase } from './updatePatientUseCase'
import { InMemoryPatientsRepository } from '../repositories/in-memory/InMemoryPatientsRepository'
import { InMemoryTutorsRepository } from '../../tutor/repositories/in-memory/InMemoryTutorsRepository'

const CLINIC_ID = 'clinic-1'

const makeTutorInput = (overrides = {}) => ({
  clinicId: CLINIC_ID, fullName: 'Maria', cpf: '12345678901', phone: '61999990000', ...overrides,
})

const makeInput = (overrides = {}) => ({
  clinicId: CLINIC_ID, name: 'Rex', tutorId: 'tutor-fixo', species: 'Cachorro', breed: 'Labrador', ...overrides,
})

describe('CreatePatientUseCase', () => {
  it('deve criar paciente quando o tutor existe', async () => {
    const patientsRepo = new InMemoryPatientsRepository()
    const tutorsRepo = new InMemoryTutorsRepository()
    const tutor = await tutorsRepo.create(makeTutorInput())
    const sut = new CreatePatientUseCase(patientsRepo, tutorsRepo)

    const patient = await sut.execute(makeInput({ tutorId: tutor.id }))
    expect(patient.id).toBeDefined()
    expect(patient.name).toBe('Rex')
  })

  it('deve lançar 404 quando tutorId não existe', async () => {
    const sut = new CreatePatientUseCase(new InMemoryPatientsRepository(), new InMemoryTutorsRepository())
    await expect(sut.execute(makeInput())).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('GetPatientUseCase', () => {
  let patientsRepo: InMemoryPatientsRepository

  beforeEach(async () => {
    patientsRepo = new InMemoryPatientsRepository()
    await patientsRepo.create(makeInput())
  })

  it('deve retornar o paciente com tutor incluído', async () => {
    const sut = new GetPatientUseCase(patientsRepo)
    const patient = await sut.execute({ id: patientsRepo.items[0].id, clinicId: CLINIC_ID })
    expect(patient.name).toBe('Rex')
    expect(patient.tutor).toBeDefined()
  })

  it('deve lançar 404 para id inexistente', async () => {
    await expect(new GetPatientUseCase(patientsRepo).execute({ id: 'id-fake', clinicId: CLINIC_ID })).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('ListPatientsUseCase', () => {
  let patientsRepo: InMemoryPatientsRepository

  beforeEach(async () => {
    patientsRepo = new InMemoryPatientsRepository()
    await patientsRepo.create(makeInput({ name: 'Rex', tutorId: 'tutor-1' }))
    await patientsRepo.create(makeInput({ name: 'Mel', tutorId: 'tutor-1' }))
    await patientsRepo.create(makeInput({ name: 'Bob', tutorId: 'tutor-2' }))
    // Paciente de outra clínica — não deve aparecer
    await patientsRepo.create(makeInput({ name: 'Alien', tutorId: 'tutor-3', clinicId: 'clinic-2' }))
  })

  it('deve listar apenas pacientes da clínica correta', async () => {
    const result = await new ListPatientsUseCase(patientsRepo).execute({ clinicId: CLINIC_ID })
    expect(result.total).toBe(3)
  })

  it('deve filtrar por nome (search)', async () => {
    const result = await new ListPatientsUseCase(patientsRepo).execute({ clinicId: CLINIC_ID, search: 'rex' })
    expect(result.total).toBe(1)
    expect(result.patients[0].name).toBe('Rex')
  })

  it('deve filtrar por tutorId', async () => {
    const result = await new ListPatientsUseCase(patientsRepo).execute({ clinicId: CLINIC_ID, tutorId: 'tutor-1' })
    expect(result.total).toBe(2)
  })
})

describe('UpdatePatientUseCase', () => {
  it('deve atualizar o nome do paciente', async () => {
    const patientsRepo = new InMemoryPatientsRepository()
    const tutorsRepo = new InMemoryTutorsRepository()
    const tutor = await tutorsRepo.create(makeTutorInput())
    await patientsRepo.create(makeInput({ tutorId: tutor.id }))
    const updated = await new UpdatePatientUseCase(patientsRepo, tutorsRepo)
      .execute({ id: patientsRepo.items[0].id, clinicId: CLINIC_ID, name: 'Rex Jr.' })
    expect(updated.name).toBe('Rex Jr.')
  })

  it('deve atualizar dados do tutor junto com o paciente', async () => {
    const patientsRepo = new InMemoryPatientsRepository()
    const tutorsRepo = new InMemoryTutorsRepository()
    const tutor = await tutorsRepo.create(makeTutorInput())
    await patientsRepo.create(makeInput({ tutorId: tutor.id }))

    const updated = await new UpdatePatientUseCase(patientsRepo, tutorsRepo).execute({
      id: patientsRepo.items[0].id,
      clinicId: CLINIC_ID,
      observations: 'Alergia a cenoura',
      tutor: { fullName: 'Maria Souza', phone: '61988887777' },
    })

    expect(updated.observations).toBe('Alergia a cenoura')
    expect(updated.tutor.fullName).toBe('Maria Souza')
    expect(updated.tutor.phone).toBe('61988887777')
  })

  it('deve lançar 409 ao atualizar tutor com CPF já existente', async () => {
    const patientsRepo = new InMemoryPatientsRepository()
    const tutorsRepo = new InMemoryTutorsRepository()

    const tutorDoPaciente = await tutorsRepo.create(makeTutorInput())
    await tutorsRepo.create(makeTutorInput({ fullName: 'João', cpf: '99999999999' }))
    await patientsRepo.create(makeInput({ tutorId: tutorDoPaciente.id }))

    await expect(
      new UpdatePatientUseCase(patientsRepo, tutorsRepo).execute({
        id: patientsRepo.items[0].id,
        clinicId: CLINIC_ID,
        tutor: { cpf: '99999999999' },
      }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('deve lançar 404 para paciente inexistente', async () => {
    await expect(
      new UpdatePatientUseCase(new InMemoryPatientsRepository(), new InMemoryTutorsRepository())
        .execute({ id: 'id-fake', clinicId: CLINIC_ID }),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})
