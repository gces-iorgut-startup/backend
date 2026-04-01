import { PrismaDashboardRepository } from '../../infra/repositories/PrismaDashboardRepository'
import { PrismaUsersRepository } from '../../../auth/infra/repositories/PrismaUsersRepository'
import { GetDailyOverviewUseCase } from '../getDailyOverviewUseCase'
import { GetAdminMetricsUseCase } from '../getAdminMetricsUseCase'

export function makeGetDailyOverviewUseCase() {
  const dashboardRepository = new PrismaDashboardRepository()
  const usersRepository = new PrismaUsersRepository()
  return new GetDailyOverviewUseCase(dashboardRepository, usersRepository)
}

export function makeGetAdminMetricsUseCase() {
  const dashboardRepository = new PrismaDashboardRepository()
  const usersRepository = new PrismaUsersRepository()
  return new GetAdminMetricsUseCase(dashboardRepository, usersRepository)
}
