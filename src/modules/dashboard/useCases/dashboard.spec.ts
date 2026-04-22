import { describe, it, expect } from 'vitest'
import { InMemoryUsersRepository } from '../../auth/repositories/in-memory/InMemoryUsersRepository'
import { InMemoryDashboardRepository } from '../repositories/in-memory/InMemoryDashboardRepository'
import { GetAdminMetricsUseCase } from './getAdminMetricsUseCase'
import { GetAdminAppointmentsTrendUseCase } from './getAdminAppointmentsTrendUseCase'

const CLINIC_ID = 'clinic-1'

describe('GetAdminMetricsUseCase', () => {
  it('deve permitir OWNER e retornar métricas com agregações consistentes', async () => {
    const dashboardRepository = new InMemoryDashboardRepository()
    const usersRepository = new InMemoryUsersRepository()
    const sut = new GetAdminMetricsUseCase(dashboardRepository, usersRepository)

    const owner = await usersRepository.create({
      name: 'Owner',
      email: 'owner@clinic.com',
      passwordHash: 'hash',
      role: 'OWNER',
      clinicId: CLINIC_ID,
    })

    const metrics = await sut.execute({ userId: owner.id, clinicId: CLINIC_ID })

    const weekStatusesTotal =
      metrics.week.scheduled +
      metrics.week.inProgress +
      metrics.week.completed +
      metrics.week.cancelled

    const monthStatusesTotal =
      metrics.month.scheduled +
      metrics.month.inProgress +
      metrics.month.completed +
      metrics.month.cancelled

    const weekCategoriesTotal =
      metrics.categories.week.observation +
      metrics.categories.week.vaccination +
      metrics.categories.week.exam +
      metrics.categories.week.surgical

    const monthCategoriesTotal =
      metrics.categories.month.observation +
      metrics.categories.month.vaccination +
      metrics.categories.month.exam +
      metrics.categories.month.surgical

    expect(metrics.appointmentsThisWeek).toBe(metrics.week.total)
    expect(metrics.appointmentsThisMonth).toBe(metrics.month.total)
    expect(metrics.week.total).toBe(weekStatusesTotal)
    expect(metrics.month.total).toBe(monthStatusesTotal)
    expect(metrics.week.total).toBe(weekCategoriesTotal)
    expect(metrics.month.total).toBe(monthCategoriesTotal)
    expect(metrics.timeline.past).toBeGreaterThanOrEqual(0)
    expect(metrics.timeline.future).toBeGreaterThanOrEqual(0)
  })

  it('deve bloquear usuário não OWNER', async () => {
    const dashboardRepository = new InMemoryDashboardRepository()
    const usersRepository = new InMemoryUsersRepository()
    const sut = new GetAdminMetricsUseCase(dashboardRepository, usersRepository)

    const vet = await usersRepository.create({
      name: 'Vet',
      email: 'vet@clinic.com',
      passwordHash: 'hash',
      role: 'VET',
      clinicId: CLINIC_ID,
    })

    await expect(sut.execute({ userId: vet.id, clinicId: CLINIC_ID })).rejects.toMatchObject({
      statusCode: 403,
    })
  })
})

describe('GetAdminAppointmentsTrendUseCase', () => {
  it('deve permitir OWNER e retornar tendência diária ordenada', async () => {
    const dashboardRepository = new InMemoryDashboardRepository()
    const usersRepository = new InMemoryUsersRepository()
    const sut = new GetAdminAppointmentsTrendUseCase(dashboardRepository, usersRepository)

    const owner = await usersRepository.create({
      name: 'Owner',
      email: 'owner-trend@clinic.com',
      passwordHash: 'hash',
      role: 'OWNER',
      clinicId: CLINIC_ID,
    })

    const days = 7
    const trend = await sut.execute({ userId: owner.id, clinicId: CLINIC_ID, days })

    expect(trend).toHaveLength(days)

    const dates = trend.map(point => point.date)

    expect(new Set(dates).size).toBe(days)
    expect(dates).toEqual([...dates].sort())

    for (const point of trend) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(point.totalAppointments).toBeGreaterThanOrEqual(0)
    }
  })

  it('deve bloquear usuário não OWNER', async () => {
    const dashboardRepository = new InMemoryDashboardRepository()
    const usersRepository = new InMemoryUsersRepository()
    const sut = new GetAdminAppointmentsTrendUseCase(dashboardRepository, usersRepository)

    const vet = await usersRepository.create({
      name: 'Vet',
      email: 'vet-trend@clinic.com',
      passwordHash: 'hash',
      role: 'VET',
      clinicId: CLINIC_ID,
    })

    await expect(
      sut.execute({
        userId: vet.id,
        clinicId: CLINIC_ID,
        days: 7,
      })
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})
