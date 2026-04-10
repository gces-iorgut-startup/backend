import { describe, it, expect, beforeEach } from 'vitest'
import { CreateTutorUseCase } from './createTutorUseCase'
import { GetTutorUseCase } from './getTutorUseCase'
import { ListTutorsUseCase } from './listTutorsUseCase'
import { UpdateTutorUseCase } from './updateTutorUseCase'
import { InMemoryTutorsRepository } from '../repositories/in-memory/InMemoryTutorsRepository'

const makeInput = (overrides = {}) => ({
  fullName: 'Maria Silva', cpf: '12345678901', phone: '61999990000', ...overrides,
})

describe('CreateTutorUseCase', () => {
  it('deve criar tutor com sucesso', async () => {
    const repo = new InMemoryTutorsRepository()
    const tutor = await new CreateTutorUseCase(repo).execute(makeInput())
    expect(tutor.id).toBeDefined()
    expect(tutor.fullName).toBe('Maria Silva')
  })

  it('não deve criar tutor com CPF duplicado (409)', async () => {
    const repo = new InMemoryTutorsRepository()
    const sut = new CreateTutorUseCase(repo)
    await sut.execute(makeInput())
    await expect(sut.execute(makeInput())).rejects.toMatchObject({ statusCode: 409 })
  })
})

describe('GetTutorUseCase', () => {
  it('deve retornar o tutor pelo id', async () => {
    const repo = new InMemoryTutorsRepository()
    const created = await repo.create(makeInput())
    const tutor = await new GetTutorUseCase(repo).execute(created.id)
    expect(tutor.id).toBe(created.id)
  })

  it('deve lançar 404 para id inexistente', async () => {
    await expect(new GetTutorUseCase(new InMemoryTutorsRepository()).execute('id-fake')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('ListTutorsUseCase', () => {
  let repo: InMemoryTutorsRepository

  beforeEach(async () => {
    repo = new InMemoryTutorsRepository()
    await repo.create(makeInput({ fullName: 'Maria Silva', cpf: '11111111111' }))
    await repo.create(makeInput({ fullName: 'João Santos', cpf: '22222222222' }))
    await repo.create(makeInput({ fullName: 'Carlos Oliveira', cpf: '33333333333' }))
  })

  it('deve listar todos os tutores', async () => {
    const result = await new ListTutorsUseCase(repo).execute({})
    expect(result.total).toBe(3)
    expect(result.tutors).toHaveLength(3)
  })

  it('deve filtrar por nome (search case-insensitive)', async () => {
    const result = await new ListTutorsUseCase(repo).execute({ search: 'maria' })
    expect(result.total).toBe(1)
    expect(result.tutors[0].fullName).toBe('Maria Silva')
  })
})

describe('UpdateTutorUseCase', () => {
  it('deve atualizar o telefone do tutor', async () => {
    const repo = new InMemoryTutorsRepository()
    const created = await repo.create(makeInput())
    const updated = await new UpdateTutorUseCase(repo).execute({ id: created.id, phone: '61988880000' })
    expect(updated.phone).toBe('61988880000')
  })

  it('deve lançar 409 ao atualizar para CPF já cadastrado', async () => {
    const repo = new InMemoryTutorsRepository()
    const tutorA = await repo.create(makeInput({ cpf: '11111111111' }))
    await repo.create(makeInput({ cpf: '22222222222' }))

    await expect(
      new UpdateTutorUseCase(repo).execute({ id: tutorA.id, cpf: '22222222222' }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('deve lançar 404 para tutor inexistente', async () => {
    await expect(new UpdateTutorUseCase(new InMemoryTutorsRepository()).execute({ id: 'id-fake' })).rejects.toMatchObject({ statusCode: 404 })
  })
})
